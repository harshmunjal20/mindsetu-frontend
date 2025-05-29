
import { MoodEntry, ApiResponse, User, Mood, StudentAttitudeStats, UserType } from '../types'; 
import { getUsers } from './authService';
import { POSITIVE_MOODS, NEGATIVE_MOODS, MOOD_OPTIONS } from '../constants';


const JOURNAL_STORAGE_KEY = 'mindsetu_journal_entries';

// --- Journal Entries ---
const getRawJournalEntries = (): MoodEntry[] => {
  const entriesJson = localStorage.getItem(JOURNAL_STORAGE_KEY);
  return entriesJson ? JSON.parse(entriesJson) : [];
};
// Export for potential internal use or debugging, though not typically part of public API
export { getRawJournalEntries };


const saveRawJournalEntries = (entries: MoodEntry[]): void => {
  localStorage.setItem(JOURNAL_STORAGE_KEY, JSON.stringify(entries));
};

// Initialize with mock journal entries if none exist
const initializeMockJournalEntries = () => {
  const existingEntries = getRawJournalEntries();
  if (existingEntries.length > 0) {
    return; // Don't add more if some exist
  }

  const users = getUsers();
  const students = users.filter(u => u.userType === UserType.Student && u.isActivated);
  const mockEntries: MoodEntry[] = [];
  const today = new Date();

  students.forEach(student => {
    // Student 1 (bob@greenwood.edu) - Mostly positive
    if (student.email === 'bob@greenwood.edu') {
      for (let i = 0; i < 15; i++) { // 15 entries
        const date = new Date(today);
        date.setDate(today.getDate() - i * 2); // Every other day
        const mood = i % 4 === 0 ? NEGATIVE_MOODS[Math.floor(Math.random() * NEGATIVE_MOODS.length)] : POSITIVE_MOODS[Math.floor(Math.random() * POSITIVE_MOODS.length)];
        mockEntries.push({
          id: `journal_${student.id}_${i}`,
          userId: student.id,
          date: date.toISOString(),
          mood: mood,
          text: `Feeling ${mood.toLowerCase()} today. Day was mostly ${i % 3 === 0 ? 'good' : 'okay'}.`,
          aiReflection: i % 5 === 0 ? "It's good you're aware of your feelings." : undefined
        });
      }
    }
    // Student 2 (charlie@greenwood.edu) - Mixed, leaning negative
    else if (student.email === 'charlie@greenwood.edu') {
      for (let i = 0; i < 20; i++) { // 20 entries
        const date = new Date(today);
        date.setDate(today.getDate() - i - 5); // Offset start day
        const mood = i % 3 === 0 ? POSITIVE_MOODS[Math.floor(Math.random() * POSITIVE_MOODS.length)] : NEGATIVE_MOODS[Math.floor(Math.random() * NEGATIVE_MOODS.length)];
        mockEntries.push({
          id: `journal_${student.id}_${i}`,
          userId: student.id,
          date: date.toISOString(),
          mood: mood,
          text: `Workload is ${mood === Mood.Stressed ? 'heavy' : 'manageable'}. ${mood.toLowerCase()} feelings.`,
        });
      }
    }
    // Student 3 (diana@greenwood.edu) - (Initially not activated, let's assume activated for journal entries for demo)
    // Let's assume student 'student3gw' (Diana) gets activated and makes some entries.
    // For demo, let's make Diana have fewer entries and be more neutral/calm.
    else if (student.email === 'diana@greenwood.edu') {
         for (let i = 0; i < 7; i++) { 
            const date = new Date(today);
            date.setDate(today.getDate() - i * 3); 
            const mood = [Mood.Calm, Mood.Neutral, Mood.Grateful][i % 3];
            mockEntries.push({
                id: `journal_${student.id}_${i}`,
                userId: student.id,
                date: date.toISOString(),
                mood: mood,
                text: `A ${mood.toLowerCase()} day. Reflecting on things.`,
            });
        }
    }
     // Student 4 (edward@greenwood.edu) - Mostly Stressed/Anxious
    else if (student.email === 'edward@greenwood.edu') {
      for (let i = 0; i < 18; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i * 1); // daily
        const mood = i % 5 === 0 ? Mood.Calm : (i % 2 === 0 ? Mood.Stressed : Mood.Anxious);
        mockEntries.push({
          id: `journal_${student.id}_${i}`,
          userId: student.id,
          date: date.toISOString(),
          mood: mood,
          text: `Feeling quite ${mood.toLowerCase()}. Deadlines approaching.`,
        });
      }
    }
    // Student 5 (fiona@greenwood.edu) - More entries, generally happy/excited but with some stress
    else if (student.email === 'fiona@greenwood.edu') {
      for (let i = 0; i < 25; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i * 1); // daily for a bit
        let mood: Mood;
        if (i < 5) mood = Mood.Excited; // Start of something new
        else if (i < 15) mood = Mood.Happy; // Generally good period
        else if (i < 20) mood = Mood.Stressed; // Exams or busy period
        else mood = Mood.Grateful; // Reflection period
        
        mockEntries.push({
          id: `journal_${student.id}_${i}`,
          userId: student.id,
          date: date.toISOString(),
          mood: mood,
          text: `Lots happening. Feeling ${mood.toLowerCase()}. Today was about project X.`,
        });
      }
    }


    // Student from Oakwood (eve@oakwood.edu) - Few entries, mostly neutral
    else if (student.email === 'eve@oakwood.edu') {
        for (let i = 0; i < 5; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() - i * 5); // Sparsely
            mockEntries.push({
                id: `journal_${student.id}_${i}`,
                userId: student.id,
                date: date.toISOString(),
                mood: Mood.Neutral,
                text: `Just checking in. Neutral mood.`,
            });
        }
    }
  });
  saveRawJournalEntries(mockEntries);
};
initializeMockJournalEntries();


