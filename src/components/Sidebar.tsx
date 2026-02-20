import React from 'react';
import { LayoutDashboard, CheckSquare, ListTodo, Bot, Settings, BookOpen, User } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAppContext } from '../context/AppContext';

type SidebarProps = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
};

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { userProfile } = useAppContext();
  
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'habits', label: 'Habits', icon: CheckSquare },
    { id: 'tasks', label: 'Daily Tasks', icon: ListTodo },
    { id: 'ai', label: 'Elevate AI', icon: Bot },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="w-64 bg-[#141414] text-[#E4E3E0] h-screen flex flex-col border-r border-white/10">
      <div className="p-6">
        <h1 className="text-2xl font-bold tracking-tighter text-white">Elevate<span className="text-emerald-500">.</span></h1>
        <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest">Progress Tracker</p>
      </div>
      <nav className="flex-1 px-4 space-y-2">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium",
                isActive 
                  ? "bg-emerald-500/10 text-emerald-400" 
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon size={18} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
      <div className="p-6 border-t border-white/10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white font-bold text-sm overflow-hidden shadow-lg shadow-emerald-900/20">
            {userProfile?.avatar ? (
              <img src={userProfile.avatar} alt={userProfile.name} className="w-full h-full object-cover" />
            ) : (
              <span>{userProfile?.name?.charAt(0).toUpperCase() || 'U'}</span>
            )}
          </div>
          <div className="text-sm overflow-hidden">
            <p className="font-medium text-white truncate">{userProfile?.name || 'User'}</p>
            <p className="text-xs text-gray-500 truncate">Member</p>
          </div>
        </div>
      </div>
    </div>
  );
};
