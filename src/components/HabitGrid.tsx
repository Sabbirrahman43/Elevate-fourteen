import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, subMonths, addMonths } from 'date-fns';
import { Check, Plus, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';

export const HabitGrid: React.FC = () => {
  const { habits, toggleHabitLog, addHabit, deleteHabit } = useAppContext();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitIcon, setNewHabitIcon] = useState('✨');

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newHabitName.trim()) {
      addHabit(newHabitName, 'General', newHabitIcon);
      setNewHabitName('');
    }
  };

  return (
    <div className="p-8 h-full overflow-y-auto bg-[#F5F5F5] text-[#141414]">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-4xl font-bold tracking-tight text-[#141414]">Habit Tracker</h2>
        <div className="flex items-center space-x-4">
          <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-black/5 transition-colors">
            &larr;
          </button>
          <span className="text-xl font-semibold uppercase tracking-widest min-w-[150px] text-center">
            {format(currentDate, 'MMMM yyyy')}
          </span>
          <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-black/5 transition-colors">
            &rarr;
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-gray-50 border-b border-gray-200">
              <tr>
                <th scope="col" className="px-6 py-4 font-semibold text-gray-700 min-w-[250px] sticky left-0 z-10 bg-gray-50 border-r border-gray-200">
                  My Habits
                </th>
                {daysInMonth.map((day) => (
                  <th key={day.toISOString()} scope="col" className="px-2 py-4 font-medium text-gray-500 text-center min-w-[40px]">
                    <div className="flex flex-col items-center">
                      <span className="text-[10px]">{format(day, 'EE').charAt(0)}</span>
                      <span className="text-sm font-bold text-gray-800">{format(day, 'd')}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {habits.map((habit, index) => {
                const completedCount = daysInMonth.filter(day => habit.logs[format(day, 'yyyy-MM-dd')]).length;
                const progress = Math.round((completedCount / daysInMonth.length) * 100);

                return (
                  <tr key={habit.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-3 font-medium text-gray-900 sticky left-0 z-10 bg-white group-hover:bg-gray-50/50 border-r border-gray-100 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">{habit.icon}</span>
                        <span>{habit.name}</span>
                      </div>
                      <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-xs text-gray-400 font-mono">{progress}%</span>
                        <button onClick={() => deleteHabit(habit.id)} className="text-red-400 hover:text-red-600 p-1">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                    {daysInMonth.map((day) => {
                      const dateStr = format(day, 'yyyy-MM-dd');
                      const isCompleted = habit.logs[dateStr];
                      const isToday = isSameDay(day, new Date());

                      return (
                        <td key={dateStr} className={cn("px-2 py-3 text-center", isToday && "bg-emerald-50/50")}>
                          <button
                            onClick={() => toggleHabitLog(habit.id, dateStr)}
                            className={cn(
                              "w-6 h-6 rounded border flex items-center justify-center mx-auto transition-all duration-200",
                              isCompleted 
                                ? "bg-emerald-500 border-emerald-600 text-white shadow-sm" 
                                : "bg-white border-gray-300 hover:border-emerald-400"
                            )}
                          >
                            {isCompleted && <Check size={14} strokeWidth={3} />}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <form onSubmit={handleAddHabit} className="flex items-center space-x-4 max-w-md">
            <input
              type="text"
              value={newHabitIcon}
              onChange={(e) => setNewHabitIcon(e.target.value)}
              className="w-12 h-10 text-center border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              placeholder="Icon"
              maxLength={2}
            />
            <input
              type="text"
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
              className="flex-1 h-10 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              placeholder="Add a new habit..."
            />
            <button
              type="submit"
              disabled={!newHabitName.trim()}
              className="h-10 px-4 bg-[#141414] text-white rounded-lg hover:bg-black transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              <Plus size={18} />
              <span>Add</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
