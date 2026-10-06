import { useScrollReveal } from '../hooks/useScrollReveal';

export default function RevealWrapper({ children, className = "", delay = 0, threshold = 0.1, translateY = 30 }) {
  const ref = useScrollReveal({ delay, threshold, translateY });
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
