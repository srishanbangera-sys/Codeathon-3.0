import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardAPI, scheduleAPI } from '../api';
import { useAuth } from '../contexts/AuthContext';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Flame, Clock, BookOpen, Calendar, ArrowRight, Target, CalendarDays, BarChart3, Plus, CheckCircle2, Circle, Clock4, ClipboardList } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [missedChecked, setMissedChecked] = useState(false);

  const fetchDashboard = async () => {
    try {
      const res = await dashboardAPI.get();
      setData(res.data?.data || {});
    } catch (err) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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
        <div className="skeleton h-48 w-full rounded-2xl mb-8"></div>
        <div className="grid md:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="skeleton h-32 rounded-2xl"></div>)}
        </div>
        <div className="skeleton h-96 rounded-2xl"></div>
      </div>
    );
  }

  const {
    todaySessions,
    streak,
    hoursThisWeek,
    weeklyData,
  } = data || {};

  // Derived mock data for new UI elements
  const todayDateStr = new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  const tasksCount = todaySessions?.length || 0;
  const weeklyGoalPct = Math.min(100, Math.round((hoursThisWeek / 50) * 100)) || 0;

  return (
    <div className="space-y-6 page-enter max-w-[1400px]">
      
      {/* Top Banner & Stats Row */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Hero Banner */}
        <div className="xl:col-span-5 bg-white rounded-3xl p-8 relative overflow-hidden flex flex-col justify-center border border-gray-100 shadow-sm min-h-[220px]">
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-gray-500 font-medium mb-4 text-sm">
              <Calendar size={16} />
              {todayDateStr}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#051c24] mb-3 tracking-tight">
              Good morning, <span className="text-[#2dc1c1]">{user?.name?.split(' ')[0] || 'Student'}!</span>
            </h1>
            <p className="text-gray-500 font-medium">Small steps. Big results. Keep going!</p>
          </div>
          
          {/* Decorative Mountain SVG */}
          <div className="absolute right-0 bottom-0 w-2/3 h-full pointer-events-none opacity-90 hidden sm:block">
            <svg viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute right-0 bottom-0 h-[110%] w-auto translate-x-12 translate-y-4">
              <circle cx="280" cy="50" r="24" fill="#fdf0c3" opacity="0.8"/>
              <path d="M50 200 C80 150 140 100 180 100 C220 100 280 200 280 200 Z" fill="#b0dfdf" opacity="0.4"/>
              <path d="M150 200 L250 80 L350 200 Z" fill="#2dc1c1" />
              <path d="M250 80 L350 200 L150 200 Z" fill="url(#heroGrad)" />
              <path d="M250 80 L300 200 L150 200 Z" fill="#0f4c4c" opacity="0.4" />
              <path d="M160 200 C 200 170, 230 170, 240 130 C 250 90, 250 85, 250 80" stroke="#f8fafc" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M250 80 L250 40" stroke="#f8fafc" strokeWidth="3" strokeLinecap="round" />
              <path d="M251 41 L270 48 L251 55 Z" fill="#2dc1c1" />
              <defs>
                <linearGradient id="heroGrad" x1="250" y1="80" x2="250" y2="200" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#2dc1c1" />
                  <stop offset="100%" stopColor="#0a2530" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="xl:col-span-7 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {/* Card 1 */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow cursor-default">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <CalendarDays size={20} strokeWidth={2.5} />
              </div>
              <div className="text-sm font-semibold text-gray-500 mb-1">Today's Tasks</div>
              <div className="text-3xl font-bold text-[#051c24]">{tasksCount}</div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow cursor-default">
            <div>
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-4">
                <Clock size={20} strokeWidth={2.5} />
              </div>
              <div className="text-sm font-semibold text-gray-500 mb-1">Study Hours</div>
              <div className="text-3xl font-bold text-[#051c24]">{hoursThisWeek}<span className="text-lg font-bold text-gray-400 ml-1">hrs</span></div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow cursor-default relative overflow-hidden">
            <div className="relative z-10">
              <div className="w-10 h-10 rounded-xl bg-[#2dc1c1]/10 text-[#2dc1c1] flex items-center justify-center mb-4">
                <Target size={20} strokeWidth={2.5} />
              </div>
              <div className="text-sm font-semibold text-gray-500 mb-1">Weekly Goal</div>
              <div className="text-3xl font-bold text-[#051c24]">{weeklyGoalPct}%</div>
            </div>
            <div className="mt-4 text-xs font-medium text-gray-400 relative z-10">
              {hoursThisWeek} / 50 hours
            </div>
            <div className="absolute right-[-10px] top-1/2 -translate-y-1/2 w-20 h-20 rounded-full border-4 border-gray-100 flex items-center justify-center opacity-80">
               <div className="w-full h-full rounded-full border-4 border-[#2dc1c1] border-l-transparent border-b-transparent transform rotate-45"></div>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow cursor-default">
            <div>
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center mb-4">
                <Flame size={20} strokeWidth={2.5} />
              </div>
              <div className="text-sm font-semibold text-gray-500 mb-1">Streak</div>
              <div className="text-3xl font-bold text-[#051c24]">{streak} <span className="text-lg font-bold text-gray-400">days</span></div>
            </div>
            <div className="mt-4 text-xs font-bold text-orange-500 flex items-center gap-1">
              Keep it up! 🔥
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Column 1: Today's Schedule */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm h-full flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
                <CalendarDays size={18} strokeWidth={2.5} />
              </div>
              <h2 className="text-lg font-bold text-[#051c24]">Today's Schedule</h2>
            </div>
            <Link to="/calendar" className="text-sm font-bold text-gray-400 hover:text-[#2dc1c1] flex items-center gap-1 transition-colors">
              View Calendar <ArrowRight size={14} />
            </Link>
          </div>

          <div className="flex-1 relative">
            {!todaySessions || todaySessions.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 py-12">
                <Clock4 size={48} className="mb-4 text-gray-200" strokeWidth={1.5} />
                <p className="font-medium">No sessions scheduled.</p>
                <Link to="/exams-assignments" className="mt-4 text-[#2dc1c1] font-bold text-sm hover:underline">Add tasks</Link>
              </div>
            ) : (
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-gray-200 before:via-gray-200 before:to-transparent pl-8 md:pl-0">
                {todaySessions.map((session, i) => {
                  if (!session) return null;
                  const isDone = session.status === 'COMPLETED';
                  const color = session.topic?.subject.color || session.assignment?.subject.color || '#2dc1c1';
                  
                  return (
                    <div key={session.id || i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                      
                      <div className="flex items-center justify-center w-4 h-4 rounded-full border-4 border-white bg-white absolute left-0 md:left-1/2 -translate-x-[15px] md:-translate-x-1/2 z-10 shadow-sm" style={{ backgroundColor: color }}></div>
                      
                      <div className="w-full md:w-[calc(50%-1.5rem)] p-4 rounded-2xl bg-white border border-gray-100 shadow-sm group-hover:border-gray-200 transition-colors flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-gray-400 tracking-wider">
                            {session.startTime} - {session.endTime}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-bold text-[#051c24] flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }}></div>
                            {session.topic?.subject.name || session.assignment?.subject.name}
                          </div>
                          <div className="text-xs text-gray-500 font-medium truncate mt-1">
                            {session.topic?.title || session.assignment?.title}
                          </div>
                        </div>
                        
                        <div className="mt-2 flex">
                           {isDone ? (
                             <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 text-[11px] font-bold">
                               <CheckCircle2 size={12} strokeWidth={3} /> Completed
                             </div>
                           ) : session.status === 'MISSED' ? (
                             <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-[11px] font-bold">
                               <Circle size={12} strokeWidth={3} /> Missed
                             </div>
                           ) : (
                             <button onClick={() => handleMarkComplete(session.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-[11px] font-bold hover:bg-blue-100 transition-colors">
                               <Circle size={12} strokeWidth={3} /> Mark Complete
                             </button>
                           )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Column 2: Weekly Progress & Activity */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Chart Card */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-50 text-gray-600 flex items-center justify-center">
                  <BarChart3 size={18} strokeWidth={2.5} />
                </div>
                <h2 className="text-lg font-bold text-[#051c24]">Weekly Progress</h2>
              </div>
              <Link to="/progress" className="text-sm font-bold text-gray-400 hover:text-[#2dc1c1] flex items-center gap-1 transition-colors">
                View Analytics <ArrowRight size={14} />
              </Link>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#f1f5f9" strokeWidth="8" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#2dc1c1" strokeWidth="8" strokeLinecap="round" 
                    strokeDasharray={`${weeklyGoalPct * 2.51} 251`} 
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-[#051c24]">{weeklyGoalPct}%</span>
                </div>
                <div className="absolute -bottom-6 w-max text-[11px] font-bold text-gray-400">Goal: 50 hours</div>
              </div>

              <div className="flex-1 h-36 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData || []} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} />
                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
                    <Bar dataKey="completed" fill="#2dc1c1" radius={[4, 4, 4, 4]} barSize={16} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex-1">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-50 text-gray-600 flex items-center justify-center">
                  <Clock4 size={18} strokeWidth={2.5} />
                </div>
                <h2 className="text-lg font-bold text-[#051c24]">Recent Activity</h2>
              </div>
              <button className="text-sm font-bold text-gray-400 hover:text-[#2dc1c1] flex items-center gap-1 transition-colors">
                View All <ArrowRight size={14} />
              </button>
            </div>
            
            <div className="space-y-5 pl-2">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 size={16} strokeWidth={3} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-[#051c24]">Completed Mathematics review session</div>
                  <div className="text-xs text-gray-400 font-medium mt-0.5">2 hours ago</div>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <Plus size={16} strokeWidth={3} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-[#051c24]">Added new task: Physics Assignment</div>
                  <div className="text-xs text-gray-400 font-medium mt-0.5">4 hours ago</div>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                  <CalendarDays size={16} strokeWidth={3} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-[#051c24]">Updated study plan for this week</div>
                  <div className="text-xs text-gray-400 font-medium mt-0.5">6 hours ago</div>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center shrink-0">
                  <Flame size={16} strokeWidth={3} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-[#051c24]">Achieved 7 day streak! 🔥</div>
                  <div className="text-xs text-gray-400 font-medium mt-0.5">1 day ago</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Column 3: Quick Actions & Motivation */}
        <div className="lg:col-span-3 flex flex-col gap-6 h-full">
          {/* Quick Actions Grid */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
             <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#2dc1c1] flex items-center justify-center">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                </div>
                <h2 className="text-lg font-bold text-[#051c24]">Quick Actions</h2>
              </div>
             
             <div className="grid grid-cols-2 gap-3">
               <Link to="/subjects" className="bg-emerald-50 hover:bg-emerald-100 transition-colors p-4 rounded-2xl flex flex-col justify-between aspect-square group">
                 <BookOpen size={24} className="text-emerald-600 mb-2" strokeWidth={2} />
                 <div className="flex items-center justify-between w-full">
                   <span className="text-xs font-bold text-[#051c24] leading-tight">Add<br/>Subject</span>
                   <ArrowRight size={14} className="text-[#051c24] opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                 </div>
               </Link>
               
               <Link to="/exams-assignments" className="bg-blue-50 hover:bg-blue-100 transition-colors p-4 rounded-2xl flex flex-col justify-between aspect-square group">
                 <ClipboardList size={24} className="text-blue-600 mb-2" strokeWidth={2} />
                 <div className="flex items-center justify-between w-full">
                   <span className="text-xs font-bold text-[#051c24] leading-tight">Add<br/>Task</span>
                   <ArrowRight size={14} className="text-[#051c24] opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                 </div>
               </Link>
               
               <Link to="/calendar" className="bg-purple-50 hover:bg-purple-100 transition-colors p-4 rounded-2xl flex flex-col justify-between aspect-square group">
                 <CalendarDays size={24} className="text-purple-600 mb-2" strokeWidth={2} />
                 <div className="flex items-center justify-between w-full">
                   <span className="text-xs font-bold text-[#051c24] leading-tight">View<br/>Calendar</span>
                   <ArrowRight size={14} className="text-[#051c24] opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                 </div>
               </Link>
               
               <Link to="/progress" className="bg-orange-50 hover:bg-orange-100 transition-colors p-4 rounded-2xl flex flex-col justify-between aspect-square group">
                 <BarChart3 size={24} className="text-orange-500 mb-2" strokeWidth={2} />
                 <div className="flex items-center justify-between w-full">
                   <span className="text-xs font-bold text-[#051c24] leading-tight">View<br/>Analytics</span>
                   <ArrowRight size={14} className="text-[#051c24] opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                 </div>
               </Link>
             </div>
          </div>

          {/* Motivation Card */}
          <div className="flex-1 bg-gradient-to-br from-[#0f4c4c] to-[#0a2530] rounded-3xl p-6 shadow-md relative overflow-hidden flex flex-col justify-between">
            <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute right-0 bottom-0 w-48 h-48 opacity-30 pointer-events-none translate-x-10 translate-y-10">
               <path d="M50 200 C80 150 140 100 180 100 C220 100 280 200 280 200 Z" fill="#2dc1c1" />
               <path d="M150 200 C180 120 240 80 280 80 C320 80 380 200 380 200 Z" fill="#1b8c8c" />
            </svg>
            <div className="relative z-10">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="mb-4 text-[#2dc1c1]">
                <path d="M3 21C3 16.5 6 13.5 10 13.5L10 9C5 9 1 14 1 21H3ZM14 21C14 16.5 17 13.5 21 13.5L21 9C16 9 12 14 12 21H14Z" fill="currentColor"/>
              </svg>
              <h3 className="text-xl font-bold text-white leading-snug mb-3">
                Discipline today builds the freedom <span className="text-[#2dc1c1]">you want tomorrow.</span>
              </h3>
              <p className="text-sm font-medium text-gray-300">Keep going, you're doing great!</p>
            </div>
            <div className="mt-8 relative z-10">
              <Link to="/progress" className="inline-flex items-center gap-2 bg-[#d1fae5] hover:bg-[#a7f3d0] text-emerald-800 text-xs font-bold px-4 py-2 rounded-full transition-colors">
                View Progress <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
