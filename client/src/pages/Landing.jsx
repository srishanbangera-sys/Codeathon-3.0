import Navbar from '../components/landing/Navbar';
import Hero from '../components/landing/Hero';
import FeatureBento from '../components/landing/FeatureBento';
import HowItWorks from '../components/landing/HowItWorks';
import RewardBadges from '../components/landing/RewardBadges';
import FAQ from '../components/landing/FAQ';
import FinalCTA from '../components/landing/FinalCTA';
import Footer from '../components/landing/Footer';

export default function Landing() {
  return (
    <div className="w-full min-h-screen flex flex-col items-center bg-[var(--color-primary-dark)] text-white font-sans selection:bg-[var(--color-primary)] selection:text-white">
      <Navbar />
      <main className="w-full">
        <Hero />
        <FeatureBento />
        <HowItWorks />
        <RewardBadges />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
