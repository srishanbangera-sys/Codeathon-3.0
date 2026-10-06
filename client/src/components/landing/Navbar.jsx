import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="w-full bg-[#051c24] sticky top-0 z-50 border-b border-white/5">
      <div className="w-full max-w-[1200px] mx-auto px-6 h-[80px] flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2dc1c1] rounded" aria-label="LearnBuddy Home">
          <div className="w-9 h-9 rounded-lg bg-[#2dc1c1] flex items-center justify-center">
            <span className="text-white font-bold text-xl leading-none">S</span>
          </div>
          <span className="text-[22px] font-bold tracking-tight">LearnBuddy</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-10 text-[15px] font-medium text-white/70">
          <button onClick={() => scrollToSection('features')} className="hover:text-white transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2dc1c1] rounded px-2 py-1">Features</button>
          <button onClick={() => scrollToSection('how')} className="hover:text-white transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2dc1c1] rounded px-2 py-1">How it works</button>
          <button onClick={() => scrollToSection('rewards')} className="hover:text-white transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2dc1c1] rounded px-2 py-1">Rewards</button>
          <button onClick={() => scrollToSection('faq')} className="hover:text-white transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2dc1c1] rounded px-2 py-1">FAQ</button>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <Link to="/login" className="px-6 py-2.5 rounded-full border border-white/20 text-white font-semibold text-[15px] hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2dc1c1]">
            Log in
          </Link>
          <Link to="/register" className="px-6 py-2.5 rounded-full bg-[#fbbc04] text-[#051c24] font-bold text-[15px] hover:bg-[#e6ab03] transition-colors shadow-[0_0_15px_rgba(251,188,4,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2dc1c1]">
            Get started
          </Link>
        </div>

        <button aria-label="Toggle mobile menu" className="md:hidden text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2dc1c1] rounded p-1" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden absolute top-[80px] left-0 w-full bg-[#051c24] border-b border-white/5 p-6 flex flex-col gap-4 shadow-xl">
          <button onClick={() => scrollToSection('features')} className="text-white/70 hover:text-white text-left text-lg font-medium">Features</button>
          <button onClick={() => scrollToSection('how')} className="text-white/70 hover:text-white text-left text-lg font-medium">How it works</button>
          <button onClick={() => scrollToSection('rewards')} className="text-white/70 hover:text-white text-left text-lg font-medium">Rewards</button>
          <button onClick={() => scrollToSection('faq')} className="text-white/70 hover:text-white text-left text-lg font-medium">FAQ</button>
          <div className="h-px bg-white/10 my-2"></div>
          <Link to="/login" className="px-6 py-3 rounded-full border border-white/20 text-white font-semibold text-center hover:bg-white/5">Log in</Link>
          <Link to="/register" className="px-6 py-3 rounded-full bg-[#fbbc04] text-[#051c24] font-bold text-center hover:bg-[#e6ab03]">Get started</Link>
        </div>
      )}
    </nav>
  );
}
