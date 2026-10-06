import { Trophy, Star, CheckSquare, Medal, Clock, ShieldCheck, Diamond, ArrowRight } from 'lucide-react';
import RevealWrapper from '../RevealWrapper';

export default function RewardBadges() {
  const badges = [
    { 
      title: "Weekly Winner", 
      desc: "Hit your weekly goals and unlock special rewards.",
      icon: Trophy, 
      color: "#2dc1c1", 
      lightColor: "rgba(45, 193, 193, 0.15)"
    },
    { 
      title: "Streak Master", 
      desc: "Keep your streak alive and earn bigger rewards.",
      icon: Star, 
      color: "#fbbc04", 
      lightColor: "rgba(251, 188, 4, 0.15)"
    },
    { 
      title: "Topic Cleared", 
      desc: "Complete topics and show your progress.",
      icon: CheckSquare, 
      color: "#8b5cf6", 
      lightColor: "rgba(139, 92, 246, 0.15)"
    },
    { 
      title: "Exam Ace", 
      desc: "Ace your exams and unlock premium rewards.",
      icon: Medal, 
      color: "#3b82f6", 
      lightColor: "rgba(59, 130, 246, 0.15)"
    }
  ];

  return (
    <section id="rewards" className="relative py-24 md:py-32 w-full bg-[#06212a] overflow-hidden border-t border-white/5">
      
      {/* Background Blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#2dc1c1]/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-[#2dc1c1]/5 rounded-full blur-3xl translate-x-1/3 -translate-y-1/2"></div>

      <div className="w-full max-w-[1200px] mx-auto px-6 relative z-10 flex flex-col lg:flex-row gap-16 items-center">
        
        {/* Left Side Content */}
        <RevealWrapper delay={100} className="w-full lg:w-[45%]">
          
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#2dc1c1]/10 mb-6 border border-[#2dc1c1]/20">
            <Trophy size={14} className="text-[#2dc1c1]" />
            <span className="text-[#2dc1c1] font-bold text-xs tracking-widest uppercase">Milestones</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-[1.15] tracking-tight">
            Track progress.<br/>
            <span className="text-[#2dc1c1]">Earn what you want.</span>
          </h2>
          
          <p className="text-[16px] text-gray-400 mb-10 leading-relaxed font-medium">
            You negotiate the rewards with your parents or mentors. We track the hours and milestones you hit to prove you've earned them.
          </p>
          
          {/* Bottom 3 Features */}
          <div className="flex flex-wrap items-center gap-y-4 divide-x divide-white/10">
            <div className="flex items-center gap-3 pr-6">
              <Clock size={20} className="text-[#2dc1c1]" />
              <span className="text-xs font-semibold text-gray-400 leading-tight">Transparent<br/>tracking</span>
            </div>
            <div className="flex items-center gap-3 px-6">
              <ShieldCheck size={20} className="text-[#2dc1c1]" />
              <span className="text-xs font-semibold text-gray-400 leading-tight">Builds<br/>responsibility</span>
            </div>
            <div className="flex items-center gap-3 pl-6">
              <Diamond size={20} className="text-[#2dc1c1]" />
              <span className="text-xs font-semibold text-gray-400 leading-tight">Real rewards<br/>for real effort</span>
            </div>
          </div>

        </RevealWrapper>

        {/* Right Side Grid */}
        <div className="w-full lg:w-[55%] relative">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {badges.map((badge, i) => (
              <RevealWrapper key={i} delay={200 + (i * 100)}>
                <article className="bg-[#0a2530] rounded-[24px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.2)] border border-white/5 flex flex-col items-start relative h-full group hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)] transition-shadow">
                  
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 text-white shadow-sm border border-white/5"
                    style={{ backgroundColor: badge.color }}
                  >
                    <badge.icon size={22} strokeWidth={2.5} />
                  </div>
                  
                  <h3 className="text-white font-bold text-lg mb-2">{badge.title}</h3>
                  <p className="text-sm text-gray-400 font-medium leading-relaxed mb-6 pr-8">
                    {badge.desc}
                  </p>
                  
                  {/* Arrow Button */}
                  <div 
                    className="absolute right-6 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity border border-white/5"
                    style={{ backgroundColor: badge.lightColor, color: badge.color }}
                  >
                    <ArrowRight size={16} strokeWidth={3} />
                  </div>

                </article>
              </RevealWrapper>
            ))}
          </div>

          {/* Handwritten text deco */}
          <div className="hidden xl:block absolute -right-24 top-1/2 -translate-y-1/2 transform rotate-[-10deg]">
            <p className="font-serif text-[#2dc1c1] text-xl font-medium tracking-wide">
              Small steps.<br/>Big rewards.
            </p>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute -left-6 -bottom-6 transform rotate-90 text-[#2dc1c1]">
              <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
