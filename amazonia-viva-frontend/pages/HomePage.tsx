import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';
import ProjectList from '../features/ProjectList/ProjectList';
import { useProyectos } from '../hooks/useProyectos';
import Skeleton from '../components/ui/Skeleton';
import Card from '../components/ui/Card';
import Logo from '../components/layout/Logo';

const HOME_PANEL_TITLE_CLASS = 'text-2xl sm:text-3xl md:text-4xl font-bold font-serif text-carbon dark:text-beige-arena mt-1 mb-3';

// Icons
const LeafIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path>
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path>
  </svg>
);

const PawPrintIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="11" cy="4" r="2"></circle>
    <circle cx="18" cy="8" r="2"></circle>
    <circle cx="20" cy="16" r="2"></circle>
    <path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z"></path>
  </svg>
);

const FlaskConicalIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M10 2v7.31"></path>
    <path d="M14 9.31V2"></path>
    <path d="M8.5 12.31 4 22h16l-4.5-9.69"></path>
    <path d="M10 16h4"></path>
  </svg>
);

// Icons
const ArrowDownIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <polyline points="19 12 12 19 5 12"></polyline>
    </svg>
);

const HomePage: React.FC = () => {
  const { data: projectsPage, isLoading } = useProyectos({ limit: 3 });
  const projects = projectsPage?.data;
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement | null>(null);

  // Keyboard navigation between sections
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const container = scrollContainerRef.current;
      if (!container) return;

      const sections = Array.from(container.querySelectorAll('section')) as HTMLElement[];
      const currentScrollTop = container.scrollTop;
      const sectionHeight = window.innerHeight;
      const currentIndex = Math.round(currentScrollTop / sectionHeight);

      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        const nextIndex = Math.min(currentIndex + 1, sections.length - 1);
        sections[nextIndex]?.scrollIntoView({ behavior: 'smooth' });
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        const prevIndex = Math.max(currentIndex - 1, 0);
        sections[prevIndex]?.scrollIntoView({ behavior: 'smooth' });
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

  const renderSkeletons = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={index}>
          <Skeleton className="w-full h-48" />
          <div className="p-4">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full mb-4" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

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

      <div 
        ref={scrollContainerRef} 
        className="snap-container"
      >
        {/* Act I: Image Hero */}
        <section ref={heroRef} className="snap-section relative w-full flex flex-col items-center justify-center text-center text-white overflow-hidden bg-noche-selva">
          <div
            className="absolute inset-0 w-full h-full z-0 bg-cover bg-center bg-no-repeat filter blur-[6px] saturate-90 brightness-[0.75] scale-105"
            style={{ backgroundImage: 'url(/images/background/bg.png)' }}
            aria-hidden="true"
          ></div>
          <div className="absolute inset-0 z-10 bg-noche-selva/35" aria-hidden="true"></div>

          <div className="relative z-20 w-full max-w-3xl px-4 pt-28 pb-8 my-auto">
            <div className="rounded-2xl p-6 sm:p-10 backdrop-blur-md bg-blanco-puro/90 dark:bg-noche-selva/85 border border-carbon/10 dark:border-white/10 shadow-2xl text-center">
              <div className="inline-flex items-center justify-center mb-3">
                <Logo className="h-10 sm:h-12 w-auto text-verde-hoja-seca dark:text-verde-brote" />
              </div>
              <motion.h1
                className="text-3xl sm:text-5xl md:text-6xl font-extrabold font-serif text-carbon dark:text-beige-arena mb-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              >
                Porerekua
              </motion.h1>
              <motion.p
                className="text-xs sm:text-sm font-semibold uppercase tracking-[0.35em] text-terracota mb-5"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
              >
                Ser solidario, compartir lo que se tiene
              </motion.p>
              <motion.div
                className="max-w-2xl mx-auto space-y-2 text-carbon/90 dark:text-beige-arena/90 mb-7"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
              >
                <p className="text-base sm:text-xl font-medium leading-snug">
                  Conectamos iniciativas que cuidan la Amazonía.
                </p>
                <p className="text-xs sm:text-base text-gris-piedra dark:text-beige-arena/75 leading-relaxed">
                  Registra tu aporte y forma parte de una red que impulsa conservación, conocimiento y bienestar comunitario.
                </p>
              </motion.div>
            </div>
          </div>

          <motion.div
            className="absolute bottom-6 z-20 text-beige-arena"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1, ease: "easeOut" }}
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="cursor-pointer"
              onClick={() => {
                try {
                  const next = heroRef.current?.nextElementSibling as HTMLElement | null;
                  if (next) {
                    next.scrollIntoView({ behavior: 'smooth' });
                    return;
                  }
                } catch (e) {
                  // fallback
                }
                scrollContainerRef.current?.scrollTo({ top: scrollContainerRef.current.clientHeight, behavior: 'smooth' });
              }}
            >
              <ArrowDownIcon />
            </motion.div>
          </motion.div>
        </section>

        {/* CONSERVACIÓN */}
        <section className="snap-section w-full flex flex-col justify-center items-center text-center relative overflow-hidden bg-noche-selva">
          <div className="absolute inset-0 z-0 overflow-hidden">
            <img src="/images/background/bg2.jpg" alt="Un manto de vida" className="w-full h-full object-cover filter blur-[6px] saturate-90 brightness-[0.75] scale-105" />
            <div className="absolute inset-0 bg-noche-selva/40"></div>
          </div>
          <div className="w-full max-w-6xl relative z-10 pt-28 pb-10 px-4 sm:px-6 my-auto max-h-[calc(100vh-2rem)] overflow-y-auto">
            <div className="rounded-2xl p-6 sm:p-8 backdrop-blur-md bg-blanco-puro/90 dark:bg-noche-selva/85 border border-carbon/10 dark:border-white/10 shadow-2xl">
              <div className="text-center mb-6">
                <h3 className="text-xs sm:text-sm font-semibold text-terracota tracking-[0.25em] uppercase">Un manto de vida protegido</h3>
                <h2 className={HOME_PANEL_TITLE_CLASS}>CONSERVACIÓN</h2>
                <p className="text-sm sm:text-base text-gris-piedra dark:text-beige-arena/90 max-w-3xl mx-auto leading-relaxed">
                  Promover la conservación de la Amazonía mediante iniciativas impulsadas por empresas y fundaciones, orientadas a proteger, mantener y gestionar responsablemente los ecosistemas, sus especies y recursos, asegurando su equilibrio y continuidad.
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-4 md:gap-6">
                <div className="bg-beige-arena/50 dark:bg-noche-selva/50 backdrop-blur-sm border border-carbon/10 dark:border-white/10 shadow-sm rounded-xl p-5 md:p-6 text-center">
                  <LeafIcon className="h-8 w-8 md:h-10 md:w-10 text-verde-brote mx-auto mb-2" />
                  <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold font-serif text-carbon dark:text-beige-arena">+8,500,000</h3>
                  <p className="font-semibold text-carbon dark:text-beige-arena mt-1 mb-1 text-sm sm:text-base">Hectáreas Protegidas</p>
                  <p className="text-xs sm:text-sm text-gris-piedra dark:text-beige-arena/80">Un área equivalente a Austria, resguardada para el futuro.</p>
                </div>
                <div className="bg-beige-arena/50 dark:bg-noche-selva/50 backdrop-blur-sm border border-carbon/10 dark:border-white/10 shadow-sm rounded-xl p-5 md:p-6 text-center">
                  <PawPrintIcon className="h-8 w-8 md:h-10 md:w-10 text-verde-brote mx-auto mb-2" />
                  <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold font-serif text-carbon dark:text-beige-arena">+1,200</h3>
                  <p className="font-semibold text-carbon dark:text-beige-arena mt-1 mb-1 text-sm sm:text-base">Especies Monitoreadas</p>
                  <p className="text-xs sm:text-sm text-gris-piedra dark:text-beige-arena/80">Incluyendo jaguares, delfines de río y águilas harpías.</p>
                </div>
                <div className="bg-beige-arena/50 dark:bg-noche-selva/50 backdrop-blur-sm border border-carbon/10 dark:border-white/10 shadow-sm rounded-xl p-5 md:p-6 text-center">
                  <FlaskConicalIcon className="h-8 w-8 md:h-10 md:w-10 text-verde-brote mx-auto mb-2" />
                  <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold font-serif text-carbon dark:text-beige-arena">+45</h3>
                  <p className="font-semibold text-carbon dark:text-beige-arena mt-1 mb-1 text-sm sm:text-base">Proyectos de Investigación</p>
                  <p className="text-xs sm:text-sm text-gris-piedra dark:text-beige-arena/80">Generando conocimiento crucial para la toma de decisiones.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* DESARROLLO COMUNITARIO */}
        <section className="snap-section w-full flex flex-col justify-center items-center relative overflow-hidden bg-noche-selva">
          <div className="absolute inset-0 z-0 overflow-hidden">
            <img src="/images/background/bg3.jpg" alt="Centinelas de la vida amazónica" className="w-full h-full object-cover filter blur-[6px] saturate-90 brightness-[0.75] scale-105" />
            <div className="absolute inset-0 bg-noche-selva/40"></div>
          </div>
          <div className="w-full max-w-6xl relative z-10 pt-28 pb-10 px-4 sm:px-6 my-auto max-h-[calc(100vh-2rem)] overflow-y-auto">
            <div className="rounded-2xl p-6 sm:p-8 backdrop-blur-md bg-blanco-puro/90 dark:bg-noche-selva/85 border border-carbon/10 dark:border-white/10 shadow-2xl">
              <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
                <div className="group relative rounded-xl overflow-hidden shadow-medium aspect-[4/3]">
                  <img src="/images/background/bg3.jpg" alt="Miembro de comunidad indígena" className="w-full h-full object-cover filter grayscale transition-all duration-500 ease-in-out group-hover:filter-none" />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-all duration-500 ease-in-out"></div>
                </div>
                <div className="text-center md:text-left">
                  <h3 className="text-xs sm:text-sm font-semibold text-terracota tracking-[0.25em] uppercase">Centinelas de la vida amazónica</h3>
                  <h2 className={HOME_PANEL_TITLE_CLASS}>DESARROLLO COMUNITARIO</h2>
                  <p className="text-sm sm:text-base text-gris-piedra dark:text-beige-arena/85 mb-5 leading-relaxed">
                    Fortalecer el desarrollo de los pueblos indígenas, promoviendo el ejercicio de sus derechos sobre sus territorios y recursos naturales, y favoreciendo condiciones de sostenibilidad que aseguren la continuidad de sus formas de vida, su organización y su identidad cultural.
                  </p>
                  <ul className="space-y-3 text-left">
                    <li className="flex items-start">
                      <LeafIcon className="h-5 w-5 text-verde-brote flex-shrink-0 mr-3 mt-0.5" />
                      <span className="text-xs sm:text-sm text-carbon/90 dark:text-beige-arena/90">Promovemos el <strong className="font-semibold text-carbon dark:text-white">ejercicio de derechos territoriales</strong> y la gestión autónoma de recursos naturales.</span>
                    </li>
                    <li className="flex items-start">
                      <LeafIcon className="h-5 w-5 text-verde-brote flex-shrink-0 mr-3 mt-0.5" />
                      <span className="text-xs sm:text-sm text-carbon/90 dark:text-beige-arena/90">Fortalecemos <strong className="font-semibold text-carbon dark:text-white">condiciones de sostenibilidad</strong> para asegurar la continuidad de sus formas de vida.</span>
                    </li>
                    <li className="flex items-start">
                      <LeafIcon className="h-5 w-5 text-verde-brote flex-shrink-0 mr-3 mt-0.5" />
                      <span className="text-xs sm:text-sm text-carbon/90 dark:text-beige-arena/90">Apoyamos la preservación de la <strong className="font-semibold text-carbon dark:text-white">identidad cultural</strong> y sistemas de organización propios.</span>
                    </li>
                  </ul>
                  <div className="mt-6">
                    <Link to="/datos">
                      <Button className="bg-terracota hover:shadow-azai-glow px-6 py-2.5 text-xs sm:text-sm font-semibold">Conoce nuestras acciones comunitarias</Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* DEMOCRATIZAR CONOCIMIENTO */}
        <section className="snap-section w-full flex flex-col justify-center items-center relative overflow-hidden bg-noche-selva">
          <div className="absolute inset-0 z-0 overflow-hidden">
            <img src="/images/background/bg11.jpg" alt="Datos para preservar" className="w-full h-full object-cover filter blur-[6px] saturate-90 brightness-[0.75] scale-105" />
            <div className="absolute inset-0 bg-noche-selva/40"></div>
          </div>
          <div className="w-full max-w-6xl relative z-10 pt-28 pb-10 px-4 sm:px-6 my-auto max-h-[calc(100vh-2rem)] overflow-y-auto">
            <div className="rounded-2xl p-6 sm:p-8 backdrop-blur-md bg-blanco-puro/90 dark:bg-noche-selva/85 border border-carbon/10 dark:border-white/10 shadow-2xl text-center">
              <div className="text-center mb-6">
                <h3 className="text-xs sm:text-sm font-semibold text-terracota tracking-[0.25em] uppercase">Datos para preservar, conocimiento para transformar</h3>
                <h2 className={HOME_PANEL_TITLE_CLASS}>DEMOCRATIZAR CONOCIMIENTO</h2>
                <p className="text-sm sm:text-base text-gris-piedra dark:text-beige-arena/90 max-w-3xl mx-auto leading-relaxed">
                  Facilitar el acceso a datos sobre iniciativas de sostenibilidad de empresas y fundaciones en la Amazonía boliviana, contribuyendo a la generación de conocimiento desde la investigación y la construcción de políticas públicas.
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-4 md:gap-6">
                <div className="bg-beige-arena/50 dark:bg-noche-selva/50 backdrop-blur-sm border border-carbon/10 dark:border-white/10 shadow-sm rounded-xl p-5 md:p-6 text-center">
                  <LeafIcon className="h-8 w-8 text-verde-brote mx-auto mb-2" />
                  <h3 className="text-lg sm:text-xl font-bold font-serif text-carbon dark:text-beige-arena">Datos Verificados</h3>
                  <p className="text-xs sm:text-sm text-gris-piedra dark:text-beige-arena/80 mt-2">Acceso a información estructurada y validada sobre iniciativas sostenibles en la región.</p>
                </div>
                <div className="bg-beige-arena/50 dark:bg-noche-selva/50 backdrop-blur-sm border border-carbon/10 dark:border-white/10 shadow-sm rounded-xl p-5 md:p-6 text-center">
                  <PawPrintIcon className="h-8 w-8 text-verde-brote mx-auto mb-2" />
                  <h3 className="text-lg sm:text-xl font-bold font-serif text-carbon dark:text-beige-arena">Investigación Colaborativa</h3>
                  <p className="text-xs sm:text-sm text-gris-piedra dark:text-beige-arena/80 mt-2">Generación de conocimiento desde la academia, empresas y comunidades en conjunto.</p>
                </div>
                <div className="bg-beige-arena/50 dark:bg-noche-selva/50 backdrop-blur-sm border border-carbon/10 dark:border-white/10 shadow-sm rounded-xl p-5 md:p-6 text-center">
                  <FlaskConicalIcon className="h-8 w-8 text-verde-brote mx-auto mb-2" />
                  <h3 className="text-lg sm:text-xl font-bold font-serif text-carbon dark:text-beige-arena">Políticas Públicas</h3>
                  <p className="text-xs sm:text-sm text-gris-piedra dark:text-beige-arena/80 mt-2">Aporte a la formulación de decisiones basadas en evidencia para el mediano y largo plazo.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Act V: Proyectos que Transforman */}
        <section className="snap-section w-full flex flex-col justify-center items-center relative overflow-hidden bg-noche-selva">
          <div className="absolute inset-0 z-0 overflow-hidden">
            <img src="/images/background/bg4.jpg?v=2" alt="Proyectos que transforman" className="w-full h-full object-cover filter blur-[6px] saturate-90 brightness-[0.75] scale-105"/>
            <div className="absolute inset-0 bg-noche-selva/40"></div>
          </div>
          <div className="w-full max-w-6xl text-center relative z-10 pt-28 pb-10 px-4 sm:px-6 my-auto max-h-[calc(100vh-2rem)] overflow-y-auto">
            <div className="bg-blanco-puro/90 dark:bg-noche-selva/85 backdrop-blur-md rounded-2xl shadow-2xl p-6 md:p-8 border border-carbon/10 dark:border-white/10">
              <div className="text-center mb-6">
                <h3 className="text-xs sm:text-sm font-semibold text-terracota tracking-[0.25em] uppercase">Iniciativas sostenibles en la Amazonía</h3>
                <h2 className={HOME_PANEL_TITLE_CLASS}>PROYECTOS QUE TRANSFORMAN</h2>
              </div>
              <div>
                {isLoading ? renderSkeletons() : projects && <ProjectList projects={projects.slice(0, 3)} />}
              </div>
              <div className="mt-8">
                <Link to="/georeferencia">
                  <Button className="px-8 py-3 text-base">Ver todos los proyectos</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Act VI: Únete a la Causa */}
        <section className="snap-section w-full flex flex-col justify-center items-center relative overflow-hidden bg-noche-selva">
          <div className="absolute inset-0 z-0 overflow-hidden">
            <img src="/images/background/bg5.jpg?v=2" alt="Únete a la causa" className="w-full h-full object-cover filter blur-[6px] saturate-90 brightness-[0.75] scale-105" />
            <div className="absolute inset-0 bg-noche-selva/40"></div>
          </div>
          <div className="w-full max-w-4xl text-center relative z-10 pt-28 pb-10 px-4 sm:px-6 my-auto">
            <div className="p-6 sm:p-10 rounded-2xl text-center shadow-2xl bg-blanco-puro/90 dark:bg-noche-selva/85 backdrop-blur-md border border-carbon/10 dark:border-white/10">
              <h2 className={`${HOME_PANEL_TITLE_CLASS} mb-3`}>ÚNETE A LA CAUSA</h2>
              <p className="mb-6 max-w-2xl mx-auto text-sm sm:text-base text-gris-piedra dark:text-beige-arena/80 leading-relaxed">
                Cada acción cuenta. Descubre cómo puedes contribuir a la preservación de la Amazonía.
              </p>
              <Link
                to="/registro"
                className="inline-block bg-terracota hover:shadow-azai-glow px-8 py-3.5 text-base rounded-lg font-semibold text-white uppercase tracking-wider transition-all duration-300 shadow-md"
              >
                Regístrate
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default HomePage;
