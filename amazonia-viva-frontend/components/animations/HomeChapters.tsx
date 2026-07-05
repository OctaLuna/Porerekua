import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { gsap, ScrollTrigger, SplitText, useGSAP } from './gsap-setup';
import { useProyectos } from '../../hooks/useProyectos';
import { useDashboardPublicoResumen } from '../../hooks/useDashboard';
import ProjectList from '../../features/ProjectList/ProjectList';
import Skeleton from '../ui/Skeleton';
import Card from '../ui/Card';

/* ------------------------------------------------------------------ */
/* Iconos                                                             */
/* ------------------------------------------------------------------ */
const LeafIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
  </svg>
);
const PawPrintIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="11" cy="4" r="2" /><circle cx="18" cy="8" r="2" /><circle cx="20" cy="16" r="2" />
    <path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z" />
  </svg>
);
const FlaskConicalIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M10 2v7.31" /><path d="M14 9.31V2" /><path d="M8.5 12.31 4 22h16l-4.5-9.69" /><path d="M10 16h4" />
  </svg>
);

/* ------------------------------------------------------------------ */
/* Cromo (chip, número + línea de progreso, CTA pill, hint)           */
/* ------------------------------------------------------------------ */
const CTA_PILL =
  'inline-flex w-fit items-center gap-2 rounded-full bg-terracota px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:shadow-azai-glow';

const CHIP =
  'chapter-anim inline-flex w-fit items-center gap-2 rounded-full bg-amarillo-sol px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-noche-selva';

const OVERLAY =
  'linear-gradient(100deg, rgba(49,47,42,0.88) 0%, rgba(49,47,42,0.6) 42%, rgba(49,47,42,0.28) 100%)';

interface ChapterProps {
  index: number;
  total: number;
  chip?: string;
  title: string;
  bg: string;
  cta?: string;
  ctaHref?: string;
  showScrollHint?: boolean;
  pinned: boolean;
  children?: React.ReactNode;
}

const Chapter: React.FC<ChapterProps> = ({
  index, total, chip, title, bg, cta, ctaHref, showScrollHint, pinned, children,
}) => (
  <div
    data-chapter={index}
    className={
      pinned
        ? 'chapter-slide absolute inset-0 h-full w-full'
        : 'chapter-slide relative min-h-screen w-full'
    }
  >
    <img className="chapter-bg absolute inset-0 h-full w-full object-cover will-change-transform" src={bg} alt="" aria-hidden="true" />
    <div className="absolute inset-0" style={{ background: OVERLAY }} />

    <div className="relative z-10 mx-auto flex h-full min-h-screen w-full max-w-7xl flex-col justify-center px-6 py-24 text-beige-arena md:px-12">
      {/* Cromo Floema: etiqueta de marca + número + línea de progreso a todo el ancho */}
      <div className="chapter-anim mb-8">
        <div className="mb-2 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.3em] text-beige-arena/60">
          <span>Porerekua · Amazonía</span>
          <span className="tabular-nums text-beige-arena/80">
            {String(index + 1).padStart(2, '0')}
            <span className="text-beige-arena/40"> / {String(total).padStart(2, '0')}</span>
          </span>
        </div>
        <div className="relative h-px w-full bg-white/20">
          <span className="absolute inset-y-0 left-0 bg-terracota" style={{ width: `${((index + 1) / total) * 100}%` }} />
        </div>
      </div>

      {chip && <span className={CHIP}>{chip}</span>}

      <h2
        className="chapter-title chapter-anim mt-4 max-w-4xl font-serif text-4xl font-bold leading-[1.05] text-white sm:text-5xl md:text-6xl"
        style={{ textShadow: '0 2px 18px rgba(0,0,0,0.55)' }}
      >
        {title}
      </h2>

      {children && <div className="chapter-anim mt-8 w-full">{children}</div>}

      {cta && ctaHref && (
        <div className="chapter-anim mt-8">
          <Link to={ctaHref} className={CTA_PILL}>{cta} →</Link>
        </div>
      )}
    </div>

    {showScrollHint && (
      <div className="pointer-events-none absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-center text-[11px] uppercase tracking-[0.3em] text-beige-arena/70">
        Explora
        <span className="mt-1 block animate-bounce">↓</span>
      </div>
    )}
  </div>
);

