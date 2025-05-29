
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChatMessage } from '../types';
import { sendMessageToChatStream, initializeChat } from '../services/geminiService';
import { SendIcon, MindsetuLogoIcon } from './icons';

export const ChatbotView: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentAiMessageRef = useRef<ChatMessage | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    const chat = initializeChat();
    if(!chat && process.env.API_KEY) {
      setError("Failed to initialize chat. Please check your API key or network connection.");
    } else if (!process.env.API_KEY) {
      setError("AI features are limited. API key not found.");
       setMessages([{
        id: 'initial-error',
        text: "Hello! I'm Mindsetu. My advanced AI capabilities are currently limited as an API key is not configured. I can still offer some basic support.",
        sender: 'ai',
        timestamp: Date.now(),
      }]);
    } else {
      setMessages([{
        id: 'initial-ai',
        text: "Hello! I'm Mindsetu, your AI companion. How are you feeling today? Feel free to share anything on your mind.",
        sender: 'ai',
        timestamp: Date.now(),
      }]);
    }
  }, []);


  const handleSend = async () => {
    if (input.trim() === '' || isLoading) return;

    const newUserMessage: ChatMessage = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, newUserMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);
    
    currentAiMessageRef.current = {
      id: (Date.now() + 1).toString(),
      text: '',
      sender: 'ai',
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, currentAiMessageRef.current!]);

    await sendMessageToChatStream(
      newUserMessage.text,
      (chunk) => {
        if (currentAiMessageRef.current) {
          currentAiMessageRef.current.text += chunk;
          setMessages((prev) => prev.map(msg => msg.id === currentAiMessageRef.current!.id ? {...currentAiMessageRef.current!} : msg));
        }
      },
      (err) => {
        setError(err);
        if(currentAiMessageRef.current){ 
            setMessages(prev => prev.filter(msg => msg.id !== currentAiMessageRef.current!.id));
        }
        const aiErrorMessage: ChatMessage = {
            id: (Date.now() + 2).toString(),
            text: `Sorry, I encountered an issue: ${err}`,
            sender: 'ai',
            timestamp: Date.now(),
        };
        setMessages(prev => [...prev, aiErrorMessage]);
      }
    );
    setIsLoading(false);
    currentAiMessageRef.current = null;
  };


  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] max-h-[700px] bg-white dark:bg-base-200-dark shadow-xl rounded-2xl overflow-hidden border border-slate-200 dark:border-brand-primary-dark/30">
      <div className="flex-grow p-6 space-y-4 overflow-y-auto">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-md ${
              msg.sender === 'user' 
                ? 'bg-brand-primary text-white rounded-br-none dark:bg-brand-primary-dark' 
                : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-bl-none'
            }`}>
              {msg.sender === 'ai' && (
                 <MindsetuLogoIcon 
                    className="w-5 h-5 inline mr-1 mb-0.5"
                    primaryColorClass="text-brand-secondary dark:text-brand-accent"
                    secondaryColorClass="text-brand-secondary-dark dark:text-brand-accent-dark"
                  />
              )}
              <p className="text-sm whitespace-pre-wrap">{msg.text ? msg.text : "..."}</p>
               <p className={`text-xs mt-1 opacity-70 text-right ${msg.sender === 'user' ? 'text-indigo-100 dark:text-indigo-200' : 'text-slate-500 dark:text-slate-400'}`}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      {error && <p className="p-4 text-sm text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/50">{error}</p>}
      <div className="p-4 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend()}
            placeholder="Type your message..."
            className="flex-grow p-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-brand-secondary dark:focus:ring-brand-accent focus:border-transparent outline-none dark:bg-slate-700 dark:text-slate-100 transition-shadow"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || input.trim() === ''}
            className="p-3 bg-brand-secondary hover:bg-brand-secondary-dark text-white rounded-xl focus:ring-2 focus:ring-brand-secondary focus:ring-offset-2 dark:focus:ring-offset-base-200-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Send message"
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <SendIcon className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};