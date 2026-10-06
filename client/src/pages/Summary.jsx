import { useState, useEffect } from 'react';
import { summaryAPI } from '../api';
import toast from 'react-hot-toast';
import { Calendar as CalendarIcon, CheckCircle2, Clock, Zap, Target } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

export default function Summary() {
  const [dailyData, setDailyData] = useState(null);
  const [weeklyData, setWeeklyData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      summaryAPI.daily(),
      summaryAPI.weekly()
    ]).then(([dRes, wRes]) => {
      setDailyData(dRes.data.data);
      setWeeklyData(wRes.data.data);
    }).catch(() => {
      toast.error('Failed to load summary');
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="skeleton h-64 rounded-2xl max-w-7xl mx-auto"></div>;

  return (
    <div className="space-y-8 page-enter max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-[var(--color-primary-dark)]">Study Summary</h1>
        <p className="text-[var(--color-text-secondary)] mt-1">Your daily and weekly recap.</p>
      </div>

      {/* AI / Coach Message */}
      <div className="bg-gradient-to-r from-[var(--color-primary-dark)] to-[var(--color-primary)] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="relative z-10 flex gap-4 items-start">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center shrink-0 backdrop-blur-sm">
             <Zap size={24} className="text-[var(--color-accent)]" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white/70 uppercase tracking-wider mb-2">Coach's Note</h2>
            <p className="text-xl font-medium leading-relaxed italic">
              "{dailyData?.message || weeklyData?.message || "Keep up the good work!"}"
            </p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Daily Summary */}
        <div className="card p-6">
          <h2 className="text-xl font-bold text-[var(--color-primary-dark)] mb-6 flex items-center gap-2">
             <CalendarIcon className="text-[var(--color-primary)]" /> Today's Recap
          </h2>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
             <div className="bg-[var(--color-surface-hover)] rounded-xl p-4 text-center">
               <div className="text-3xl font-bold text-[var(--color-primary-dark)]">{dailyData?.hoursStudied}</div>
               <div className="text-xs text-[var(--color-text-secondary)] mt-1 font-medium">HOURS STUDIED</div>
             </div>
             <div className="bg-[var(--color-surface-hover)] rounded-xl p-4 text-center">
               <div className="text-3xl font-bold text-[var(--color-primary-dark)]">{dailyData?.topicsCompleted}</div>
               <div className="text-xs text-[var(--color-text-secondary)] mt-1 font-medium">TOPICS DONE</div>
             </div>
          </div>
          
          <div className="space-y-3">
             <div className="flex items-center justify-between p-3 border border-[var(--color-border-light)] rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={18} className="text-emerald-500" />
                  <span className="font-medium text-sm">Completed Sessions</span>
                </div>
                <span className="font-bold">{dailyData?.sessions.filter(s => s.status === 'COMPLETED').length || 0}</span>
             </div>
             <div className="flex items-center justify-between p-3 border border-[var(--color-border-light)] rounded-lg">
                <div className="flex items-center gap-3">
                  <Clock size={18} className="text-blue-500" />
                  <span className="font-medium text-sm">Planned Sessions</span>
                </div>
                <span className="font-bold">{dailyData?.planned || 0}</span>
             </div>
             <div className="flex items-center justify-between p-3 border border-[var(--color-border-light)] rounded-lg">
                <div className="flex items-center gap-3">
                  <Target size={18} className="text-red-500" />
                  <span className="font-medium text-sm">Missed Sessions</span>
                </div>
                <span className="font-bold">{dailyData?.missed || 0}</span>
             </div>
          </div>
        </div>

        {/* Weekly Summary */}
        <div className="card p-6">
          <h2 className="text-xl font-bold text-[var(--color-primary-dark)] mb-6 flex items-center gap-2">
             <CalendarIcon className="text-[var(--color-primary)]" /> Past 7 Days
          </h2>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
             <div className="bg-[var(--color-surface-hover)] rounded-xl p-4 text-center">
               <div className="text-3xl font-bold text-[var(--color-primary-dark)]">{weeklyData?.hoursStudied}</div>
               <div className="text-xs text-[var(--color-text-secondary)] mt-1 font-medium">HOURS STUDIED</div>
             </div>
             <div className="bg-[var(--color-surface-hover)] rounded-xl p-4 text-center">
               <div className="text-3xl font-bold text-[var(--color-primary-dark)]">{weeklyData?.topicsCompleted}</div>
               <div className="text-xs text-[var(--color-text-secondary)] mt-1 font-medium">TOPICS DONE</div>
             </div>
          </div>

          <div className="h-48 w-full mt-4">
             {weeklyData?.dailyBreakdown && (
                <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={weeklyData.dailyBreakdown} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                     <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748B' }} />
                     <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748B' }} />
                     <RechartsTooltip cursor={{ fill: '#F1F5F9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                     <Bar dataKey="completed" name="Hours Completed" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                   </BarChart>
                </ResponsiveContainer>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