/* Tarjeta "glass" para métricas / features sobre imagen */
const GlassCard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="rounded-2xl border border-white/15 bg-white/10 p-5 text-beige-arena backdrop-blur-md md:p-6">
    {children}
  </div>
);

/* ------------------------------------------------------------------ */
/* Secuencia pineada                                                  */
/* ------------------------------------------------------------------ */
const TOTAL = 5;

const HomeChapters: React.FC = () => {
  const container = useRef<HTMLElement>(null);
  const { data: statsPublicas } = useDashboardPublicoResumen();
  const { data: projectsPage, isLoading } = useProyectos({ limit: 3 });
  const projects = projectsPage?.data;

  const [pinned] = useState(() => {
    if (typeof window === 'undefined') return true;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return window.innerWidth > 768 && !reduced;
  });

  useGSAP(
    () => {
      const slides = gsap.utils.toArray<HTMLElement>('.chapter-slide');
      if (!slides.length) return;

      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (!pinned) {
        // Fallback móvil / reduced-motion: reveal simple por sección.
        slides.forEach((slide) => {
          gsap.from(slide.querySelectorAll('.chapter-anim'), {
            y: 40, autoAlpha: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out',
            scrollTrigger: { trigger: slide, start: 'top 75%' },
          });
        });
        return;
      }

      // Revelado del título por líneas con máscara (estilo Floema): cada línea
      // sube desde detrás de un contenedor con overflow oculto.
      const titleSplits: (SplitText | null)[] = slides.map((slide) => {
        const el = slide.querySelector<HTMLElement>('.chapter-title');
        if (!el || reduced) return null;
        const split = new SplitText(el, { type: 'lines', linesClass: 'st-line' });
        split.lines.forEach((line) => {
          const wrap = document.createElement('span');
          wrap.style.display = 'block';
          wrap.style.overflow = 'hidden';
          line.parentNode?.insertBefore(wrap, line);
          wrap.appendChild(line);
          (line as HTMLElement).style.display = 'block';
        });
        return split;
      });

      gsap.set(slides, { autoAlpha: 0, yPercent: 6 });
      gsap.set(slides[0], { autoAlpha: 1, yPercent: 0 });

      // Capítulo 0: revelar al cargar (no está atado al scrub).
      const firstLines = titleSplits[0]?.lines;
      if (firstLines) gsap.from(firstLines, { yPercent: 115, duration: 0.9, stagger: 0.12, ease: 'power3.out', delay: 0.25 });
      gsap.from(slides[0].querySelectorAll('.chapter-anim:not(.chapter-title)'), {
        y: 30, autoAlpha: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out', delay: 0.35,
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container.current,
          pin: true,
          scrub: 1,
          start: 'top top',
          end: `+=${slides.length * 100}%`,
          anticipatePin: 1,
        },
      });

      slides.forEach((slide, i) => {
        if (i === 0) return;
        const prev = slides[i - 1];
        const label = `c${i}`;

        tl.to(prev, { autoAlpha: 0, yPercent: -6, duration: 0.4, ease: 'power2.in' }, label);
        tl.fromTo(slide, { autoAlpha: 0, yPercent: 6 }, { autoAlpha: 1, yPercent: 0, duration: 0.5, ease: 'power2.out' }, `${label}+=0.15`);

        const bg = slide.querySelector('.chapter-bg');
        if (bg) tl.fromTo(bg, { scale: 1.14, yPercent: -8 }, { scale: 1, yPercent: 0, duration: 0.85, ease: 'none' }, label);

        // Título: líneas con máscara suben.
        const lines = titleSplits[i]?.lines;
        if (lines) tl.from(lines, { yPercent: 115, duration: 0.6, stagger: 0.1, ease: 'power3.out' }, `${label}+=0.3`);

        // Resto del contenido (chip, párrafo, tarjetas, CTA) con stagger.
        const anims = slide.querySelectorAll('.chapter-anim:not(.chapter-title)');
        tl.from(anims, { y: 34, autoAlpha: 0, stagger: 0.09, duration: 0.45, ease: 'power3.out' }, `${label}+=0.34`);
      });

      return () => { titleSplits.forEach((s) => s?.revert()); };
    },
    { scope: container, dependencies: [pinned] },
  );

  // Re-medir cuando lleguen datos asíncronos.
  useEffect(() => {
    ScrollTrigger.refresh();
  }, [statsPublicas, projects]);

  return (
    <section
      ref={container}
      className={`home-chapters relative w-full overflow-hidden bg-noche-selva ${pinned ? 'h-screen' : ''}`}
      aria-label="Ejes de Porerekua"
    >
      {/* 01 · Conservación */}
      <Chapter index={0} total={TOTAL} pinned={pinned} bg="/images/background/bg2.jpg" chip="Un manto de vida protegido" title="CONSERVACIÓN" showScrollHint>
        <p className="max-w-2xl text-base leading-relaxed text-beige-arena/90 md:text-lg">
          Promover la conservación de la Amazonía mediante iniciativas impulsadas por empresas y fundaciones, orientadas a proteger, mantener y gestionar responsablemente los ecosistemas, sus especies y recursos, asegurando su equilibrio y continuidad.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-3 md:gap-6" data-testid="stats-publicas">
          <GlassCard>
            <LeafIcon className="mb-3 h-8 w-8 text-verde-brote" />
            <p className="font-serif text-3xl font-bold text-white md:text-4xl" data-testid="stat-proyectos-activos">
              {statsPublicas ? statsPublicas.proyectos_activos : '…'}
            </p>
            <p className="mt-1 font-semibold text-beige-arena">Proyectos Activos</p>
            <p className="mt-1 text-sm text-beige-arena/70">Iniciativas en curso protegiendo la Amazonía boliviana.</p>
          </GlassCard>
          <GlassCard>
            <PawPrintIcon className="mb-3 h-8 w-8 text-verde-brote" />
            <p className="font-serif text-3xl font-bold text-white md:text-4xl" data-testid="stat-empresas">
              {statsPublicas ? statsPublicas.total_empresas : '…'}
            </p>
            <p className="mt-1 font-semibold text-beige-arena">Empresas Participantes</p>
            <p className="mt-1 text-sm text-beige-arena/70">Compañías comprometidas con la sostenibilidad amazónica.</p>
          </GlassCard>
          <GlassCard>
            <FlaskConicalIcon className="mb-3 h-8 w-8 text-verde-brote" />
            <p className="font-serif text-3xl font-bold text-white md:text-4xl" data-testid="stat-organizaciones">
              {statsPublicas ? statsPublicas.total_organizaciones : '…'}
            </p>
            <p className="mt-1 font-semibold text-beige-arena">Organizaciones</p>
            <p className="mt-1 text-sm text-beige-arena/70">Fundaciones y organizaciones aliadas en toda la región.</p>
          </GlassCard>
        </div>
      </Chapter>

      {/* 02 · Desarrollo Comunitario */}
      <Chapter index={1} total={TOTAL} pinned={pinned} bg="/images/background/bg3.jpg" chip="Centinelas de la vida amazónica" title="DESARROLLO COMUNITARIO" cta="Conoce nuestras acciones comunitarias" ctaHref="/datos" showScrollHint>
        <div className="grid items-start gap-8 md:grid-cols-2 md:gap-12">
          <div className="group relative aspect-[4/3] overflow-hidden rounded-2xl shadow-medium">
            <img src="/images/background/bg3.jpg" alt="Miembro de comunidad indígena" className="h-full w-full object-cover grayscale transition-all duration-500 ease-in-out group-hover:grayscale-0" />
          </div>
          <div>
            <p className="mb-5 text-base leading-relaxed text-beige-arena/90 md:text-lg">
              Fortalecer el desarrollo de los pueblos indígenas, promoviendo el ejercicio de sus derechos sobre sus territorios y recursos naturales, y favoreciendo condiciones de sostenibilidad que aseguren la continuidad de sus formas de vida, su organización y su identidad cultural.
            </p>
            <ul className="space-y-3">
              <li className="flex items-start">
                <LeafIcon className="mr-3 mt-1 h-5 w-5 flex-shrink-0 text-verde-brote" />
                <span className="text-beige-arena/90">Promovemos el <strong className="font-semibold text-white">ejercicio de derechos territoriales</strong> y la gestión autónoma de recursos naturales.</span>
              </li>
              <li className="flex items-start">
                <LeafIcon className="mr-3 mt-1 h-5 w-5 flex-shrink-0 text-verde-brote" />
                <span className="text-beige-arena/90">Fortalecemos <strong className="font-semibold text-white">condiciones de sostenibilidad</strong> para asegurar la continuidad de sus formas de vida.</span>
              </li>
              <li className="flex items-start">
                <LeafIcon className="mr-3 mt-1 h-5 w-5 flex-shrink-0 text-verde-brote" />
                <span className="text-beige-arena/90">Apoyamos la preservación de la <strong className="font-semibold text-white">identidad cultural</strong> y sistemas de organización propios.</span>
              </li>
            </ul>
          </div>
        </div>
      </Chapter>

      {/* 03 · Democratizar Conocimiento */}
      <Chapter index={2} total={TOTAL} pinned={pinned} bg="/images/background/bg11.jpg" chip="Datos para preservar, conocimiento para transformar" title="DEMOCRATIZAR CONOCIMIENTO" showScrollHint>
        <p className="max-w-2xl text-base leading-relaxed text-beige-arena/90 md:text-lg">
          Facilitar el acceso a datos sobre iniciativas de sostenibilidad de empresas y fundaciones en la Amazonía boliviana, contribuyendo a la generación de conocimiento desde la investigación y la construcción de políticas públicas.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-3 md:gap-6">
          <GlassCard>
            <LeafIcon className="mb-3 h-8 w-8 text-verde-brote" />
            <h3 className="font-serif text-xl font-bold text-white">Datos Verificados</h3>
            <p className="mt-2 text-sm text-beige-arena/70">Acceso a información estructurada y validada sobre iniciativas sostenibles en la región.</p>
          </GlassCard>
          <GlassCard>
            <PawPrintIcon className="mb-3 h-8 w-8 text-verde-brote" />
            <h3 className="font-serif text-xl font-bold text-white">Investigación Colaborativa</h3>
            <p className="mt-2 text-sm text-beige-arena/70">Generación de conocimiento desde la academia, empresas y comunidades en conjunto.</p>
          </GlassCard>
          <GlassCard>
            <FlaskConicalIcon className="mb-3 h-8 w-8 text-verde-brote" />
            <h3 className="font-serif text-xl font-bold text-white">Políticas Públicas</h3>
            <p className="mt-2 text-sm text-beige-arena/70">Aporte a la formulación de decisiones basadas en evidencia para el mediano y largo plazo.</p>
          </GlassCard>
        </div>
      </Chapter>

      {/* 04 · Proyectos que Transforman */}
      <Chapter index={3} total={TOTAL} pinned={pinned} bg="/images/background/bg4.jpg" title="Proyectos que Transforman" cta="Ver todos los proyectos" ctaHref="/georeferencia" showScrollHint>
        <div className="w-full">
          {isLoading || !projects ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <Skeleton className="h-40 w-full" />
                  <div className="p-4"><Skeleton className="mb-2 h-5 w-3/4" /><Skeleton className="h-4 w-full" /></div>
                </Card>
              ))}
            </div>
          ) : (
            <ProjectList projects={projects.slice(0, 3)} />
          )}
        </div>
      </Chapter>

      {/* 05 · Únete a la Causa */}
      <Chapter index={4} total={TOTAL} pinned={pinned} bg="/images/background/bg5.jpg" title="Únete a la Causa" cta="Registrate" ctaHref="/registro">
        <p className="max-w-2xl text-base leading-relaxed text-beige-arena/90 md:text-lg">
          Cada acción cuenta. Descubre cómo puedes contribuir a la preservación de la Amazonía.
        </p>
      </Chapter>
    </section>
  );
};

export default HomeChapters;
