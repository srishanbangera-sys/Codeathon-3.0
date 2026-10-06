import { Link } from 'react-router-dom';
import AppPreview from './AppPreview';
import RevealWrapper from '../RevealWrapper';
import { Play, Calendar, Bell, Gift } from 'lucide-react';

export default function Hero() {
  const scrollToHow = () => {
    document.getElementById('how')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative pt-20 pb-16 md:pt-32 md:pb-28 w-full overflow-hidden" style={{ background: 'linear-gradient(135deg, #051c24 0%, #073541 100%)' }}>
      
      {/* Giant circle in background */}
      <div className="absolute top-[10%] right-[-10%] w-[800px] h-[800px] rounded-full bg-[#165a65] opacity-50 blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-[1200px] mx-auto px-6 relative z-10 grid lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-8 items-center">
        
        {/* Left: Text Content */}
        <RevealWrapper delay={100} className="flex flex-col items-start text-left max-w-xl">
          
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#2dc1c1]/30 bg-[#2dc1c1]/10 mb-8">
            <span className="text-lg leading-none">✈️</span>
            <span className="text-[#2dc1c1] text-sm font-semibold tracking-wide">Your AI Study Companion</span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-[72px] font-bold text-white leading-[1.05] mb-6 tracking-tight">
            Plan your study time.<br/>
            <span className="text-[#2dc1c1]">Earn real rewards.</span>
          </h1>
          
          <p className="text-[17px] text-white/80 mb-10 leading-relaxed max-w-lg font-medium">
            Map out your subjects, deadlines, and weekly hours. LearnBuddy generates a personalized schedule and notifies your advocates when you hit milestones to claim your rewards.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-6 w-full sm:w-auto mb-16">
            <Link to="/register" className="flex items-center gap-2 bg-[#fbbc04] hover:bg-[#e6ab03] text-[#051c24] px-8 py-3.5 rounded-full font-bold text-base transition-colors shadow-[0_0_20px_rgba(251,188,4,0.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2dc1c1]">
              <span className="text-xl leading-none">↗</span> Start planning free
            </Link>
            <button onClick={scrollToHow} className="flex items-center gap-3 text-white font-semibold hover:text-[#2dc1c1] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2dc1c1] rounded-full py-2 group">
              <div className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center group-hover:border-[#2dc1c1] transition-colors">
                <Play size={16} fill="currentColor" className="ml-1" />
              </div>
              See how it works
            </button>
          </div>

          {/* 3 feature highlights at bottom */}
          <div className="grid grid-cols-3 gap-6 w-full pt-8 border-t border-white/10">
            <div className="flex flex-col items-start text-left gap-3">
              <div className="w-10 h-10 rounded-full bg-[#11323f] flex items-center justify-center">
                <Calendar className="text-[#2dc1c1]" size={20} />
              </div>
              <h4 className="text-white font-bold text-sm">Smart Scheduling</h4>
              <p className="text-white/60 text-xs font-medium leading-relaxed">Plan your study hours<br/>with AI</p>
            </div>
            <div className="flex flex-col items-start text-left gap-3">
              <div className="w-10 h-10 rounded-full bg-[#11323f] flex items-center justify-center">
                <Bell className="text-[#2dc1c1]" size={20} />
              </div>
              <h4 className="text-white font-bold text-sm">Milestone Alerts</h4>
              <p className="text-white/60 text-xs font-medium leading-relaxed">Get notified & stay<br/>on track</p>
            </div>
            <div className="flex flex-col items-start text-left gap-3">
              <div className="w-10 h-10 rounded-full bg-[#11323f] flex items-center justify-center">
                <Gift className="text-[#2dc1c1]" size={20} />
              </div>
              <h4 className="text-white font-bold text-sm">Earn Rewards</h4>
              <p className="text-white/60 text-xs font-medium leading-relaxed">Complete goals and<br/>claim real rewards</p>
            </div>
          </div>
        </RevealWrapper>

        {/* Right: Visual */}
        <RevealWrapper delay={300} translateY={50} className="w-full relative lg:h-[600px] flex items-center justify-center lg:justify-end mt-12 lg:mt-0 perspective-1000">
          <div className="w-full max-w-[650px] transform lg:translate-x-8" style={{ transform: 'perspective(1200px) rotateY(-8deg) rotateX(2deg)' }}>
            <AppPreview />
          </div>
        </RevealWrapper>

      </div>
    </section>
  );
}