export const getJournalEntriesForUser = async (userId: string): Promise<ApiResponse<MoodEntry[]>> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const allEntries = getRawJournalEntries();
      const userEntries = allEntries
        .filter(entry => entry.userId === userId)
        .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      resolve({ success: true, data: userEntries });
    }, 300);
  });
};

export const addJournalEntryForUser = async (userId: string, entryData: Omit<MoodEntry, 'id' | 'userId' | 'aiReflection'>): Promise<ApiResponse<MoodEntry>> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const allEntries = getRawJournalEntries();
      const newEntry: MoodEntry = {
        ...entryData,
        id: Date.now().toString(),
        userId: userId,
      };
      allEntries.push(newEntry);
      saveRawJournalEntries(allEntries);
      resolve({ success: true, data: newEntry });
    }, 300);
  });
};

export const updateJournalEntryForUser = async (userId: string, entryId: string, updatedData: Partial<MoodEntry>): Promise<ApiResponse<MoodEntry>> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const allEntries = getRawJournalEntries();
      const entryIndex = allEntries.findIndex(entry => entry.id === entryId && entry.userId === userId);

      if (entryIndex === -1) {
        resolve({ success: false, error: 'Journal entry not found or access denied.' });
        return;
      }
      
      allEntries[entryIndex] = { ...allEntries[entryIndex], ...updatedData };
      saveRawJournalEntries(allEntries);
      resolve({ success: true, data: allEntries[entryIndex] });
    }, 300);
  });
};


export const deleteJournalEntryForUser = async (userId: string, entryId: string): Promise<ApiResponse<null>> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let allEntries = getRawJournalEntries();
      const initialLength = allEntries.length;
      allEntries = allEntries.filter(entry => !(entry.id === entryId && entry.userId === userId));

      if (allEntries.length === initialLength) {
        resolve({ success: false, error: 'Journal entry not found or access denied.' });
        return;
      }
      saveRawJournalEntries(allEntries);
      resolve({ success: true, data: null });
    }, 300);
  });
};


export const getStudentAttitudeStatsForInstitute = async (instituteName: string): Promise<ApiResponse<StudentAttitudeStats>> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const allUsers = getUsers();
      const allJournalEntries = getRawJournalEntries();

      const instituteStudents = allUsers.filter(
        user => user.instituteName === instituteName && user.userType === UserType.Student && user.isActivated
      );

      if (instituteStudents.length === 0) {
        resolve({ 
          success: true, // Success, but no data to analyze
          data: { positivePercent: 0, negativePercent: 0, neutralPercent: 0, analyzedStudentCount: 0, totalStudentsInInstitute: 0 } 
        });
        return;
      }

      let positiveAttitudeStudents = 0;
      let negativeAttitudeStudents = 0;
      let neutralAttitudeStudents = 0;
      let studentsWithSufficientEntries = 0;

      instituteStudents.forEach(student => {
        const studentEntries = allJournalEntries.filter(entry => entry.userId === student.id);
        if (studentEntries.length >= 3) { // Require at least 3 entries to classify attitude
          studentsWithSufficientEntries++;
          let positiveCount = 0;
          let negativeCount = 0;
          studentEntries.forEach(entry => {
            if (POSITIVE_MOODS.includes(entry.mood)) positiveCount++;
            else if (NEGATIVE_MOODS.includes(entry.mood)) negativeCount++;
          });

          if (positiveCount > negativeCount && positiveCount >= studentEntries.length * 0.6) { // Predominantly positive
            positiveAttitudeStudents++;
          } else if (negativeCount > positiveCount && negativeCount >= studentEntries.length * 0.5) { // Predominantly negative
            negativeAttitudeStudents++;
          } else {
            neutralAttitudeStudents++; // Mixed or neutral
          }
        }
      });
      
      const totalAnalyzed = studentsWithSufficientEntries;
      const stats: StudentAttitudeStats = {
        positivePercent: totalAnalyzed > 0 ? (positiveAttitudeStudents / totalAnalyzed) * 100 : 0,
        negativePercent: totalAnalyzed > 0 ? (negativeAttitudeStudents / totalAnalyzed) * 100 : 0,
        neutralPercent: totalAnalyzed > 0 ? (neutralAttitudeStudents / totalAnalyzed) * 100 : 0,
        analyzedStudentCount: totalAnalyzed,
        totalStudentsInInstitute: instituteStudents.length
      };

      resolve({ success: true, data: stats });
    }, 400);
  });
};
