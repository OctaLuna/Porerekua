import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TeamGrid from '../components/animations/TeamGrid';

// --- Team Data ---
const TEAM_CATEGORIES = [
  {
    id: 'direccion',
    label: 'Dirección & Estrategia',
    members: [
      // NOTA: `photo` usa imágenes de muestra; reemplazar por retratos reales del equipo.
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

const ArrowDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <polyline points="19 12 12 19 5 12"></polyline>
  </svg>
);

// --- About Info Item Component ---
interface AboutItemProps {
  title: string;
  content: string;
}

const AboutItem: React.FC<AboutItemProps> = ({ title, content }) => (
  <motion.div
    className="mb-4 lg:mb-6"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
  >
    <h3 className="text-base lg:text-xl font-bold font-serif text-verde-brote mb-2 lg:mb-3 uppercase tracking-widest">
      {title}
    </h3>
    <p className="text-sm lg:text-base text-gris-piedra dark:text-beige-arena/80 leading-relaxed">
      {content}
    </p>
  </motion.div>
);

// --- Page ---
const NosotrosPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const firstSectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const container = scrollContainerRef.current;
      if (!container) return;

      const sections = Array.from(container.querySelectorAll('section')) as HTMLElement[];
      const currentIndex = Math.round(container.scrollTop / window.innerHeight);

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
        .snap-container {
          scroll-snap-type: y mandatory;
          scroll-behavior: smooth;
          overflow-y: scroll;
          -ms-overflow-style: none;
          scrollbar-width: none;
          height: 100vh;
          position: relative;
        }
        .snap-container::-webkit-scrollbar {
          display: none;
        }
        .snap-section {
          scroll-snap-align: start;
          scroll-snap-stop: always;
          position: relative;
          height: 100vh;
        }
      `}</style>

       <div ref={scrollContainerRef} className="snap-container">
         <section ref={firstSectionRef} className="snap-section relative w-full flex flex-col justify-center items-center text-center text-beige-arena pt-32 pb-10 px-4 sm:px-6 lg:px-8 overflow-y-auto">
           <div className="absolute inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: 'url(/images/background/bg11.jpg)' }} aria-hidden="true"></div>
           <div className="absolute inset-0 z-0 bg-noche-selva/35" aria-hidden="true"></div>
           <div className="relative z-10 w-full max-w-5xl">
              <div className="bg-blanco-puro/95 dark:bg-noche-selva/75 py-5 px-10 sm:py-8 sm:px-14 rounded-lg shadow-medium border border-carbon/10 dark:border-white/10 max-h-[calc(100vh-14rem)] overflow-y-auto">
                <h1 className="text-2xl sm:text-3xl font-bold font-serif text-carbon dark:text-beige-arena mb-8">
                  Una alianza entre bosque, comunidad y tecnología
                </h1>
                <div className="text-left">
                  <AboutItem
                    title="El nombre"
                    content={`Porerekua, voz guaraní que significa "ser solidario, compartir lo que se tiene", alude a la construcción colectiva de la sostenibilidad amazónica mediante el intercambio de conocimientos, experiencias y capacidades entre los distintos actores comprometidos con el territorio.`}
                  />
                  <AboutItem
                    title="¿Quiénes somos?"
                    content={`Porerekua, "ser solidario, compartir lo que se tiene", surge en el marco de la Cátedra Nazaria Ignacia "Querida Amazonía" de la Universidad Católica Boliviana "San Pablo" como un proyecto que busca visibilizar y articular iniciativas sostenibles de empresas y fundaciones comprometidas con la conservación de la Amazonía boliviana y el desarrollo de sus comunidades, como expresión de un compromiso con la sostenibilidad.`}
                  />
                </div>
              </div>
           </div>

          <motion.div
            className="absolute bottom-10 z-20 text-beige-arena"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1, ease: 'easeOut' }}
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              className="cursor-pointer"
              onClick={() => {
                const next = firstSectionRef.current?.nextElementSibling as HTMLElement | null;
                next?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <ArrowDownIcon />
            </motion.div>
          </motion.div>
        </section>

        <section
          className="snap-section relative w-full flex flex-col justify-center items-center text-center text-beige-arena pt-32 pb-10 px-4 sm:px-6 lg:px-8 overflow-y-auto"
          style={{
            backgroundImage: 'url(/images/background/bg4.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-carbon/40"></div>
          <div className="relative z-10 w-full max-w-6xl max-h-[calc(100vh-12rem)] overflow-y-auto">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif mb-3 sm:mb-4 text-beige-arena">Nuestro Propósito</h2>
            <p className="text-sm sm:text-base lg:text-lg text-beige-arena/90 max-w-3xl mx-auto mb-6 sm:mb-10">
              Visibilizar y articular iniciativas sostenibles promovidas por empresas y fundaciones locales en la Amazonía boliviana,
              como aporte al fortalecimiento de acciones de conservación y al bienestar de las comunidades que la habitan.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              <div className="bg-blanco-puro/95 dark:bg-noche-selva/60 p-5 lg:p-7 rounded-lg shadow-medium text-left backdrop-blur-md border border-carbon/10 dark:border-white/10">
                <h3 className="text-lg lg:text-xl font-bold text-verde-brote mb-2">Conectar</h3>
                <p className="text-sm lg:text-base text-carbon dark:text-beige-arena/80">Conectar empresas, fundaciones, la academia y sociedad civil en torno a iniciativas sostenibles en la Amazonía, promoviendo una plataforma de colaboración multiactor.</p>
              </div>
              <div className="bg-blanco-puro/95 dark:bg-noche-selva/60 p-5 lg:p-7 rounded-lg shadow-medium text-left backdrop-blur-md border border-carbon/10 dark:border-white/10">
                <h3 className="text-lg lg:text-xl font-bold text-verde-brote mb-2">Promover</h3>
                <p className="text-sm lg:text-base text-carbon dark:text-beige-arena/80">Promover acciones orientadas a la conservación de la biodiversidad y la protección de los ecosistemas amazónicos.</p>
              </div>
              <div className="bg-blanco-puro/95 dark:bg-noche-selva/60 p-5 lg:p-7 rounded-lg shadow-medium text-left backdrop-blur-md border border-carbon/10 dark:border-white/10">
                <h3 className="text-lg lg:text-xl font-bold text-verde-brote mb-2">Empoderar</h3>
                <p className="text-sm lg:text-base text-carbon dark:text-beige-arena/80">Empoderar a las comunidades locales e indígenas en procesos que fortalezcan su desarrollo y reconozcan sus saberes y prácticas.</p>
              </div>
              <div className="bg-blanco-puro/95 dark:bg-noche-selva/60 p-5 lg:p-7 rounded-lg shadow-medium text-left backdrop-blur-md border border-carbon/10 dark:border-white/10">
                <h3 className="text-lg lg:text-xl font-bold text-verde-brote mb-2">Garantizar</h3>
                <p className="text-sm lg:text-base text-carbon dark:text-beige-arena/80">Garantizar el acceso a información sobre estas iniciativas a través de datos verificados y estructurados, que aporten a la investigación y a la formulación de políticas públicas basadas en evidencia.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="snap-section relative w-full flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-y-auto pt-32 pb-10">
          <div className="absolute inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: 'url(/images/background/bg3.jpg)' }} aria-hidden="true"></div>
          <div className="absolute inset-0 z-0 bg-noche-selva/45" aria-hidden="true"></div>

           <motion.div
             className="relative z-10 w-full max-w-5xl rounded-2xl backdrop-blur-md bg-beige-arena/80 dark:bg-noche-selva/55 border border-white/40 dark:border-beige-arena/10 px-5 py-6 sm:px-8 sm:py-8 md:px-10 md:py-10 shadow-medium max-h-[calc(100vh-11rem)] overflow-y-auto"
             initial={{ opacity: 0, y: 40 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.7, delay: 0.15, ease: 'easeOut' }}
           >
            <h2 className="text-xl sm:text-2xl font-bold font-serif text-carbon dark:text-beige-arena text-center mb-5 md:mb-7">Personas detrás del proyecto</h2>

            <div className="flex justify-center flex-wrap gap-2 mb-5 md:mb-8">
              {TEAM_CATEGORIES.map((cat, i) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(i)}
                  className={`px-4 py-1.5 md:px-5 md:py-2 text-xs md:text-sm font-medium rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-verde-brote/40 ${
                    activeCategory === i
                      ? 'bg-white dark:bg-blanco-puro/10 text-verde-brote border border-verde-brote/30 shadow-sm'
                      : 'bg-transparent text-gris-piedra dark:text-beige-arena/50 border border-transparent hover:text-carbon dark:hover:text-beige-arena'
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
          </motion.div>
        </section>
      </div>
    </>
  );
};

export default NosotrosPage;