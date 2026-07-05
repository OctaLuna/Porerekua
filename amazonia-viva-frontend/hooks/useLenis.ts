import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger } from '../components/animations/gsap-setup';

/**
 * Global smooth-scroll (Lenis) wired into the GSAP ticker so ScrollTrigger stays
 * in sync. Only affects window-scrolled pages (e.g. the reworked Home). Pages that
 * still use their own internal `.snap-container` scroller are left untouched.
 *
 * Respects `prefers-reduced-motion` and disables wheel smoothing on mobile.
 */
export function useLenis() {
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: window.innerWidth > 768,
    });

    lenis.on('scroll', ScrollTrigger.update);

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, []);
}
