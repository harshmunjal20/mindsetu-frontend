
import React, { useState, useEffect, useCallback } from 'react';
import { MoodEntry, CurrentUser, Mood } from '../types';
import { MOOD_OPTIONS, MOOD_EMOJI_MAP } from '../constants';
import { 
  getJournalEntriesForUser, 
  addJournalEntryForUser, 
  deleteJournalEntryForUser,
  updateJournalEntryForUser
} from '../services/dataService';
import { analyzeJournalEntry } from '../services/geminiService';
import { TrashIcon, PencilSquareIcon, LightBulbIcon } from './icons';

interface JournalViewProps {
  currentUser: CurrentUser;
}

export const JournalView: React.FC<JournalViewProps> = ({ currentUser }) => {
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [currentMood, setCurrentMood] = useState<Mood>(Mood.Neutral);
  const [entryText, setEntryText] = useState('');
  const [editingEntry, setEditingEntry] = useState<MoodEntry | null>(null);
  
  const [isLoadingEntries, setIsLoadingEntries] = useState(true);
  const [errorEntries, setErrorEntries] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState<string | null>(null); // Stores ID of entry being analyzed

  const fetchEntries = useCallback(async () => {
    setIsLoadingEntries(true);
    setErrorEntries(null);
    const response = await getJournalEntriesForUser(currentUser.id);
    if (response.success && response.data) {
      setEntries(response.data);
    } else {
      setErrorEntries(response.error || "Failed to load journal entries.");
    }
    setIsLoadingEntries(false);
  }, [currentUser.id]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const handleMoodSelect = (mood: Mood) => {
    setCurrentMood(mood);
  };

  const handleSubmitEntry = async () => {
    if (entryText.trim() === '') {
      alert("Please write something in your journal.");
      return;
    }
    setIsSubmitting(true);
    
    if (editingEntry) {
      const response = await updateJournalEntryForUser(currentUser.id, editingEntry.id, { mood: currentMood, text: entryText });
      if (response.success && response.data) {
        setEntries(entries.map(e => e.id === response.data!.id ? response.data! : e));
        setEditingEntry(null);
      } else {
        alert(response.error || "Failed to update entry.");
      }
    } else {
      const entryData = { date: new Date().toISOString(), mood: currentMood, text: entryText };
      const response = await addJournalEntryForUser(currentUser.id, entryData);
      if (response.success && response.data) {
        setEntries([response.data!, ...entries]);
      } else {
        alert(response.error || "Failed to add journal entry.");
      }
    }
    setEntryText('');
    setCurrentMood(Mood.Neutral); // Reset mood
    setIsSubmitting(false);
  };

  const handleEdit = (entry: MoodEntry) => {
    setEditingEntry(entry);
    setCurrentMood(entry.mood);
    setEntryText(entry.text);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleCancelEdit = () => {
    setEditingEntry(null);
    setEntryText('');
    setCurrentMood(Mood.Neutral);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this journal entry?")) {
      setIsSubmitting(true); // Use general submitting flag
      const response = await deleteJournalEntryForUser(currentUser.id, id);
      if (response.success) {
        setEntries(entries.filter(entry => entry.id !== id));
      } else {
        alert(response.error || "Failed to delete entry.");
      }
      setIsSubmitting(false);
    }
  };

  const handleAiReflection = async (entry: MoodEntry) => {
    if (!process.env.API_KEY) {
        alert("AI features are limited. API key not found.");
        return;
    }
    setIsAnalyzing(entry.id);
    const reflection = await analyzeJournalEntry(entry.text);
    const response = await updateJournalEntryForUser(currentUser.id, entry.id, { aiReflection: reflection });
     if (response.success && response.data) {
        setEntries(entries.map(e => e.id === response.data!.id ? response.data! : e));
      } else {
        alert(response.error || "Failed to save AI reflection.");
      }
    setIsAnalyzing(null);
  };

  return (
    <div className="space-y-6">
      <div className="p-6 bg-white dark:bg-base-200-dark rounded-2xl shadow-xl space-y-6 border dark:border-brand-primary-dark/20">
        <h2 className="text-2xl font-semibold text-brand-primary dark:text-brand-primary-light">
          {editingEntry ? 'Edit Your Entry' : 'How are you feeling today?'}
        </h2>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Select your mood:</label>
          <div className="flex flex-wrap gap-2">
            {MOOD_OPTIONS.map(mood => (
              <button 
                key={mood}
                onClick={() => handleMoodSelect(mood)}
                className={`px-4 py-2 text-sm rounded-full border-2 transition-all duration-150
                  ${currentMood === mood 
                    ? 'bg-brand-primary text-white border-brand-primary dark:bg-brand-primary-light dark:text-brand-primary-dark dark:border-brand-primary-light' 
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600 hover:border-brand-secondary dark:hover:border-brand-accent'
                  }`}
              >
                {MOOD_EMOJI_MAP[mood]} {mood}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="journal-entry" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            {editingEntry ? 'Update your thoughts:' : 'Write about your day, thoughts, or feelings:'}
          </label>
          <textarea
            id="journal-entry"
            value={entryText}
            onChange={(e) => setEntryText(e.target.value)}
            rows={6}
            className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none dark:bg-slate-700 dark:text-slate-100"
            placeholder="Let your thoughts flow..."
            disabled={isSubmitting}
          />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleSubmitEntry}
            disabled={isSubmitting || entryText.trim() === ''}
            className="w-full sm:flex-1 bg-brand-secondary hover:bg-brand-secondary-dark text-white font-semibold py-3 px-4 rounded-lg shadow-md transition duration-150 ease-in-out disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (editingEntry ? 'Updating...' : 'Saving...') : (editingEntry ? 'Update Entry' : 'Save Entry')}
          </button>
          {editingEntry && (
             <button
                onClick={handleCancelEdit}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-6 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-70"
            >
                Cancel Edit
            </button>
          )}
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4 text-brand-primary dark:text-brand-primary-light">Your Journal Entries</h3>
        {isLoadingEntries && <p className="text-slate-500 dark:text-slate-400">Loading entries...</p>}
        {errorEntries && <p className="text-red-500 dark:text-red-400">{errorEntries}</p>}
        {!isLoadingEntries && !errorEntries && entries.length === 0 && (
           <div className="text-center py-10 bg-white dark:bg-base-200-dark rounded-xl shadow border dark:border-brand-primary-dark/10">
            <JournalIconSVG className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
            <p className="text-slate-500 dark:text-slate-400">No journal entries yet.</p>
            <p className="text-sm text-slate-400 dark:text-slate-500">Start by writing down how you feel today!</p>
          </div>
        )}
        {!isLoadingEntries && !errorEntries && entries.length > 0 && (
          <div className="space-y-4">
            {entries.map((entry) => (
              <div key={entry.id} className="p-4 bg-white dark:bg-base-200-dark rounded-xl shadow-lg border dark:border-brand-primary-dark/10">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center">
                    <span className="text-2xl mr-2">{MOOD_EMOJI_MAP[entry.mood]}</span>
                    <div>
                        <p className="font-semibold text-brand-primary dark:text-brand-primary-light">{entry.mood}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                        {new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                        {' at '}
                        {new Date(entry.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                        onClick={() => handleEdit(entry)} 
                        disabled={isSubmitting || !!isAnalyzing}
                        title="Edit entry"
                        className="p-1.5 text-slate-500 hover:text-brand-secondary dark:text-slate-400 dark:hover:text-brand-accent disabled:opacity-50 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700"
                      >
                        <PencilSquareIcon className="w-5 h-5"/>
                    </button>
                    <button 
                        onClick={() => handleDelete(entry.id)} 
                        disabled={isSubmitting || !!isAnalyzing}
                        title="Delete entry"
                        className="p-1.5 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50 rounded-md hover:bg-red-100 dark:hover:bg-red-900/50"
                      >
                        <TrashIcon className="w-5 h-5"/>
                    </button>
                  </div>
                </div>
                <p className="mt-2 text-slate-700 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">{entry.text}</p>
                
                {entry.aiReflection && (
                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-sm font-semibold text-brand-secondary dark:text-brand-accent mb-1">AI Reflection:</p>
                    <p className="text-sm italic text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{entry.aiReflection}</p>
                  </div>
                )}

                {!entry.aiReflection && process.env.API_KEY && (
                  <button
                    onClick={() => handleAiReflection(entry)}
                    disabled={isAnalyzing === entry.id || isSubmitting}
                    className="mt-3 flex items-center text-xs text-brand-primary hover:text-brand-primary-dark dark:text-brand-primary-light dark:hover:text-brand-accent disabled:opacity-50 border border-brand-primary/30 hover:border-brand-primary/70 px-2 py-1 rounded-md transition-colors"
                  >
                    {isAnalyzing === entry.id ? (
                      <>
                        <svg className="animate-spin -ml-0.5 mr-1.5 h-3 w-3 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <LightBulbIcon className="w-3 h-3 mr-1.5" /> Get AI Reflection
                      </>
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const JournalIconSVG: React.FC<{className?: string}> = ({ className }) => ( // Placeholder if main icon not found
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className ?? "w-5 h-5 mr-2"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
  </svg>
);