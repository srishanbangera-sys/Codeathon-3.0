import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardAPI, scheduleAPI } from '../api';
import { useAuth } from '../contexts/AuthContext';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { Flame, Clock, BookOpen, Calendar, ArrowRight, AlertTriangle, CheckCircle2, Target } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [missedChecked, setMissedChecked] = useState(false);

  const fetchDashboard = async () => {
    try {
      const res = await dashboardAPI.get();
      setData(res.data.data);
    } catch (err) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check missed sessions first, then load dashboard
    if (!missedChecked) {
      scheduleAPI.checkMissed().then((res) => {
        if (res.data.data.missedCount > 0) {
          toast.error(`${res.data.data.missedCount} sessions were marked as missed. Please regenerate your schedule.`);
        }
        setMissedChecked(true);
        fetchDashboard();
      }).catch(() => {
        setMissedChecked(true);
        fetchDashboard();
      });
    }
  }, [missedChecked]);

  const handleMarkComplete = async (sessionId) => {
    try {
      await scheduleAPI.updateSession(sessionId, { status: 'COMPLETED' });
      toast.success('Session marked as complete!');
      fetchDashboard();
    } catch (err) {
      toast.error('Failed to update session');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-8 w-64 mb-8"></div>
        <div className="grid md:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="skeleton h-32 rounded-2xl"></div>)}
        </div>
        <div className="skeleton h-64 rounded-2xl"></div>
      </div>
    );
  }

  const {
    overallProgress,
    subjectProgress,
    todaySessions,
    upcomingExams,
    pendingTopics,
    weakSubjects,
    streak,
    hoursThisWeek,
    weeklyData,
    completionDonut
  } = data || {};

  const donutData = [
    { name: 'Completed', value: completionDonut.completed, color: '#10B981' },
    { name: 'Missed', value: completionDonut.missed, color: '#EF4444' },
    { name: 'Planned', value: completionDonut.planned, color: '#3B82F6' },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-8 page-enter">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-primary-dark)]">Welcome back, {user?.name.split(' ')[0]}! 👋</h1>
          <p className="text-[var(--color-text-secondary)] mt-2">Here's your study progress and upcoming tasks.</p>
        </div>
        <Link to="/calendar" className="btn btn-primary">
          VIEW FULL SCHEDULE
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <div className="card p-5 flex flex-col justify-between">
           <div className="flex justify-between items-start mb-4">
             <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
               <Target size={20} />
             </div>
             <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">OVERALL</span>
           </div>
           <div>
             <div className="text-3xl font-bold text-[var(--color-primary-dark)]">{overallProgress}%</div>
             <div className="text-sm text-[var(--color-text-secondary)] mt-1">Course completion</div>
           </div>
        </div>

        <div className="card p-5 flex flex-col justify-between">
           <div className="flex justify-between items-start mb-4">
             <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
               <Flame size={20} />
             </div>
             <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-full">STREAK</span>
           </div>
           <div>
             <div className="text-3xl font-bold text-[var(--color-primary-dark)]">{streak} <span className="text-lg">days</span></div>
             <div className="text-sm text-[var(--color-text-secondary)] mt-1">Keep it up!</div>
           </div>
        </div>

        <div className="card p-5 flex flex-col justify-between">
           <div className="flex justify-between items-start mb-4">
             <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
               <Clock size={20} />
             </div>
             <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">THIS WEEK</span>
           </div>
           <div>
             <div className="text-3xl font-bold text-[var(--color-primary-dark)]">{hoursThisWeek} <span className="text-lg">hrs</span></div>
             <div className="text-sm text-[var(--color-text-secondary)] mt-1">Total study time</div>
           </div>
        </div>

        <div className="card p-5 flex flex-col justify-between">
           <div className="flex justify-between items-start mb-4">
             <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
               <BookOpen size={20} />
             </div>
             <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-full">TOPICS</span>
           </div>
           <div>
             <div className="text-3xl font-bold text-[var(--color-primary-dark)]">{pendingTopics?.length || 0}</div>
             <div className="text-sm text-[var(--color-text-secondary)] mt-1">Pending items</div>
           </div>
        </div>
      </div>

      {weakSubjects?.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex gap-4 items-start">
          <div className="p-2 bg-orange-100 rounded-full text-orange-600 shrink-0">
            <AlertTriangle size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-orange-800">Subjects needing attention</h3>
            <p className="text-sm text-orange-700 mt-1">
              You are falling behind in: {weakSubjects.map(s => s.name).join(', ')}. 
              Consider adding {weakSubjects[0].suggestedExtraHoursPerWeek} extra hours per week.
            </p>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column: Today's Schedule */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[var(--color-primary-dark)]">Today's Sessions</h2>
              <Link to="/calendar" className="text-sm font-medium text-[var(--color-primary)] flex items-center gap-1 hover:underline">
                View Calendar <ArrowRight size={14} />
              </Link>
            </div>
            
            {todaySessions?.length === 0 ? (
              <div className="empty-state py-8">
                <Calendar className="mx-auto" />
                <p>No study sessions scheduled for today.</p>
                <Link to="/exams-assignments" className="btn btn-outline btn-sm mt-4">Add tasks</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {todaySessions?.map(session => (
                  <div key={session.id} className="flex gap-4 p-4 border border-[var(--color-border)] rounded-xl hover:bg-[var(--color-surface-hover)] transition-colors">
                    <div className="w-20 text-center shrink-0 flex flex-col justify-center border-r border-[var(--color-border)] pr-4">
                      <div className="font-bold text-[var(--color-primary-dark)]">{session.startTime}</div>
                      <div className="text-xs text-[var(--color-text-muted)]">{session.endTime}</div>
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="text-xs font-semibold uppercase tracking-wider mb-1 flex items-center gap-2" style={{ color: session.topic?.subject.color || session.assignment?.subject.color }}>
                         <div className="w-2 h-2 rounded-full" style={{ backgroundColor: session.topic?.subject.color || session.assignment?.subject.color }}></div>
                         {session.topic?.subject.name || session.assignment?.subject.name}
                      </div>
                      <div className="font-medium text-[var(--color-text-primary)] truncate">
                        {session.topic?.title || session.assignment?.title}
                      </div>
                    </div>
                    <div className="flex items-center">
                      {session.status === 'COMPLETED' ? (
                        <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg text-sm font-semibold">
                          <CheckCircle2 size={16} /> Done
                        </div>
                      ) : session.status === 'MISSED' ? (
                        <div className="badge badge-missed">Missed</div>
                      ) : (
                        <button 
                          onClick={() => handleMarkComplete(session.id)}
                          className="btn btn-outline btn-sm h-8"
                        >
                          Complete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Charts Row */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="card p-6">
              <h2 className="text-lg font-bold text-[var(--color-primary-dark)] mb-4">Study Hours (This Week)</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                    <RechartsTooltip cursor={{ fill: '#F1F5F9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                    <Bar dataKey="planned" name="Planned" fill="#E2E8F0" radius={[4, 4, 0, 0]} barSize={12} />
                    <Bar dataKey="completed" name="Completed" fill="var(--color-accent)" radius={[4, 4, 0, 0]} barSize={12} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card p-6">
              <h2 className="text-lg font-bold text-[var(--color-primary-dark)] mb-4">Session Status</h2>
              <div className="h-64 flex items-center justify-center">
                {donutData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={donutData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {donutData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                   <div className="text-sm text-[var(--color-text-muted)]">No session data yet.</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Upcoming & Subjects */}
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="text-lg font-bold text-[var(--color-primary-dark)] mb-4">Subject Progress</h2>
            <div className="space-y-5">
              {subjectProgress?.map(subject => (
                <div key={subject.id}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-sm text-[var(--color-text-primary)]">{subject.name}</span>
                    <span className="text-xs font-bold" style={{ color: subject.color }}>{subject.progress}%</span>
                  </div>
                  <div className="w-full bg-[var(--color-surface-hover)] rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="h-2.5 rounded-full transition-all duration-500 ease-out" 
                      style={{ width: `${subject.progress}%`, backgroundColor: subject.color }}
                    ></div>
                  </div>
                </div>
              ))}
              {subjectProgress?.length === 0 && (
                <p className="text-sm text-[var(--color-text-muted)] text-center">No subjects added yet.</p>
              )}
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-bold text-[var(--color-primary-dark)] mb-4">Upcoming Exams</h2>
            {upcomingExams?.length === 0 ? (
              <p className="text-sm text-[var(--color-text-muted)] text-center py-4">No upcoming exams.</p>
            ) : (
              <div className="space-y-4">
                {upcomingExams?.slice(0,4).map(exam => (
                  <div key={exam.id} className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-red-50 flex flex-col items-center justify-center shrink-0 border border-red-100 text-red-600">
                       <span className="text-xs font-bold uppercase">{new Date(exam.date).toLocaleString('default', { month: 'short' })}</span>
                       <span className="text-lg font-bold leading-none">{new Date(exam.date).getDate()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-[var(--color-text-primary)] truncate">{exam.title}</div>
                      <div className="text-xs text-[var(--color-text-secondary)] mt-0.5">{exam.subject.name}</div>
                    </div>
                    <div className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded">
                      {exam.daysUntil} days
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


