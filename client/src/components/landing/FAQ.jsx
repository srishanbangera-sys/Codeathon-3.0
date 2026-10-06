import { Users, Gift, Clock, ShieldCheck, ChevronDown, MessageCircle } from 'lucide-react';
import RevealWrapper from '../RevealWrapper';

export default function FAQ() {
  const faqs = [
    {
      icon: Users,
      question: "Can parents or teachers see my progress?",
      answer: "Yes, you can invite them to view your progress dashboard so they can cheer you on and track the milestones you've hit."
    },
    {
      icon: Gift,
      question: "What rewards can I choose?",
      answer: "You can set any custom reward you like—whether it's extra gaming time, a new book, or a special outing."
    },
    {
      icon: Clock,
      question: "How are milestones tracked?",
      answer: "StudyPilot tracks your study hours automatically and updates your progress towards goals in real-time."
    },
    {
      icon: ShieldCheck,
      question: "Is my data safe and private?",
      answer: "Yes, we use industry-standard encryption to keep your data secure. We never share your personal information."
    }
  ];

  return (
    <section id="faq" className="py-24 md:py-32 w-full bg-[#051c24] overflow-hidden">
      <div className="w-full max-w-[1200px] mx-auto px-6 grid md:grid-cols-[1fr_1.2fr] gap-16 items-center">
        
        {/* Left Side Content */}
        <RevealWrapper delay={100} className="w-full max-w-md">
          
          <div className="relative w-32 h-32 mb-8 ml-4">
             {/* Decorative Chat Bubbles */}
             <div className="absolute top-4 right-4 w-16 h-16 bg-[#2dc1c1] rounded-2xl rounded-br-sm shadow-lg flex items-center justify-center transform -rotate-6 z-10 border border-white/10">
               <span className="text-white text-3xl font-bold">?</span>
             </div>
             <div className="absolute bottom-4 left-4 w-14 h-14 bg-[#0a2530] rounded-2xl rounded-bl-sm shadow-[0_8px_30px_rgba(0,0,0,0.3)] flex items-center justify-center transform rotate-6 border border-white/5">
               <span className="text-[#2dc1c1] text-2xl font-bold mb-2">...</span>
             </div>
             {/* decorative lines */}
             <div className="absolute -top-2 left-6 w-1 h-3 bg-[#2dc1c1] rounded-full transform -rotate-45 opacity-80"></div>
             <div className="absolute top-2 left-2 w-1 h-3 bg-[#2dc1c1] rounded-full transform -rotate-12 opacity-80"></div>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#2dc1c1]/10 mb-6 border border-[#2dc1c1]/20">
            <MessageCircle size={14} className="text-[#2dc1c1]" />
            <span className="text-[#2dc1c1] font-bold text-xs tracking-widest uppercase">FAQ</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-[1.15] tracking-tight">
            Got questions?<br/>
            <span className="text-[#2dc1c1]">We've got answers.</span>
          </h2>
          
          <p className="text-[16px] text-gray-400 mb-8 leading-relaxed font-medium">
            Find quick answers to the most common questions about StudyPilot and how it works.
          </p>

        </RevealWrapper>

        {/* Right Side Accordion */}
        <div className="w-full flex flex-col gap-3">
          {faqs.map((faq, i) => (
            <RevealWrapper key={i} delay={200 + (i * 100)}>
              <details className="group bg-[#0a2530] rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.1)] border border-white/5 overflow-hidden transition-all hover:border-white/10 hover:shadow-[0_8px_30px_rgba(0,0,0,0.2)]">
                <summary className="flex items-center justify-between cursor-pointer list-none p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2dc1c1]">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-[#2dc1c1]">
                      <faq.icon size={20} strokeWidth={2.5} />
                    </div>
                    <span className="text-white text-[15px] font-bold group-hover:text-[#2dc1c1] transition-colors">{faq.question}</span>
                  </div>
                  <span className="text-[#2dc1c1] transition-transform group-open:-rotate-180 bg-white/5 w-8 h-8 rounded-full flex items-center justify-center">
                    <ChevronDown size={18} strokeWidth={2.5} />
                  </span>
                </summary>
                <div className="text-gray-400 text-[14px] font-medium leading-relaxed px-5 pb-5 pl-19">
                  {faq.answer}
                </div>
              </details>
            </RevealWrapper>
          ))}
        </div>

      </div>
    </section>
  );
}
