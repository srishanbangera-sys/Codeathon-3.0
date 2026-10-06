import { Map as MapIcon, Calendar, Trophy, Check, Navigation2 } from 'lucide-react';
import RevealWrapper from '../RevealWrapper';

export default function HowItWorks() {
  const steps = [
    {
      num: "01",
      title: "Map your syllabus",
      desc: "Add your subjects, topics, and deadlines. We'll instantly generate a daily study plan that distributes the workload so you never cram again.",
      icon: MapIcon,
      color: "#2dc1c1",
      lightBg: "rgba(45, 193, 193, 0.1)",
      checks: ["Organized plan", "Balanced load", "No cramming"]
    },
    {
      num: "02",
      title: "Execute the plan",
      desc: "Open your dashboard each day. See exactly what topics to review and for how long. Start a session, log your focus hours, and watch your progress ring fill up.",
      icon: Calendar,
      color: "#3b82f6",
      lightBg: "rgba(59, 130, 246, 0.1)",
      checks: ["Track progress", "Stay consistent", "Build habits"]
    },
    {
      num: "03",
      title: "Claim your rewards",
      desc: "Finished a tough week? Hit 100% of your weekly goal and LearnBuddy notifies your parents or mentors so you can cash in on the rewards you agreed on.",
      icon: Trophy,
      color: "#8b5cf6",
      lightBg: "rgba(139, 92, 246, 0.1)",
      checks: ["Earn rewards", "Stay motivated", "Reach your goals"]
    }
  ];

  return (
    <section id="how" className="relative py-24 md:py-32 w-full bg-[#051c24] overflow-hidden">
      
      {/* Background Blobs */}
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#2dc1c1]/10 rounded-full blur-[100px] -translate-x-1/2 translate-y-1/2 pointer-events-none"></div>
      
      <div className="w-full max-w-[1200px] mx-auto px-6 relative z-10">
        
        {/* Top Header & Illustration */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-16 mb-24">
          
          <RevealWrapper delay={100} className="w-full lg:w-1/2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#2dc1c1]/10 border border-[#2dc1c1]/20 mb-6">
              <div className="w-5 h-5 rounded-full bg-[#2dc1c1] flex items-center justify-center">
                <Navigation2 size={12} className="text-white fill-white transform rotate-45" />
              </div>
              <span className="text-[#2dc1c1] font-bold text-xs tracking-widest uppercase">Your Success Journey</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl lg:text-[56px] font-bold text-white mb-6 leading-[1.15] tracking-tight">
              The roadmap to better<br/>
              <span className="text-[#2dc1c1]">grades.</span>
            </h2>
            
            <p className="text-[17px] text-gray-400 leading-relaxed font-medium max-w-lg">
              A clear plan. Consistent effort. Real results. Follow this simple roadmap and turn your study time into success.
            </p>
          </RevealWrapper>

          {/* Abstract Mountain SVG Illustration */}
          <RevealWrapper delay={300} className="w-full lg:w-1/2 flex justify-center lg:justify-end relative">
            <svg width="480" height="280" viewBox="0 0 480 280" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-[500px] h-auto">
              <circle cx="380" cy="80" r="32" fill="#fdf0c3" opacity="0.8"/>
              <path d="M40 280 C60 220 120 160 160 160 C200 160 220 280 220 280 Z" fill="#b0dfdf" opacity="0.3"/>
              <path d="M120 280 C150 200 240 120 280 120 C320 120 380 280 380 280 Z" fill="#75caca" opacity="0.3"/>
              <path d="M280 280 C310 210 380 150 420 150 C460 150 480 280 480 280 Z" fill="#b0dfdf" opacity="0.3"/>
              <path d="M100 280 L250 80 L400 280 Z" fill="#2dc1c1" />
              <path d="M250 80 L400 280 L100 280 Z" fill="url(#mountainGrad)" />
              <path d="M250 80 L320 280 L100 280 Z" fill="#0f4c4c" opacity="0.6" />
              
              {/* Flag */}
              <path d="M250 80 L250 40" stroke="#f8fcfc" strokeWidth="4" strokeLinecap="round" />
              <path d="M252 42 L285 52 L252 65 Z" fill="#2dc1c1" />
              
              {/* Roadmap path */}
              <path d="M120 280 C 180 250, 220 250, 240 200 C 260 150, 250 100, 250 80" stroke="#051c24" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M120 280 C 180 250, 220 250, 240 200 C 260 150, 250 100, 250 80" stroke="#0a2530" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
              
              <defs>
                <linearGradient id="mountainGrad" x1="250" y1="80" x2="250" y2="280" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#2dc1c1" />
                  <stop offset="100%" stopColor="#0a2530" />
                </linearGradient>
              </defs>
            </svg>
            
            {/* Handwritten note */}
            <div className="absolute top-4 -right-12 xl:-right-20 transform rotate-[-8deg] hidden md:block">
              <p className="font-serif text-[#2dc1c1] text-lg font-bold tracking-wide">
                Small steps.<br/>Big goals.
              </p>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute -left-8 bottom-0 text-[#2dc1c1]">
                <path d="M6 5 C 6 12, 10 18, 18 19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                <path d="M14 15 L18 19 L13 22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              </svg>
            </div>
          </RevealWrapper>
        </div>

        {/* Bottom Cards Roadmap */}
        <div className="relative">
          {/* Dashed line connecting cards (hidden on mobile) */}
          <div className="hidden md:block absolute top-6 left-[10%] right-[10%] h-[2px] border-t-2 border-dashed border-[#2dc1c1]/20 z-0" 
               style={{ 
                 borderRadius: '50%', 
                 height: '40px', 
                 borderBottom: 'none', 
                 borderLeft: 'none', 
                 borderRight: 'none',
                 marginTop: '-10px'
               }}>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 relative z-10">
            {steps.map((step, i) => (
              <RevealWrapper key={i} delay={400 + (i * 100)}>
                <div className="relative pt-6 h-full group">
                  {/* Floating Number Badge */}
                  <div 
                    className="absolute top-0 left-6 w-12 h-12 rounded-full flex items-center justify-center font-bold text-[22px] text-white shadow-lg z-20 border-4 border-[#051c24] transform group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: step.color }}
                  >
                    {step.num}
                  </div>
                  
                  {/* Card Content */}
                  <div className="bg-[#0a2530] rounded-[24px] border border-white/5 p-8 pt-12 h-full flex flex-col shadow-[0_8px_30px_rgba(0,0,0,0.2)] group-hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)] transition-shadow relative overflow-hidden" 
                       style={{ borderTopColor: `${step.color}40` }}>
                    
                    <div 
                      className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-sm transform group-hover:-translate-y-1 transition-transform border border-white/5"
                      style={{ backgroundColor: step.lightBg, color: step.color }}
                    >
                      <step.icon size={28} strokeWidth={2} />
                    </div>
                    
                    <h3 className="text-[20px] font-bold text-white mb-3">{step.title}</h3>
                    <p className="text-gray-400 text-[15px] font-medium leading-relaxed mb-8">
                      {step.desc}
                    </p>
                    
                    {/* Bottom Checkmarks Row */}
                    <div 
                      className="mt-auto -mx-8 -mb-8 px-6 py-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 border-t border-white/5 bg-white/5"
                    >
                      {step.checks.map((c, j) => (
                        <div key={j} className="flex items-center gap-1.5 text-[11px] font-bold whitespace-nowrap" style={{ color: step.color }}>
                          <Check size={14} strokeWidth={3} /> {c}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </RevealWrapper>
            ))}
          </div>
        </div>
        
      </div>
    </section>
  );
}
