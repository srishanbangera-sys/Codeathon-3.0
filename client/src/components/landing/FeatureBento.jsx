import { Calendar, Target, TrendingUp, Users } from 'lucide-react';
import RevealWrapper from '../RevealWrapper';

export default function FeatureBento() {
  return (
    <section id="features" className="py-24 md:py-32 w-full bg-[#051c24] border-t border-white/5 overflow-hidden">
      <div className="w-full max-w-6xl mx-auto px-6">
        <RevealWrapper delay={100} className="mb-20 max-w-3xl">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            Everything you need to stay ahead.
          </h2>
          <p className="text-xl text-gray-400">
            One calm place for your study plan, your progress, and the mentors backing you.
          </p>
        </RevealWrapper>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Card 1: Large left */}
          <RevealWrapper delay={200} className="md:col-span-8">
            <article className="h-full bg-[#0a2530] rounded-[24px] p-8 md:p-12 border border-white/5 relative overflow-hidden flex flex-col justify-between shadow-[0_8px_30px_rgba(0,0,0,0.2)]">
              <div className="mb-12">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-6 border border-white/5">
                  <Calendar className="text-[#2dc1c1]" size={24} strokeWidth={2.5} />
                </div>
                <h3 className="text-3xl font-bold text-white mb-4">A schedule that fits you</h3>
                <p className="text-lg text-gray-400 max-w-md">
                  Add 5 subjects, 3 exams and your deadlines. StudyPilot arranges your topics by priority and available hours into a daily checklist.
                </p>
              </div>
              
              {/* Visual */}
              <div className="space-y-3 relative z-10 w-full max-w-lg">
                {['Mon — Mathematics — Algebra revision', 'Tue — Physics — Mock test', 'Wed — Chemistry — Organic summary'].map((item, i) => (
                  <div key={i} className="bg-white/5 border border-white/5 rounded-xl px-5 py-4 flex items-center gap-4">
                    <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-[#2dc1c1]' : i === 1 ? 'bg-[#fbbc04]' : 'bg-gray-500'}`}></div>
                    <span className="text-white/90 text-sm font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </article>
          </RevealWrapper>

          {/* Card 2: Small right */}
          <RevealWrapper delay={300} className="md:col-span-4">
            <article className="h-full bg-gradient-to-br from-[#1f8a8a] to-[#14394a] text-white rounded-[24px] p-8 md:p-12 border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.2)]">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-6">
                <Target className="text-white" size={24} strokeWidth={2.5} />
              </div>
              <h3 className="text-2xl font-bold mb-4">Customized profile</h3>
              <p className="text-white/80 text-lg leading-relaxed">
                Take a structured personality and interests test to automatically shape your study plan to your learning style.
              </p>
            </article>
          </RevealWrapper>

          {/* Card 3: Small left */}
          <RevealWrapper delay={400} className="md:col-span-5">
            <article className="h-full bg-[#0a2530] rounded-[24px] p-8 md:p-12 border border-white/5 shadow-[0_8px_30px_rgba(0,0,0,0.2)]">
              <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/5 flex items-center justify-center mb-6">
                <TrendingUp className="text-[#fbbc04]" size={24} strokeWidth={2.5} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Focus on strengths</h3>
              <p className="text-lg text-gray-400 leading-relaxed">
                Discover careers where you will be a natural. Don't force yourself into a box; optimize for what you're good at.
              </p>
            </article>
          </RevealWrapper>

          {/* Card 4: Large right */}
          <RevealWrapper delay={500} className="md:col-span-7">
            <article className="h-full bg-[#0a2530] rounded-[24px] p-8 md:p-12 border border-white/5 relative overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.2)]">
              <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/5 flex items-center justify-center mb-6">
                <Users className="text-[#8b5cf6]" size={24} strokeWidth={2.5} />
              </div>
              <h3 className="text-3xl font-bold text-white mb-4">Build a digital village</h3>
              <p className="text-lg text-gray-400 mb-12 max-w-md">
                Invite parents, teachers or mentors to be your advocates. They receive weekly updates and cheer on your progress.
              </p>
              
              {/* Visual avatars */}
              <div className="flex -space-x-4">
                {['#fbbc04', '#2dc1c1', '#8b5cf6', '#3b82f6'].map((color, i) => (
                  <div key={i} className="w-14 h-14 rounded-full border-4 border-[#0a2530] flex items-center justify-center text-white font-bold text-lg shadow-lg" style={{ backgroundColor: color }}>
                    {['M', 'D', 'T', 'C'][i]}
                  </div>
                ))}
              </div>
            </article>
          </RevealWrapper>
        </div>
      </div>
    </section>
  );
}
