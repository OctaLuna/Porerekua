import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import HomeChapters from '../components/animations/HomeChapters';
import { gsap, SplitText, useGSAP } from '../components/animations/gsap-setup';

const ArrowDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <polyline points="19 12 12 19 5 12"></polyline>
  </svg>
);

const HomePage: React.FC = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement | null>(null);
  const heroTitleRef = useRef<HTMLHeadingElement>(null);

  // Revelado del título del hero con GSAP SplitText (cascada de letras).
  useGSAP(
    () => {
      const el = heroTitleRef.current;
      if (!el) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const split = new SplitText(el, { type: 'chars' });
      gsap.from(split.chars, {
        y: 60, autoAlpha: 0, duration: 0.9, stagger: 0.05, ease: 'power3.out', delay: 0.15,
      });
      return () => split.revert();
    },
    { scope: heroRef },
  );

  // Navegación por teclado entre anclajes de nivel superior (scroll de ventana).
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const container = scrollContainerRef.current;
      if (!container) return;

      const sections = Array.from(
        container.querySelectorAll(':scope > section, :scope > .home-chapters'),
      ) as HTMLElement[];
      const y = window.scrollY;
      let currentIndex = 0;
      sections.forEach((s, i) => {
        if (s.offsetTop <= y + window.innerHeight * 0.5) currentIndex = i;
      });

      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        sections[Math.min(currentIndex + 1, sections.length - 1)]?.scrollIntoView({ behavior: 'smooth' });
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        sections[Math.max(currentIndex - 1, 0)]?.scrollIntoView({ behavior: 'smooth' });
      } else if (e.key === 'Home') {
        e.preventDefault();
        sections[0]?.scrollIntoView({ behavior: 'smooth' });
      } else if (e.key === 'End') {
        e.preventDefault();
        sections[sections.length - 1]?.scrollIntoView({ behavior: 'smooth' });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <style>{`
        /* Scroll de ventana: Lenis lo suaviza y ScrollTrigger puede pinear
           la secuencia de capítulos (incompatible con scroll-snap mandatory). */
        .snap-section { position: relative; min-height: 100vh; }
      `}</style>

      <div ref={scrollContainerRef} className="snap-container">
        {/* Hero */}
        <section
          ref={heroRef}
          className="snap-section relative w-full flex flex-col items-center justify-center text-center text-white overflow-hidden bg-noche-selva"
        >
          <div
            className="absolute inset-0 w-full h-full z-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: 'url(/images/background/bg.png)' }}
            aria-hidden="true"
          ></div>
          <div className="absolute inset-0 z-10 bg-noche-selva/15" aria-hidden="true"></div>
          <div className="relative z-20 p-4 pt-32">
            <h1
              ref={heroTitleRef}
              className="text-4xl sm:text-5xl md:text-7xl font-extrabold font-serif text-beige-arena mb-4"
              style={{ textShadow: '0 2px 8px rgba(0,0,0,0.7)' }}
            >
              Porerekua
            </h1>
            <motion.p
              className="text-xl text-beige-arena max-w-3xl mx-auto mb-8"
              style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6, ease: 'easeOut' }}
            >
              Ser solidario, compartir lo que se tiene
            </motion.p>
          </div>
          <motion.div
            className="absolute bottom-10 z-20"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1, ease: 'easeOut' }}
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              className="cursor-pointer"
              onClick={() => {
                const next = heroRef.current?.nextElementSibling as HTMLElement | null;
                next?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <ArrowDownIcon />
            </motion.div>
          </motion.div>
        </section>

        {/* Capítulos estilo Floema (Conservación → Únete) */}
        <HomeChapters />
      </div>
    </>
  );
};

export default HomePage;
