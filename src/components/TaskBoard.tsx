import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { format, addDays, subDays, isSameDay } from 'date-fns';
import { Check, Plus, Trash2, Calendar as CalendarIcon, ChevronLeft, ChevronRight, ListTodo } from 'lucide-react';
import { cn } from '../lib/utils';

export const TaskBoard: React.FC = () => {
  const { tasks, addTask, toggleTask, deleteTask } = useAppContext();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [newTaskName, setNewTaskName] = useState('');

  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  const filteredTasks = tasks.filter(t => t.date === dateStr);
  const completedCount = filteredTasks.filter(t => t.completed).length;
  const totalCount = filteredTasks.length;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskName.trim()) {
      addTask(newTaskName, dateStr);
      setNewTaskName('');
    }
  };

  const handlePrevDay = () => setSelectedDate(subDays(selectedDate, 1));
  const handleNextDay = () => setSelectedDate(addDays(selectedDate, 1));

  return (
    <div className="p-8 h-full overflow-y-auto bg-[#F5F5F5] text-[#141414]">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-4xl font-bold tracking-tight text-[#141414] mb-2">Daily Tasks</h2>
            <p className="text-gray-500 font-medium">Manage your focus for today and beyond.</p>
          </div>
          <div className="flex items-center bg-white rounded-2xl p-2 shadow-sm border border-black/5">
            <button onClick={handlePrevDay} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <ChevronLeft size={20} />
            </button>
            <div className="px-4 text-center min-w-[180px]">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                {isSameDay(selectedDate, new Date()) ? 'Today' : format(selectedDate, 'EEEE')}
              </p>
              <p className="font-bold">{format(selectedDate, 'MMMM d, yyyy')}</p>
            </div>
            <button onClick={handleNextDay} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-black/5">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Progress</p>
            <p className="text-3xl font-bold">{progress}%</p>
            <div className="w-full bg-gray-100 h-2 rounded-full mt-4 overflow-hidden">
              <div 
                className="bg-emerald-500 h-full transition-all duration-500 ease-out" 
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-black/5">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Completed</p>
            <p className="text-3xl font-bold">{completedCount}</p>
            <p className="text-sm text-gray-500 mt-1">Tasks finished</p>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-black/5">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Remaining</p>
            <p className="text-3xl font-bold">{totalCount - completedCount}</p>
            <p className="text-sm text-gray-500 mt-1">Tasks to go</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-black/5 overflow-hidden">
          <div className="p-8 border-b border-gray-100">
            <form onSubmit={handleAddTask} className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={newTaskName}
                  onChange={(e) => setNewTaskName(e.target.value)}
                  className="w-full h-14 pl-12 pr-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-medium text-lg"
                  placeholder="What needs to be done?"
                />
                <Plus className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
              </div>
              <button
                type="submit"
                disabled={!newTaskName.trim()}
                className="h-14 px-8 bg-[#141414] text-white rounded-2xl font-bold hover:bg-black transition-all disabled:opacity-50 shadow-lg shadow-black/10"
              >
                Add Task
              </button>
            </form>
          </div>

          <div className="p-4">
            {filteredTasks.length === 0 ? (
              <div className="py-20 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ListTodo className="text-gray-300" size={32} />
                </div>
                <p className="text-gray-400 font-medium">No tasks for this day yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredTasks.map((task) => (
                  <div 
                    key={task.id} 
                    className={cn(
                      "group flex items-center justify-between p-4 rounded-2xl transition-all duration-200 border border-transparent",
                      task.completed ? "bg-gray-50/50" : "hover:bg-gray-50 hover:border-gray-200"
                    )}
                  >
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => toggleTask(task.id)}
                        className={cn(
                          "w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all duration-200",
                          task.completed 
                            ? "bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/20" 
                            : "bg-white border-gray-200 hover:border-emerald-400"
                        )}
                      >
                        {task.completed && <Check size={18} strokeWidth={3} />}
                      </button>
                      <span className={cn(
                        "text-lg font-medium transition-all duration-200",
                        task.completed ? "text-gray-400 line-through" : "text-gray-800"
                      )}>
                        {task.name}
                      </span>
                    </div>
                    <button 
                      onClick={() => deleteTask(task.id)}
                      className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

