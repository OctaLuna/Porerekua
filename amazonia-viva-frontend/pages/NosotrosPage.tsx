import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TeamGrid from '../components/animations/TeamGrid';
import Reveal from '../components/animations/Reveal';
import FlowLine from '../components/animations/FlowLine';
import { gsap, ScrollTrigger, useGSAP } from '../components/animations/gsap-setup';
import { prefersReducedMotion } from '../components/animations/motion';

// --- Datos del equipo (fotos de muestra; reemplazar por retratos reales) ---
const TEAM_CATEGORIES = [
  {
    id: 'direccion',
    label: 'Dirección & Estrategia',
    members: [
      { initials: 'LR', name: 'Lucía Ramírez', role: 'Dirección creativa y visión estratégica', photo: '/images/animation/2.jpg', bio: 'Lidera la dirección creativa y la visión estratégica del proyecto, articulando el trabajo entre comunidades, academia y aliados institucionales en la Amazonía boliviana.' },
      { initials: 'JP', name: 'Jorge Peña', role: 'Estratega de impacto y relaciones institucionales', photo: '/images/animation/3.jpg', bio: 'Diseña la estrategia de impacto y gestiona las relaciones institucionales, tejiendo alianzas con empresas y fundaciones comprometidas con la sostenibilidad amazónica.' },
      { initials: 'MQ', name: 'Mara Quispe', role: 'Coordinación comunitaria — Amazonas peruano', photo: '/images/animation/4.jpg', bio: 'Coordina el vínculo con las comunidades del Amazonas, asegurando que sus saberes y prioridades guíen las iniciativas de conservación y desarrollo.' },
    ],
  },
  {
    id: 'digital',
    label: 'Experiencia Digital',
    members: [
      { initials: 'AS', name: 'Andrés Silva', role: 'Desarrollo de plataformas y arquitectura web' },
      { initials: 'VP', name: 'Valentina Prada', role: 'Diseño UX/UI e identidad visual' },
      { initials: 'CR', name: 'Carlos Ríos', role: 'Georreferenciación y sistemas de datos espaciales' },
    ],
  },
  {
    id: 'contenido',
    label: 'Contenido & Narrativa',
    members: [
      { initials: 'SR', name: 'Sofía Ramos', role: 'Narrativa científica y comunicación ambiental' },
      { initials: 'EB', name: 'Elena Bautista', role: 'Fotografía documental y edición visual' },
      { initials: 'FM', name: 'Felipe Mora', role: 'Investigación de campo y etnobotánica' },
    ],
  },
];

// Tres pilares del proyecto (textos reales del proyecto reencuadrados).
const PILLARS = [
  { key: 'bosque', num: '01', eyebrow: 'Bosque', title: 'Conservar la selva viva', text: 'Promover acciones orientadas a la conservación de la biodiversidad y la protección de los ecosistemas amazónicos.', img: '/images/background/bg2.jpg' },
  { key: 'comunidad', num: '02', eyebrow: 'Comunidad', title: 'Con y para las comunidades', text: 'Empoderar a las comunidades locales e indígenas en procesos que fortalezcan su desarrollo y reconozcan sus saberes y prácticas.', img: '/images/background/bg3.jpg' },
  { key: 'tecnologia', num: '03', eyebrow: 'Tecnología', title: 'Datos que sostienen decisiones', text: 'Garantizar el acceso a información sobre estas iniciativas mediante datos verificados y estructurados, que aporten a la investigación y a políticas públicas basadas en evidencia.', img: '/images/background/bg11.jpg' },
];

const ArrowDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <polyline points="19 12 12 19 5 12" />
  </svg>
);

