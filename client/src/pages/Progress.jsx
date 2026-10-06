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
      .then(res => setData(res.data.data))
      .catch(() => toast.error('Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="skeleton h-64 rounded-2xl max-w-7xl mx-auto"></div>;

  const { predictions, subjectProgress, weakSubjects } = data || {};

  return (
    <div className="space-y-6 page-enter max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-[var(--color-primary-dark)]">Analytics & Predictions</h1>
        <p className="text-[var(--color-text-secondary)] mt-1">AI-powered insights based on your recent study habits.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <h2 className="text-xl font-bold text-[var(--color-primary-dark)] mb-6 flex items-center gap-2">
              <TrendingUp className="text-[var(--color-primary)]" /> Exam Readiness Predictions
            </h2>
            
            {predictions?.length === 0 ? (
              <p className="text-[var(--color-text-muted)] text-center py-8">No upcoming exams to predict.</p>
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
                     <div key={pred.examId} className="border border-[var(--color-border-light)] rounded-xl p-5 bg-gray-50/50">
                       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                         <div>
                           <h3 className="font-bold text-lg">{pred.examTitle}</h3>
                           <p className="text-sm text-[var(--color-text-secondary)]">{pred.subjectName} • {new Date(pred.date).toLocaleDateString()}</p>
                         </div>
                         <div className="text-right flex items-center gap-4 sm:block">
                           <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold ${pred.status === 'On track' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                             {pred.status === 'On track' ? <TrendingUp size={16}/> : <AlertTriangle size={16}/>}
                             {pred.status}
                           </div>
                           <div className="sm:mt-2 text-sm">
                              Predicted: <strong className="text-lg">{pred.predictedProgress}%</strong>
                           </div>
                         </div>
                       </div>
                       
                       <div className="h-48 w-full bg-white rounded-lg p-2 border border-[var(--color-border-light)]">
                         <ResponsiveContainer width="100%" height="100%">
                           <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                             <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                             <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
                             <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
                             <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                             <ReferenceLine x={chartData[chartData.length-1]?.date} stroke="#EF4444" strokeDasharray="3 3" label={{ position: 'top', value: 'Exam', fill: '#EF4444', fontSize: 10 }} />
                             <Line type="monotone" dataKey="actual" stroke="var(--color-primary)" strokeWidth={3} dot={false} name="Actual Progress" />
                             <Line type="monotone" dataKey="predicted" stroke="var(--color-accent)" strokeWidth={3} strokeDasharray="5 5" dot={false} name="Predicted Path" />
                           </LineChart>
                         </ResponsiveContainer>
                       </div>
                       <p className="text-xs text-[var(--color-text-muted)] text-center mt-3">
                         Based on your recent {pred.completionRate}% completion rate.
                       </p>
                     </div>
                   );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
           <div className="card p-6">
             <h2 className="text-xl font-bold text-[var(--color-primary-dark)] mb-4">Subject Performance</h2>
             <div className="space-y-6">
               {subjectProgress?.map(sub => (
                 <div key={sub.id}>
                   <div className="flex justify-between items-end mb-2">
                     <span className="font-semibold text-[var(--color-text-primary)]">{sub.name}</span>
                     <span className="text-sm font-bold" style={{ color: sub.color }}>{sub.progress}%</span>
                   </div>
                   <div className="w-full bg-[var(--color-surface-hover)] rounded-full h-2">
                     <div className="h-2 rounded-full" style={{ width: `${sub.progress}%`, backgroundColor: sub.color }}></div>
                   </div>
                   <div className="text-xs text-[var(--color-text-muted)] mt-1 text-right">
                     {sub.completedTopics} / {sub.totalTopics} topics done
                   </div>
                 </div>
               ))}
             </div>
           </div>

           {weakSubjects?.length > 0 && (
             <div className="card p-6 border-2 border-orange-100 bg-orange-50/30">
                <h2 className="text-lg font-bold text-orange-800 flex items-center gap-2 mb-4">
                  <AlertTriangle className="text-orange-500" /> Focus Areas
                </h2>
                <div className="space-y-4">
                  {weakSubjects.map(sub => (
                    <div key={sub.subjectId} className="bg-white p-3 rounded-lg border border-orange-100">
                      <div className="font-bold text-[var(--color-text-primary)]">{sub.name}</div>
                      <div className="text-sm text-orange-700 mt-1">
                        Progress is {sub.avgProgress - sub.progress}% below average.
                      </div>
                      <div className="mt-3 text-xs font-semibold bg-orange-100 text-orange-800 px-2 py-1 rounded inline-block">
                        💡 Add +{sub.suggestedExtraHoursPerWeek} hrs/week
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
