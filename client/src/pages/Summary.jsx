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
    <div className="space-y-8 page-enter max-w-[1400px]">
      <div>
        <h1 className="text-3xl font-bold text-[#051c24] tracking-tight">Study Summary</h1>
        <p className="text-gray-500 font-medium mt-1">Your daily and weekly recap.</p>
      </div>

      {/* AI / Coach Message */}
      <div className="bg-[#051c24] rounded-3xl p-8 md:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#2dc1c1] opacity-20 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-10 w-40 h-40 bg-[#2dc1c1] opacity-10 rounded-full blur-2xl transform -translate-y-1/2"></div>
        <div className="relative z-10 flex gap-6 items-start">
          <div className="w-14 h-14 bg-[#2dc1c1]/20 rounded-2xl flex items-center justify-center shrink-0 backdrop-blur-md border border-[#2dc1c1]/30">
             <Zap size={28} strokeWidth={2.5} className="text-[#2dc1c1]" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Coach's Note</h2>
            <p className="text-2xl font-medium leading-relaxed italic text-gray-100">
              "{dailyData?.message || weeklyData?.message || "Keep up the good work!"}"
            </p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Daily Summary */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm">
          <h2 className="text-xl font-bold text-[#051c24] mb-8 flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#2dc1c1] flex items-center justify-center">
               <CalendarIcon size={20} strokeWidth={2.5} />
             </div>
             Today's Recap
          </h2>
          
          <div className="grid grid-cols-2 gap-4 mb-8">
             <div className="bg-gray-50 rounded-2xl p-6 text-center border border-gray-100">
               <div className="text-4xl font-bold text-[#051c24]">{dailyData?.hoursStudied}</div>
               <div className="text-xs text-gray-500 mt-2 font-bold uppercase tracking-wider">Hours Studied</div>
             </div>
             <div className="bg-gray-50 rounded-2xl p-6 text-center border border-gray-100">
               <div className="text-4xl font-bold text-[#051c24]">{dailyData?.topicsCompleted}</div>
               <div className="text-xs text-gray-500 mt-2 font-bold uppercase tracking-wider">Topics Done</div>
             </div>
          </div>
          
          <div className="space-y-4">
             <div className="flex items-center justify-between p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 size={20} strokeWidth={2.5} />
                  </div>
                  <span className="font-bold text-[#051c24]">Completed Sessions</span>
                </div>
                <span className="font-bold text-xl text-[#051c24]">{dailyData?.sessions.filter(s => s.status === 'COMPLETED').length || 0}</span>
             </div>
             <div className="flex items-center justify-between p-4 bg-blue-50/50 border border-blue-100 rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                    <Clock size={20} strokeWidth={2.5} />
                  </div>
                  <span className="font-bold text-[#051c24]">Planned Sessions</span>
                </div>
                <span className="font-bold text-xl text-[#051c24]">{dailyData?.planned || 0}</span>
             </div>
             <div className="flex items-center justify-between p-4 bg-red-50/50 border border-red-100 rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                    <Target size={20} strokeWidth={2.5} />
                  </div>
                  <span className="font-bold text-[#051c24]">Missed Sessions</span>
                </div>
                <span className="font-bold text-xl text-[#051c24]">{dailyData?.missed || 0}</span>
             </div>
          </div>
        </div>

        {/* Weekly Summary */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm">
          <h2 className="text-xl font-bold text-[#051c24] mb-8 flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center">
               <CalendarIcon size={20} strokeWidth={2.5} />
             </div>
             Past 7 Days
          </h2>
          
          <div className="grid grid-cols-2 gap-4 mb-8">
             <div className="bg-gray-50 rounded-2xl p-6 text-center border border-gray-100">
               <div className="text-4xl font-bold text-[#051c24]">{weeklyData?.hoursStudied}</div>
               <div className="text-xs text-gray-500 mt-2 font-bold uppercase tracking-wider">Hours Studied</div>
             </div>
             <div className="bg-gray-50 rounded-2xl p-6 text-center border border-gray-100">
               <div className="text-4xl font-bold text-[#051c24]">{weeklyData?.topicsCompleted}</div>
               <div className="text-xs text-gray-500 mt-2 font-bold uppercase tracking-wider">Topics Done</div>
             </div>
          </div>

          <div className="h-56 w-full mt-6 bg-gray-50 rounded-2xl p-4 border border-gray-100">
             {weeklyData?.dailyBreakdown && (
                <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={weeklyData.dailyBreakdown} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                     <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} />
                     <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} />
                     <RechartsTooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)', fontWeight: 'bold', color: '#051c24' }} />
                     <Bar dataKey="completed" name="Hours Completed" fill="#2dc1c1" radius={[6, 6, 0, 0]} />
                   </BarChart>
                </ResponsiveContainer>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
