import { useState, useEffect } from 'react';
import { dashboardAPI } from '../api';
import toast from 'react-hot-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp, AlertTriangle } from 'lucide-react';

export default function Progress() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.get()
      .then(res => setData(res.data?.data || {}))
      .catch(() => toast.error('Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="skeleton h-64 rounded-2xl max-w-7xl mx-auto"></div>;

  const { predictions, subjectProgress, weakSubjects } = data || {};

  return (
    <div className="space-y-8 page-enter max-w-[1400px]">
      <div>
        <h1 className="text-3xl font-bold text-[#051c24] tracking-tight">Analytics & Predictions</h1>
        <p className="text-gray-500 font-medium mt-1">AI-powered insights based on your recent study habits.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm">
            <h2 className="text-xl font-bold text-[#051c24] mb-8 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#2dc1c1] flex items-center justify-center">
                <TrendingUp size={20} strokeWidth={2.5} />
              </div>
              Exam Readiness Predictions
            </h2>
            
            {predictions?.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-gray-400 font-bold">No upcoming exams to predict.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {predictions?.map(pred => {
                   // Mock chart data for visualization (actual vs predicted path)
                   const chartData = [];
                   const today = new Date();
                   const exam = new Date(pred.date);
                   const daysTotal = 30; // Just showing last 14 + future
                   
                   for(let i = -14; i <= pred.daysToExam; i += Math.max(1, Math.floor((14 + pred.daysToExam)/10))) {
                     const d = new Date(today);
                     d.setDate(d.getDate() + i);
                     
                     // If past/today, we have 'actual', otherwise 'predicted'
                     let val = 0;
                     if (i <= 0) {
                        // ramp up to current progress roughly
                        val = Math.max(0, 50 + i * 2); // fake historical curve
                     } else {
                        // project forward based on completion rate
                        val = 50 + (i * pred.completionRate / 2);
                     }
                     
                     chartData.push({
                       date: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                       actual: i <= 0 ? Math.min(100, Math.round(val)) : null,
                       predicted: i >= 0 ? Math.min(100, Math.round(val)) : null,
                       isExamDate: i >= pred.daysToExam - 1
                     });
                   }

                   return (
                     <div key={pred.examId} className="border border-gray-100 rounded-2xl p-6 bg-gray-50/50 hover:border-gray-200 transition-colors">
                       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                         <div>
                           <h3 className="font-bold text-xl text-[#051c24] mb-1">{pred.examTitle}</h3>
                           <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">{pred.subjectName} • {new Date(pred.date).toLocaleDateString()}</p>
                         </div>
                         <div className="text-right flex items-center gap-4 sm:block">
                           <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-sm font-bold border ${pred.status === 'On track' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-orange-50 text-orange-600 border-orange-100'}`}>
                             {pred.status === 'On track' ? <TrendingUp size={16} strokeWidth={2.5}/> : <AlertTriangle size={16} strokeWidth={2.5}/>}
                             {pred.status}
                           </div>
                           <div className="sm:mt-3 text-sm font-medium text-gray-500">
                              Predicted progress: <strong className="text-xl text-[#051c24]">{pred.predictedProgress}%</strong>
                           </div>
                         </div>
                       </div>
                       
                       <div className="h-56 w-full bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                         <ResponsiveContainer width="100%" height="100%">
                           <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                             <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                             <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} tickLine={false} axisLine={false} />
                             <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} tickLine={false} axisLine={false} />
                             <RechartsTooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)', fontWeight: 'bold', color: '#051c24' }} />
                             <ReferenceLine x={chartData[chartData.length-1]?.date} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'top', value: 'Exam', fill: '#ef4444', fontSize: 11, fontWeight: 'bold' }} />
                             <Line type="monotone" dataKey="actual" stroke="#2dc1c1" strokeWidth={4} dot={false} name="Actual Progress" />
                             <Line type="monotone" dataKey="predicted" stroke="#cbd5e1" strokeWidth={4} strokeDasharray="6 6" dot={false} name="Predicted Path" />
                           </LineChart>
                         </ResponsiveContainer>
                       </div>
                       <p className="text-xs font-bold text-gray-400 text-center mt-4">
                         Based on your recent <span className="text-[#2dc1c1]">{pred.completionRate}%</span> completion rate.
                       </p>
                     </div>
                   );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-8">
           <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm">
             <h2 className="text-xl font-bold text-[#051c24] mb-6">Subject Performance</h2>
             <div className="space-y-6">
               {subjectProgress?.map(sub => (
                 <div key={sub.id}>
                   <div className="flex justify-between items-end mb-3">
                     <span className="font-bold text-[#051c24]">{sub.name}</span>
                     <span className="text-sm font-bold bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100" style={{ color: sub.color }}>{sub.progress}%</span>
                   </div>
                   <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                     <div className="h-full rounded-full transition-all duration-1000 ease-out relative" style={{ width: `${sub.progress}%`, backgroundColor: sub.color }}>
                       <div className="absolute top-0 left-0 right-0 bottom-0 bg-white/20"></div>
                     </div>
                   </div>
                   <div className="text-xs font-bold text-gray-400 mt-2 text-right">
                     {sub.completedTopics} / {sub.totalTopics} topics done
                   </div>
                 </div>
               ))}
             </div>
           </div>

           {weakSubjects?.length > 0 && (
             <div className="bg-white rounded-3xl p-6 md:p-8 border-2 border-orange-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-bl-[100px] -z-10"></div>
                <h2 className="text-xl font-bold text-orange-800 flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-500 flex items-center justify-center">
                    <AlertTriangle size={20} strokeWidth={2.5} />
                  </div>
                  Focus Areas
                </h2>
                <div className="space-y-4">
                  {weakSubjects.map(sub => (
                    <div key={sub.subjectId} className="bg-orange-50/50 p-4 rounded-2xl border border-orange-100">
                      <div className="font-bold text-[#051c24] text-lg">{sub.name}</div>
                      <div className="text-sm font-medium text-orange-700 mt-1 mb-3">
                        Progress is <strong className="text-orange-800">{sub.avgProgress - sub.progress}%</strong> below average.
                      </div>
                      <div className="text-xs font-bold bg-orange-100 text-orange-800 px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5 border border-orange-200">
                        <span className="text-base">💡</span> Add +{sub.suggestedExtraHoursPerWeek} hrs/week
                      </div>
                    </div>
                  ))}
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
