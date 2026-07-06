import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import HomeChapters from '../components/animations/HomeChapters';
import { gsap, SplitText, useGSAP } from '../components/animations/gsap-setup';
import Reveal from '../components/animations/Reveal';
import FlowLine from '../components/animations/FlowLine';
import StatCounter from '../components/animations/StatCounter';
import BentoCard from '../components/ui/BentoCard';
import Marquee from '../components/ui/Marquee';
import { useDashboardPublicoResumen } from '../hooks/useDashboard';

// Sección de estadísticas reales en bento grid + marquee de palabras clave.
const HomeStats: React.FC = () => {
  const { data: resumen } = useDashboardPublicoResumen();
  const stats = [
    { value: resumen?.total_proyectos ?? 0, label: 'Proyectos en la red' },
    { value: resumen?.total_organizaciones ?? 0, label: 'Organizaciones' },
    { value: resumen?.total_empresas ?? 0, label: 'Empresas aliadas' },
    { value: resumen?.departamentos_con_actividad ?? 0, label: 'Departamentos' },
  ];
  const keywords = ['Bosque', 'Comunidad', 'Tecnología', 'Sostenibilidad', 'Amazonía', 'Conservación', 'Kaa Iya'];

  return (
    <section className="snap-section relative w-full overflow-hidden bg-noche-selva py-24 text-beige-arena">
      <div className="absolute inset-0 bg-cover bg-center opacity-10" style={{ backgroundImage: 'url(/images/background/bg2.jpg)' }} aria-hidden="true" />
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto mb-12 max-w-2xl text-center" y={24}>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amarillo-sol">La red en números</p>
          <h2 className="relative mt-2 inline-block font-serif text-4xl font-extrabold md:text-5xl">
            Un bosque de <span className="text-verde-brote">iniciativas</span>
            <FlowLine className="absolute -bottom-3 left-1/4 right-1/4 h-3 text-verde-brote" scrub />
          </h2>
          <p className="mt-4 text-beige-arena/70">
            Datos vivos de la plataforma: proyectos, aliados y territorios que articulan la conservación de la Amazonía boliviana.
          </p>
        </Reveal>

        <div className="grid auto-rows-[minmax(150px,1fr)] grid-cols-2 gap-4 lg:grid-cols-4">
          <BentoCard image="/images/background/bg3.jpg" eyebrow="Territorio" className="group col-span-2 row-span-2 min-h-[316px]">
            <div className="mt-auto">
              <h3 className="font-serif text-2xl font-bold">Corredores que conectan vida</h3>
              <p className="mt-1 text-sm text-beige-arena/85">Del Chiquitano al Pantanal: paisajes protegidos por comunidades y ciencia.</p>
            </div>
          </BentoCard>

          {stats.map((s) => (
            <BentoCard key={s.label} interactive className="justify-between">
              <StatCounter value={s.value} className="font-serif text-4xl font-extrabold text-verde-brote md:text-5xl" />
              <p className="mt-2 text-sm font-medium text-gris-piedra dark:text-beige-arena/70">{s.label}</p>
            </BentoCard>
          ))}
        </div>
      </div>

      <Marquee
        className="mt-16 border-y border-white/10 py-4"
        itemClassName="font-serif text-2xl font-bold uppercase tracking-wide text-beige-arena/80"
        items={keywords}
      />
    </section>
  );
};

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

        {/* Estadísticas reales en bento grid + marquee */}
        <HomeStats />

        {/* Capítulos estilo Floema (Conservación → Únete) */}
        <HomeChapters />
      </div>
    </>
  );
};

export default HomePage;
