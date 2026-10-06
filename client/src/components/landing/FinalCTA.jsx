import { Link } from 'react-router-dom';

export default function FinalCTA() {
  return (
    <section className="py-24 md:py-32 w-full bg-[#06212a] text-left px-6">
      <div className="w-full max-w-6xl mx-auto bg-gradient-to-br from-[#0a2530] to-[#051c24] border border-white/5 rounded-2xl p-12 md:p-20 flex flex-col md:flex-row items-center justify-between gap-12 shadow-[0_8px_30px_rgba(0,0,0,0.3)] relative overflow-hidden">
        
        {/* Glow effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[#2dc1c1]/5 blur-3xl pointer-events-none"></div>

        <div className="max-w-xl relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            Take the lead in your studies.
          </h2>
          <p className="text-xl text-gray-400 mb-0">
            Join LearnBuddy today and let your progress earn you the rewards you actually want.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0 relative z-10">
          <Link to="/register" className="bg-[#fbbc04] text-[#051c24] hover:bg-[#e5ab00] font-bold px-8 py-4 rounded-full text-lg w-full sm:w-auto shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fbbc04] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a2530] transition-transform hover:scale-[1.02] active:scale-[0.98] text-center">
            Sign up today
          </Link>
          <Link to="/login" className="bg-transparent border border-white/20 text-white hover:bg-white/5 font-semibold rounded-full px-8 py-4 text-lg w-full sm:w-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a2530] text-center transition-colors">
            Log in
          </Link>
        </div>
      </div>
    </section>
  );
}
