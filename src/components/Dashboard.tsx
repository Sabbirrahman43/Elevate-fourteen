import React from 'react';
import { useAppContext } from '../context/AppContext';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, subDays } from 'date-fns';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import { TrendingUp, CheckCircle2, Target, Zap } from 'lucide-react';
import { cn } from '../lib/utils';

export const Dashboard: React.FC = () => {
  const { habits, tasks, userProfile } = useAppContext();
  
  // Calculate stats
  const today = format(new Date(), 'yyyy-MM-dd');
  const todayTasks = tasks.filter(t => t.date === today);
  const completedTodayTasks = todayTasks.filter(t => t.completed).length;
  const taskProgress = todayTasks.length > 0 ? Math.round((completedTodayTasks / todayTasks.length) * 100) : 0;

  const activeHabits = habits.length;
  const habitCompletionsToday = habits.filter(h => h.logs[today]).length;
  const habitProgress = activeHabits > 0 ? Math.round((habitCompletionsToday / activeHabits) * 100) : 0;

  // Last 7 days data for chart
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(new Date(), 6 - i);
    const dateStr = format(d, 'yyyy-MM-dd');
    const label = format(d, 'EEE');
    
    const habitCount = habits.filter(h => h.logs[dateStr]).length;
    const taskCount = tasks.filter(t => t.date === dateStr && t.completed).length;
    
    return { name: label, habits: habitCount, tasks: taskCount };
  });

  const stats = [
    { label: 'Daily Focus', value: `${taskProgress}%`, icon: Target, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'Habit Streak', value: `${habitProgress}%`, icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50' },
    { label: 'Active Habits', value: activeHabits, icon: CheckCircle2, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Total Tasks', value: tasks.length, icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-50' },
  ];

  return (
    <div className="p-8 h-full overflow-y-auto bg-[#F5F5F5] text-[#141414]">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12">
          <h2 className="text-4xl font-bold tracking-tight text-[#141414]">Welcome back, {userProfile?.name || 'User'}</h2>
          <p className="text-gray-500 font-medium mt-1">Here's your progress for {format(new Date(), 'MMMM d, yyyy')}.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-black/5 flex items-center space-x-4">
              <div className={cn("p-3 rounded-2xl", stat.bg)}>
                <stat.icon className={stat.color} size={24} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-black/5 min-w-0">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold">Activity Overview</h3>
              <div className="flex items-center space-x-4 text-xs font-bold uppercase tracking-widest">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-gray-500">Habits</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-gray-500">Tasks</span>
                </div>
              </div>
            </div>
            <div className="h-[300px] w-full min-h-[300px]" style={{ height: 300, width: '100%', position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={last7Days}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 600 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 600 }}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="habits" 
                    stroke="#10b981" 
                    strokeWidth={4} 
                    dot={{ r: 6, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 8 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="tasks" 
                    stroke="#3b82f6" 
                    strokeWidth={4} 
                    dot={{ r: 6, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-black/5">
            <h3 className="text-xl font-bold mb-6">Today's Habits</h3>
            <div className="space-y-4">
              {habits.length === 0 ? (
                <p className="text-gray-400 text-center py-10">No habits tracked yet.</p>
              ) : (
                habits.map(habit => (
                  <div key={habit.id} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{habit.icon}</span>
                      <span className="font-medium text-gray-800">{habit.name}</span>
                    </div>
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center",
                      habit.logs[today] ? "bg-emerald-500 text-white" : "bg-gray-200"
                    )}>
                      {habit.logs[today] && <CheckCircle2 size={14} />}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
