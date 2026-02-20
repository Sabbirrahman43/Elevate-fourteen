/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { HabitGrid } from './components/HabitGrid';
import { TaskBoard } from './components/TaskBoard';
import { AIInterface } from './components/AIInterface';
import { Settings } from './components/Settings';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'habits': return <HabitGrid />;
      case 'tasks': return <TaskBoard />;
      case 'ai': return <AIInterface />;
      case 'settings': return <Settings />;
      default: return <Dashboard />;
    }
  };

  return (
    <AppProvider>
      <div className="flex h-screen bg-[#F5F5F5] font-sans selection:bg-emerald-500/30">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1 relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="h-full"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </AppProvider>
  );
}