// --- Sección de tres pilares: sticky + cross-fade scrubbed por scroll ---
const PillarsSection: React.FC = () => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [pinned] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 768 && !prefersReducedMotion());

  useGSAP(
    () => {
      if (!pinned || !wrapRef.current) return;
      const panels = gsap.utils.toArray<HTMLElement>('.pillar-panel', wrapRef.current);
      gsap.set(panels, { autoAlpha: 0 });
      gsap.set(panels[0], { autoAlpha: 1 });
      const st = ScrollTrigger.create({
        trigger: wrapRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.5,
        onUpdate: (self) => {
          const p = self.progress * (panels.length - 1);
          panels.forEach((panel, i) => gsap.set(panel, { autoAlpha: 1 - Math.min(Math.abs(p - i), 1) }));
        },
      });
      return () => st.kill();
    },
    { scope: wrapRef, dependencies: [pinned] },
  );

  return (
    <section ref={wrapRef} className={pinned ? 'relative h-[300vh] bg-noche-selva' : 'bg-noche-selva'}>
      <div className={pinned ? 'sticky top-0 h-screen overflow-hidden' : ''}>
        {PILLARS.map((p, i) => (
          <article
            key={p.key}
            className={`pillar-panel flex ${pinned ? 'absolute inset-0' : 'relative min-h-screen'} items-center justify-center overflow-hidden text-beige-arena`}
          >
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${p.img})` }} aria-hidden="true" />
            <div className="absolute inset-0 bg-gradient-to-t from-noche-selva via-noche-selva/70 to-noche-selva/40" aria-hidden="true" />
            <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
              <span className="font-serif text-6xl font-extrabold text-white/15">{p.num}</span>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.25em] text-amarillo-sol">{p.eyebrow}</p>
              <h3 className="relative mt-3 inline-block font-serif text-4xl font-extrabold md:text-6xl">
                {p.title}
                <FlowLine className="absolute -bottom-4 left-1/4 right-1/4 h-3 text-verde-brote" active />
              </h3>
              <p className="mx-auto mt-6 max-w-xl text-lg text-beige-arena/85">{p.text}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

// --- Página ---
const NosotrosPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState(0);

  // Navegación por teclado entre secciones (scroll de ventana; Lenis lo suaviza).
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End'].includes(e.key)) return;
      const sections = Array.from(document.querySelectorAll('main section')) as HTMLElement[];
      if (!sections.length) return;
      const y = window.scrollY;
      let idx = 0;
      sections.forEach((s, i) => { if (s.offsetTop <= y + window.innerHeight * 0.5) idx = i; });
      e.preventDefault();
      if (e.key === 'ArrowDown' || e.key === 'PageDown') sections[Math.min(idx + 1, sections.length - 1)]?.scrollIntoView({ behavior: 'smooth' });
      else if (e.key === 'ArrowUp' || e.key === 'PageUp') sections[Math.max(idx - 1, 0)]?.scrollIntoView({ behavior: 'smooth' });
      else if (e.key === 'Home') sections[0]?.scrollIntoView({ behavior: 'smooth' });
      else if (e.key === 'End') sections[sections.length - 1]?.scrollIntoView({ behavior: 'smooth' });
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div>
      {/* 1. Tesis a pantalla completa */}
      <section className="relative flex min-h-screen w-full items-center justify-center overflow-hidden text-center text-beige-arena">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(/images/background/bg11.jpg)' }} aria-hidden="true" />
        <div className="absolute inset-0 bg-noche-selva/55" aria-hidden="true" />
        <div className="relative z-10 max-w-4xl px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amarillo-sol">Quiénes somos</p>
          <h1 className="relative mt-4 inline-block font-serif text-4xl font-extrabold leading-tight sm:text-5xl md:text-7xl" style={{ textShadow: '0 2px 12px rgba(0,0,0,0.6)' }}>
            Una alianza entre <span className="text-verde-brote">bosque</span>, comunidad y tecnología
            <FlowLine className="absolute -bottom-4 left-0 right-0 h-4 text-verde-brote" scrub />
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-beige-arena/85">
            Una plataforma que visibiliza y articula iniciativas sostenibles para la conservación de la Amazonía boliviana.
          </p>
        </div>
        <motion.div
          className="absolute bottom-10 z-20"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
        >
          <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}>
            <ArrowDownIcon />
          </motion.div>
        </motion.div>
      </section>

      {/* 2. Etimología guaraní — tipografía grande + espacio negativo */}
      <section className="relative bg-beige-arena py-24 dark:bg-noche-selva md:py-36">
        <div className="container mx-auto max-w-4xl px-6">
          <Reveal y={24}>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-terracota">El nombre</p>
            <h2 className="relative mt-3 inline-block font-serif text-6xl font-extrabold text-carbon dark:text-beige-arena md:text-8xl">
              Porerekua
              <FlowLine className="absolute -bottom-3 left-0 h-4 w-2/3 text-terracota" scrub />
            </h2>
            <p className="mt-8 max-w-2xl font-serif text-2xl leading-relaxed text-carbon/90 dark:text-beige-arena/90 md:text-3xl">
              Voz guaraní que significa <span className="text-verde-brote">«ser solidario, compartir lo que se tiene»</span>.
            </p>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-gris-piedra dark:text-beige-arena/70">
              Alude a la construcción colectiva de la sostenibilidad amazónica mediante el intercambio de conocimientos,
              experiencias y capacidades entre los actores comprometidos con el territorio. Surge en el marco de la Cátedra
              Nazaria Ignacia «Querida Amazonía» de la Universidad Católica Boliviana «San Pablo».
            </p>
          </Reveal>
        </div>
      </section>

      {/* 3. Tres pilares fijados */}
      <PillarsSection />

      {/* 4. Equipo */}
      <section className="relative flex w-full items-center justify-center overflow-hidden px-4 py-24 sm:px-6 lg:px-8">
        <div className="absolute inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: 'url(/images/background/bg3.jpg)' }} aria-hidden="true" />
        <div className="absolute inset-0 z-0 bg-noche-selva/55" aria-hidden="true" />
        <Reveal className="relative z-10 w-full max-w-5xl rounded-2xl border border-white/40 bg-beige-arena/85 px-5 py-8 shadow-medium backdrop-blur-md dark:border-beige-arena/10 dark:bg-noche-selva/60 sm:px-8 md:px-10" y={30}>
          <p className="text-center text-xs font-semibold uppercase tracking-[0.25em] text-terracota">El equipo</p>
          <h2 className="mt-2 mb-6 text-center font-serif text-2xl font-bold text-carbon dark:text-beige-arena sm:text-3xl">Personas detrás del proyecto</h2>

          <div className="mb-6 flex flex-wrap justify-center gap-2">
            {TEAM_CATEGORIES.map((cat, i) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(i)}
                className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-verde-brote/40 md:px-5 md:py-2 md:text-sm ${
                  activeCategory === i
                    ? 'border border-verde-brote/30 bg-white text-verde-brote shadow-sm dark:bg-blanco-puro/10'
                    : 'border border-transparent bg-transparent text-gris-piedra hover:text-carbon dark:text-beige-arena/50 dark:hover:text-beige-arena'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              <TeamGrid members={TEAM_CATEGORIES[activeCategory].members} />
            </motion.div>
          </AnimatePresence>
        </Reveal>
      </section>
    </div>
  );
};

export default NosotrosPage;
