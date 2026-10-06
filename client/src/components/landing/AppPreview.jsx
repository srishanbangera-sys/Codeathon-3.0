import { LayoutDashboard, BookOpen, Calendar as CalendarIcon, LineChart, ChevronRight, Trophy, Gift } from 'lucide-react';

export default function AppPreview() {
  return (
    <div className="relative w-full">
      {/* Floating Card Left */}
      <div className="absolute -bottom-6 -left-12 md:-left-20 z-20 w-64 bg-[#0a2530] rounded-xl border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.5)] p-4 transform -rotate-2" style={{ backdropFilter: 'blur(10px)' }}>
        <div className="flex justify-between items-center mb-4">
          <span className="text-white text-xs font-semibold">Study Progress</span>
          <span className="text-[#2dc1c1] text-[10px] font-bold">↗ +24%</span>
        </div>
        <div className="relative h-16 w-full flex items-end">
          <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 40">
            <path d="M0,35 L20,25 L40,28 L60,15 L80,20 L100,5" fill="none" stroke="#2dc1c1" strokeWidth="2" vectorEffect="non-scaling-stroke" />
            <path d="M0,40 L0,35 L20,25 L40,28 L60,15 L80,20 L100,5 L100,40 Z" fill="url(#gradient)" opacity="0.2" />
            <defs>
              <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2dc1c1" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute left-[20%] bottom-[37%] w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_5px_#fff]"></div>
          <div className="absolute left-[40%] bottom-[30%] w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_5px_#fff]"></div>
          <div className="absolute left-[60%] bottom-[62%] w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_5px_#fff]"></div>
          <div className="absolute left-[80%] bottom-[50%] w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_5px_#fff]"></div>
          <div className="absolute left-[100%] bottom-[87%] w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_5px_#fff]"></div>
        </div>
      </div>

      {/* Floating Card Right */}
      <div className="absolute top-1/4 -right-12 md:-right-16 z-20 w-48 bg-[#0a2530] rounded-xl border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.5)] p-4 transform rotate-3">
        <div className="w-8 h-8 rounded-lg bg-[#fbbc04]/20 flex items-center justify-center mb-3 border border-[#fbbc04]/30">
          <Trophy size={16} className="text-[#fbbc04]" />
        </div>
        <h4 className="text-white font-bold text-sm mb-1">Milestone reached!</h4>
        <p className="text-white/60 text-xs mb-3 leading-tight">You completed your Math goal! 🎉</p>
        <div className="inline-block bg-[#2dc1c1] text-[#051c24] font-bold text-[11px] px-2.5 py-1 rounded-full">
          +50 pts
        </div>
      </div>

      {/* Main Dashboard Window */}
      <div className="w-full bg-white rounded-xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.6)] overflow-hidden border border-white/20">
        {/* Window Bar */}
        <header className="bg-gray-100 px-4 py-3 flex items-center border-b border-gray-200">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
          </div>
        </header>
        
        {/* Layout */}
        <div className="flex h-[450px]">
          {/* Sidebar */}
          <aside className="w-48 flex-col gap-1 p-4 border-r border-gray-100 bg-white hidden sm:flex">
            <div className="flex items-center gap-2 mb-8 px-2">
              <div className="w-6 h-6 rounded bg-[#2dc1c1] flex items-center justify-center">
                <span className="text-white font-bold text-xs">S</span>
              </div>
              <span className="font-bold text-gray-900 text-sm">LearnBuddy</span>
            </div>
            <nav className="flex flex-col gap-1 w-full">
              <button className="flex items-center gap-2 h-9 rounded-lg bg-[#2dc1c1]/10 text-[#2dc1c1] font-bold text-sm px-3 w-full">
                <LayoutDashboard size={16} /> Dashboard
              </button>
              <button className="flex items-center gap-2 h-9 rounded-lg text-gray-500 hover:bg-gray-50 text-sm px-3 w-full font-medium">
                <BookOpen size={16} /> Subjects
              </button>
              <button className="flex items-center gap-2 h-9 rounded-lg text-gray-500 hover:bg-gray-50 text-sm px-3 w-full font-medium">
                <CalendarIcon size={16} /> Calendar
              </button>
              <button className="flex items-center gap-2 h-9 rounded-lg text-gray-500 hover:bg-gray-50 text-sm px-3 w-full font-medium">
                <LineChart size={16} /> Progress
              </button>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 p-6 flex flex-col bg-[#f8fafc] overflow-hidden">
            
            {/* Top header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Good morning, Srishan</h2>
                <p className="text-sm text-gray-500">Small steps. Big results.</p>
              </div>
              <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-600 shadow-sm">
                <CalendarIcon size={14} className="text-gray-400" /> Mon, 6 Oct 2025
              </div>
            </div>

            <div className="flex gap-6 flex-1 min-h-0">
              {/* Left Col: Today's schedule */}
              <div className="flex-[3] bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col min-h-0">
                <h3 className="text-gray-900 text-sm font-bold mb-4">Today's Schedule</h3>
                <div className="space-y-4 overflow-y-auto pr-2">
                  {[
                    { name: 'Mathematics', sub: 'Algebra Review', time: '9:00 AM - 10:00 AM', dur: '60m', color: '#2dc1c1' },
                    { name: 'Physics', sub: 'Optics Practice', time: '11:00 AM - 12:00 PM', dur: '45m', color: '#2dc1c1' },
                    { name: 'Chemistry', sub: 'Chapter 3 Quiz', time: '2:00 PM - 2:30 PM', dur: '30m', color: '#2dc1c1' },
                    { name: 'English', sub: 'Essay Drafting', time: '4:00 PM - 4:40 PM', dur: '40m', color: '#e2e8f0' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between group cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center bg-gray-50 border border-gray-200">
                           {i < 3 && <div className="w-2.5 h-2.5 rounded-full bg-[#2dc1c1]"></div>}
                        </div>
                        <div>
                          <p className={`text-sm font-bold ${i === 3 ? 'text-gray-500' : 'text-gray-900'}`}>{item.name}</p>
                          <p className="text-[10px] text-gray-400 font-medium">{item.sub}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-[10px] font-semibold text-gray-400 w-24 text-right">{item.time}</span>
                        <span className="text-[10px] font-bold text-gray-600 w-6">{item.dur}</span>
                        <ChevronRight size={14} className="text-gray-300 group-hover:text-gray-500" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Col: Weekly Goal */}
              <div className="flex-[2] bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col items-center min-h-0">
                <h3 className="text-gray-900 text-sm font-bold w-full text-left mb-4">Weekly Goal</h3>
                
                {/* Circular chart */}
                <div className="relative w-24 h-24 mb-2 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f1f5f9" strokeWidth="4" />
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#2dc1c1" strokeWidth="4" strokeDasharray="72, 100" strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-bold text-gray-900">72%</span>
                  </div>
                </div>
                <p className="text-[10px] font-semibold text-gray-400 mb-6">3 of 4 subjects</p>

                {/* Bar chart */}
                <div className="w-full flex items-end justify-between h-16 gap-1 px-2 mt-auto">
                  {[{day: 'Mon', h: 40}, {day: 'Tue', h: 70}, {day: 'Wed', h: 50}, {day: 'Thu', h: 90}, {day: 'Fri', h: 60}, {day: 'Sat', h: 30}, {day: 'Sun', h: 20}].map((col, i) => (
                    <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
                      <div className="w-full bg-gray-100 rounded-sm h-full relative">
                        <div className={`absolute bottom-0 w-full rounded-sm ${i < 5 ? 'bg-[#2dc1c1]' : 'bg-[#fbbc04]'}`} style={{ height: `${col.h}%` }}></div>
                      </div>
                      <span className="text-[8px] font-bold text-gray-400">{col.day}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Alert Box */}
            <div className="mt-4 bg-[#e6f7f7] border border-[#2dc1c1]/30 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#2dc1c1] flex items-center justify-center">
                  <Gift size={16} className="text-white" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#051c24]">Keep going!</h4>
                  <p className="text-[10px] text-[#051c24]/70 font-medium">Complete today's goals to earn <strong>50</strong> reward points.</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-[#2dc1c1]" />
            </div>

          </main>
        </div>
      </div>
    </div>
  );
}
