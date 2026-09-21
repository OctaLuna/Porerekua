import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';
import ProjectList from '../features/ProjectList/ProjectList';
import { useProyectos } from '../hooks/useProyectos';
import Skeleton from '../components/ui/Skeleton';
import Card from '../components/ui/Card';

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
  <section ref={heroRef} className="snap-section relative w-full flex flex-col items-center justify-center text-center text-white overflow-y-auto bg-noche-selva">
      <div
        className="absolute inset-0 w-full h-full z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/images/background/bg.png)' }}
        aria-hidden="true"
      ></div>
      <div className="absolute inset-0 z-10 bg-noche-selva/15" aria-hidden="true"></div>
          <div className="relative z-20 p-4 pt-32 max-h-[calc(100vh-4rem)] overflow-y-auto">
            <motion.h1
              className="text-4xl sm:text-5xl md:text-7xl font-extrabold font-serif text-beige-arena mb-4"
              style={{ textShadow: '0 2px 8px rgba(0,0,0,0.7)' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            >
              Porerekua
            </motion.h1>
            <motion.p 
              className="text-xl text-beige-arena max-w-3xl mx-auto mb-8"
              style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            >
              Ser solidario, compartir lo que se tiene
            </motion.p>
          </div>
          <motion.div
            className="absolute bottom-10 z-20"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1, ease: "easeOut" }}
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="cursor-pointer"
              onClick={() => {
                // Use heroRef to scroll to next section reliably
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
        <section className="snap-section w-full flex flex-col justify-center items-center text-center pt-32 pb-10 px-4 sm:px-6 lg:px-8 relative overflow-y-auto">
          <div className="absolute inset-0 z-0">
            <img src="/images/background/bg2.jpg" alt="Un manto de vida" className="w-full h-full object-cover filter brightness-90" />
            <div className="absolute inset-0 z-0 dark:bg-noche-selva/55 dark:backdrop-blur-md rounded-2xl dark:border dark:border-white/40 dark:border-beige-arena/10 dark:shadow-medium"></div>
          </div>
          <div className="w-full max-w-6xl relative z-10 max-h-[calc(100vh-10rem)] overflow-y-auto my-auto">
            <h3 className="text-base sm:text-xl font-semibold text-terracota tracking-wider uppercase">Un manto de vida protegido</h3>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold font-serif text-white mt-2 mb-3 sm:mb-4">CONSERVACIÓN</h2>
            <p className="text-base sm:text-lg text-beige-arena/90 max-w-3xl mx-auto mb-6 sm:mb-10">
              Promover la conservación de la Amazonía mediante iniciativas impulsadas por empresas y fundaciones, orientadas a proteger, mantener y gestionar responsablemente los ecosistemas, sus especies y recursos, asegurando su equilibrio y continuidad.
            </p>
            <div className="grid md:grid-cols-3 gap-4 md:gap-8">
              <div className="bg-blanco-puro/95 dark:bg-noche-selva/60 backdrop-blur-md border border-carbon/10 dark:border-white/10 shadow-medium rounded-lg p-5 md:p-8 text-center">
                <LeafIcon className="h-8 w-8 md:h-10 md:w-10 text-verde-brote mx-auto mb-3" />
                <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif text-carbon dark:text-beige-arena">+8,500,000</h3>
                <p className="font-semibold text-carbon dark:text-beige-arena mt-2 mb-1">Hectáreas Protegidas</p>
                <p className="text-sm text-gris-piedra dark:text-beige-arena/80">Un área equivalente a Austria, resguardada para el futuro.</p>
              </div>
              <div className="bg-blanco-puro/95 dark:bg-noche-selva/60 backdrop-blur-md border border-carbon/10 dark:border-white/10 shadow-medium rounded-lg p-5 md:p-8 text-center">
                <PawPrintIcon className="h-8 w-8 md:h-10 md:w-10 text-verde-brote mx-auto mb-3" />
                <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif text-carbon dark:text-beige-arena">+1,200</h3>
                <p className="font-semibold text-carbon dark:text-beige-arena mt-2 mb-1">Especies Monitoreadas</p>
                <p className="text-sm text-gris-piedra dark:text-beige-arena/80">Incluyendo jaguares, delfines de río y águilas harpías.</p>
              </div>
              <div className="bg-blanco-puro/95 dark:bg-noche-selva/60 backdrop-blur-md border border-carbon/10 dark:border-white/10 shadow-medium rounded-lg p-5 md:p-8 text-center">
                <FlaskConicalIcon className="h-8 w-8 md:h-10 md:w-10 text-verde-brote mx-auto mb-3" />
                <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif text-carbon dark:text-beige-arena">+45</h3>
                <p className="font-semibold text-carbon dark:text-beige-arena mt-2 mb-1">Proyectos de Investigación</p>
                <p className="text-sm text-gris-piedra dark:text-beige-arena/80">Generando conocimiento crucial para la toma de decisiones.</p>
              </div>
            </div>
          </div>
        </section>

        {/* DESARROLLO COMUNITARIO */}
        <section className="snap-section w-full flex flex-col justify-center items-center pt-32 pb-10 px-4 sm:px-6 lg:px-8 relative overflow-y-auto">
          <div className="absolute inset-0 z-0">
            <img src="/images/background/bg3.jpg" alt="Centinelas de la vida amazónica" className="w-full h-full object-cover filter brightness-90" />
            <div className="absolute inset-0 z-0 dark:bg-noche-selva/55 dark:backdrop-blur-md rounded-2xl dark:border dark:border-white/40 dark:border-beige-arena/10 dark:shadow-medium"></div>
          </div>
          <div className="w-full max-w-6xl relative z-10 max-h-[calc(100vh-10rem)] overflow-y-auto my-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="group relative rounded-lg overflow-hidden shadow-medium aspect-[4/3]">
                <img src="/images/background/bg3.jpg" alt="Miembro de comunidad indígena" className="w-full h-full object-cover filter grayscale transition-all duration-500 ease-in-out group-hover:filter-none" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-all duration-500 ease-in-out"></div>
              </div>
              <div className="text-center md:text-left">
                <h3 className="text-xl font-semibold text-terracota tracking-wider uppercase">Centinelas de la vida amazónica</h3>
                <h2 className="text-3xl md:text-5xl font-bold font-serif text-white mt-2 mb-6">DESARROLLO COMUNITARIO</h2>
                <p className="text-beige-arena/80 mb-6">
                  Fortalecer el desarrollo de los pueblos indígenas, promoviendo el ejercicio de sus derechos sobre sus territorios y recursos naturales, y favoreciendo condiciones de sostenibilidad que aseguren la continuidad de sus formas de vida, su organización y su identidad cultural.
                </p>
                <ul className="space-y-3 text-left">
                  <li className="flex items-start">
                    <LeafIcon className="h-5 w-5 text-verde-brote flex-shrink-0 mr-3 mt-1" />
                    <span className="text-beige-arena/90">Promovemos el <strong className="font-semibold text-white">ejercicio de derechos territoriales</strong> y la gestión autónoma de recursos naturales.</span>
                  </li>
                  <li className="flex items-start">
                    <LeafIcon className="h-5 w-5 text-verde-brote flex-shrink-0 mr-3 mt-1" />
                    <span className="text-beige-arena/90">Fortalecemos <strong className="font-semibold text-white">condiciones de sostenibilidad</strong> para asegurar la continuidad de sus formas de vida.</span>
                  </li>
                  <li className="flex items-start">
                    <LeafIcon className="h-5 w-5 text-verde-brote flex-shrink-0 mr-3 mt-1" />
                    <span className="text-beige-arena/90">Apoyamos la preservación de la <strong className="font-semibold text-white">identidad cultural</strong> y sistemas de organización propios.</span>
                  </li>
                </ul>
                <div className="mt-8">
                  <Link to="/datos">
                    <Button className="bg-terracota hover:shadow-azai-glow px-8 py-3">Conoce nuestras acciones comunitarias</Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* DEMOCRATIZAR CONOCIMIENTO */}
        <section className="snap-section w-full flex flex-col justify-center items-center pt-32 pb-10 px-4 sm:px-6 lg:px-8 relative overflow-y-auto">
          <div className="absolute inset-0 z-0">
            <img src="/images/background/bg11.jpg" alt="Datos para preservar" className="w-full h-full object-cover filter brightness-90" />
            <div className="absolute inset-0 bg-noche-selva/45"></div>
          </div>
          <div className="w-full max-w-6xl relative z-10 text-center max-h-[calc(100vh-10rem)] overflow-y-auto my-auto">
            <h3 className="text-base sm:text-xl font-semibold text-terracota tracking-wider uppercase">Datos para preservar, conocimiento para transformar</h3>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold font-serif text-white mt-2 mb-3 sm:mb-4">DEMOCRATIZAR CONOCIMIENTO</h2>
            <p className="text-base sm:text-lg text-beige-arena/90 max-w-3xl mx-auto mb-6 sm:mb-10">
              Facilitar el acceso a datos sobre iniciativas de sostenibilidad de empresas y fundaciones en la Amazonía boliviana, contribuyendo a la generación de conocimiento desde la investigación y la construcción de políticas públicas.
            </p>
            <div className="grid md:grid-cols-3 gap-4 md:gap-8">
              <div className="bg-blanco-puro/95 dark:bg-noche-selva/60 backdrop-blur-md border border-carbon/10 dark:border-white/10 shadow-medium rounded-lg p-5 md:p-8 text-center">
                <LeafIcon className="h-8 w-8 md:h-10 md:w-10 text-verde-brote mx-auto mb-3" />
                <h3 className="text-xl md:text-2xl font-bold font-serif text-carbon dark:text-beige-arena">Datos Verificados</h3>
                <p className="text-sm text-gris-piedra dark:text-beige-arena/80 mt-2">Acceso a información estructurada y validada sobre iniciativas sostenibles en la región.</p>
              </div>
              <div className="bg-blanco-puro/95 dark:bg-noche-selva/60 backdrop-blur-md border border-carbon/10 dark:border-white/10 shadow-medium rounded-lg p-5 md:p-8 text-center">
                <PawPrintIcon className="h-8 w-8 md:h-10 md:w-10 text-verde-brote mx-auto mb-3" />
                <h3 className="text-xl md:text-2xl font-bold font-serif text-carbon dark:text-beige-arena">Investigación Colaborativa</h3>
                <p className="text-sm text-gris-piedra dark:text-beige-arena/80 mt-2">Generación de conocimiento desde la academia, empresas y comunidades en conjunto.</p>
              </div>
              <div className="bg-blanco-puro/95 dark:bg-noche-selva/60 backdrop-blur-md border border-carbon/10 dark:border-white/10 shadow-medium rounded-lg p-5 md:p-8 text-center">
                <FlaskConicalIcon className="h-8 w-8 md:h-10 md:w-10 text-verde-brote mx-auto mb-3" />
                <h3 className="text-xl md:text-2xl font-bold font-serif text-carbon dark:text-beige-arena">Políticas Públicas</h3>
                <p className="text-sm text-gris-piedra dark:text-beige-arena/80 mt-2">Aporte a la formulación de decisiones basadas en evidencia para el mediano y largo plazo.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Act V: Proyectos que Transforman */}
        <section
          className="snap-section w-full flex flex-col justify-center items-center pt-32 pb-10 px-4 sm:px-6 lg:px-8 overflow-y-auto"
        >
          <div className="absolute inset-0 z-0">
            <img src="/images/background/bg4.jpg?v=2" alt="Proyectos que transforman" className="w-full h-full object-cover"/>
            <div className="absolute inset-0 bg-noche-selva/50"></div>
          </div>
          <div className="w-full max-w-6xl text-center relative z-10 max-h-[calc(100vh-10rem)] overflow-y-auto my-auto">
            <div className="bg-blanco-puro/85 dark:bg-noche-selva/60 backdrop-blur-md rounded-xl shadow-medium p-4 md:p-6 border border-carbon/10 dark:border-white/10">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-serif mb-5 md:mb-8 text-carbon dark:text-beige-arena">
                Proyectos que Transforman
              </h2>
              <div>
                {isLoading ? renderSkeletons() : projects && <ProjectList projects={projects.slice(0, 3)} />}
              </div>
              <div className="mt-8">
                <Link to="/georeferencia">
                  <Button className="px-8 py-4 text-lg">Ver todos los proyectos</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Act VI: Únete a la Causa */}
        <section
          className="snap-section w-full flex flex-col justify-center items-center pt-32 pb-10 px-4 sm:px-6 lg:px-8 overflow-y-auto"
        >
          <div className="absolute inset-0 z-0">
            <img src="/images/background/bg5.jpg?v=2" alt="Únete a la causa" className="w-full h-full object-cover" />
            <div className="absolute inset-0 z-0 dark:bg-noche-selva/55 dark:backdrop-blur-md rounded-2xl dark:border dark:border-white/40 dark:border-beige-arena/10 dark:shadow-medium"></div>
          </div>
          <div className="p-6 sm:p-8 md:p-12 rounded-lg text-center shadow-medium w-full max-w-4xl relative z-10 bg-blanco-puro/85 dark:bg-noche-selva/60 backdrop-blur-md border border-carbon/10 dark:border-white/10 max-h-[calc(100vh-10rem)] overflow-y-auto my-auto">
            <h2 className="text-3xl font-bold mb-4 text-carbon dark:text-beige-arena">Únete a la Causa</h2>
            <p className="mb-8 max-w-2xl mx-auto text-gris-piedra dark:text-beige-arena/80">
              Cada acción cuenta. Descubre cómo puedes contribuir a la preservación de la Amazonía.
            </p>
            <Link
              to="/registro"
              className="inline-block bg-terracota hover:shadow-azai-glow px-8 py-4 text-lg rounded-md font-medium transition-all duration-300"
            >
              Registrate
            </Link>
          </div>
        </section>
      </div>
    </>
  );
};

export default HomePage;