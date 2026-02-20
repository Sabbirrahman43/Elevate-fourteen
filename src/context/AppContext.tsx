import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';

export type Habit = {
  id: string;
  name: string;
  category: string;
  icon: string;
  logs: Record<string, boolean>; // YYYY-MM-DD -> completed
};

export type Task = {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
};

export type AIMemory = {
  id: string;
  date: string;
  content: string;
  type: 'auto' | 'manual';
};

export type AISettings = {
  apiKey: string;
  name: string;
  persona: string;
  behavior: string;
  model: string;
  voice: string;
  avatar: string;
};

export type UserProfile = {
  name: string;
  dob: string;
  about: string;
  goals: string;
  avatar: string;
};

type AppContextType = {
  habits: Habit[];
  tasks: Task[];
  aiMemory: AIMemory[];
  aiSettings: AISettings;
  userProfile: UserProfile;
  addHabit: (name: string, category: string, icon: string) => void;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  toggleHabitLog: (id: string, date: string) => void;
  addTask: (name: string, date: string) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  addMemory: (content: string, type?: 'auto' | 'manual') => void;
  updateMemory: (id: string, content: string) => void;
  deleteMemory: (id: string) => void;
  updateAISettings: (updates: Partial<AISettings>) => void;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  importData: (data: any) => void;
  resetData: () => void;
};

const defaultSettings: AISettings = {
  apiKey: '',
  name: 'Elevate AI',
  persona: 'Coach',
  behavior: 'Motivating, direct, and disciplined.',
  model: 'gemini-3-flash-preview',
  voice: 'Zephyr',
  avatar: '',
};

const defaultUserProfile: UserProfile = {
  name: 'User',
  dob: '',
  about: '',
  goals: '',
  avatar: '',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [habits, setHabits] = useState<Habit[]>(() => {
    const saved = localStorage.getItem('elevate_habits');
    return saved ? JSON.parse(saved) : [
      { id: uuidv4(), name: 'Wake up at 05:00', category: 'Morning', icon: '⏰', logs: {} },
      { id: uuidv4(), name: 'Gym', category: 'Health', icon: '💪', logs: {} },
      { id: uuidv4(), name: 'Reading / Learning', category: 'Mind', icon: '📖', logs: {} },
      { id: uuidv4(), name: 'Budget Tracking', category: 'Finance', icon: '💰', logs: {} },
    ];
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('elevate_tasks');
    const today = format(new Date(), 'yyyy-MM-dd');
    return saved ? JSON.parse(saved) : [
      { id: uuidv4(), name: 'Review financial report', date: today, completed: false },
      { id: uuidv4(), name: 'Team meeting', date: today, completed: true },
    ];
  });

  const [aiMemory, setAiMemory] = useState<AIMemory[]>(() => {
    const saved = localStorage.getItem('elevate_ai_memory');
    return saved ? JSON.parse(saved) : [];
  });

  const [aiSettings, setAiSettings] = useState<AISettings>(() => {
    const saved = localStorage.getItem('elevate_ai_settings');
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('elevate_user_profile');
    return saved ? JSON.parse(saved) : defaultUserProfile;
  });

  useEffect(() => {
    localStorage.setItem('elevate_habits', JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem('elevate_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('elevate_ai_memory', JSON.stringify(aiMemory));
  }, [aiMemory]);

  useEffect(() => {
    localStorage.setItem('elevate_ai_settings', JSON.stringify(aiSettings));
  }, [aiSettings]);

  useEffect(() => {
    localStorage.setItem('elevate_user_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  const addHabit = (name: string, category: string, icon: string) => {
    setHabits(prev => [...prev, { id: uuidv4(), name, category, icon, logs: {} }]);
  };

  const updateHabit = (id: string, updates: Partial<Habit>) => {
    setHabits(prev => prev.map(h => h.id === id ? { ...h, ...updates } : h));
  };

  const deleteHabit = (id: string) => {
    setHabits(prev => prev.filter(h => h.id !== id));
  };

  const toggleHabitLog = (id: string, date: string) => {
    setHabits(prev => prev.map(h => {
      if (h.id === id) {
        const newLogs = { ...h.logs };
        if (newLogs[date]) {
          delete newLogs[date];
        } else {
          newLogs[date] = true;
        }
        return { ...h, logs: newLogs };
      }
      return h;
    }));
  };

  const addTask = (name: string, date: string) => {
    setTasks(prev => [...prev, { id: uuidv4(), name, date, completed: false }]);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const addMemory = (content: string, type: 'auto' | 'manual' = 'manual') => {
    setAiMemory(prev => [{ id: uuidv4(), date: new Date().toISOString(), content, type }, ...prev]);
  };

  const updateMemory = (id: string, content: string) => {
    setAiMemory(prev => prev.map(m => m.id === id ? { ...m, content } : m));
  };

  const deleteMemory = (id: string) => {
    setAiMemory(prev => prev.filter(m => m.id !== id));
  };

  const updateAISettings = (updates: Partial<AISettings>) => {
    setAiSettings(prev => ({ ...prev, ...updates }));
  };

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setUserProfile(prev => ({ ...prev, ...updates }));
  };

  const importData = (data: any) => {
    try {
      if (data.habits) setHabits(data.habits);
      if (data.tasks) setTasks(data.tasks);
      if (data.aiMemory) setAiMemory(data.aiMemory);
      if (data.aiSettings) setAiSettings(data.aiSettings);
      if (data.userProfile) setUserProfile(data.userProfile);
      alert('Data imported successfully!');
    } catch (error) {
      console.error('Import failed:', error);
      alert('Failed to import data. Invalid format.');
    }
  };

  const resetData = () => {
    if (window.confirm('Are you sure you want to reset all data? This cannot be undone.')) {
      setHabits([]);
      setTasks([]);
      setAiMemory([]);
      setAiSettings(defaultSettings);
      setUserProfile(defaultUserProfile);
      localStorage.removeItem('elevate_chat_history');
      window.location.reload();
    }
  };

  return (
    <AppContext.Provider value={{
      habits, tasks, aiMemory, aiSettings, userProfile,
      addHabit, updateHabit, deleteHabit, toggleHabitLog,
      addTask, updateTask, deleteTask, toggleTask,
      addMemory, updateMemory, deleteMemory, updateAISettings, updateUserProfile,
      importData, resetData
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};
