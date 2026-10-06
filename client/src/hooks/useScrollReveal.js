import { useEffect, useRef } from 'react';
import { animate, set } from 'animejs';

export function useScrollReveal(options = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Initial state
    set(el, { opacity: 0, translateY: 30 });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animate(el, {
            opacity: 1,
            translateY: 0,
            duration: 800,
            ease: 'outCubic',
            delay: options.delay || 0,
            ...options
          });
          observer.unobserve(el);
        }
      });
    }, {
      threshold: options.threshold || 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    observer.observe(el);

    return () => observer.disconnect();
  }, [options]);

  return ref;
}
