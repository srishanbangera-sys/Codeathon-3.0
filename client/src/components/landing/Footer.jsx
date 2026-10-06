export default function Footer() {
  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="w-full bg-[#051c24] py-12 border-t border-white/5">
      <div className="w-full max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2 text-white">
          <div className="w-8 h-8 rounded-lg bg-[#2dc1c1] flex items-center justify-center">
            <span className="text-white font-bold text-lg leading-none">S</span>
          </div>
          <span className="text-xl font-bold tracking-tight">StudyPilot</span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400 font-medium">
          <button onClick={() => scrollToSection('features')} className="hover:text-[#2dc1c1] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2dc1c1] rounded px-1">Features</button>
          <button onClick={() => scrollToSection('how')} className="hover:text-[#2dc1c1] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2dc1c1] rounded px-1">How it works</button>
          <button onClick={() => scrollToSection('faq')} className="hover:text-[#2dc1c1] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2dc1c1] rounded px-1">FAQ</button>
          <a href="#" className="hover:text-[#2dc1c1] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2dc1c1] rounded px-1">Privacy</a>
          <a href="#" className="hover:text-[#2dc1c1] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2dc1c1] rounded px-1">Terms</a>
        </div>

        <div className="text-sm text-gray-500">
          © 2026 StudyPilot
        </div>
      </div>
    </footer>
  );
}
