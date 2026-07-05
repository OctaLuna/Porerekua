import React, { useState, useMemo, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Navigation, Keyboard, A11y } from 'swiper/modules';
import type { Swiper as SwiperClass } from 'swiper/types';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/navigation';

import { useProyectos } from '../hooks/useProyectos';
import { useOrganizaciones } from '../hooks/useOrganizaciones';
import { useEmpresas } from '../hooks/useEmpresas';
import Skeleton from '../components/ui/Skeleton';
import Button from '../components/ui/Button';
import Reveal from '../components/animations/Reveal';
import { gsap } from '../components/animations/gsap-setup';
import { prefersReducedMotion } from '../components/animations/motion';
import DataCard, { type DataCardItem } from '../components/data/DataCard';
import type { EmpresaCard, OrganizacionCard, ProyectoCard } from '../types/api';
import { useUI } from '../hooks/useUI';

// ── Helpers ─────────────────────────────────────────────────────────────────
const joinDetalle = (...parts: Array<string | null | undefined>): string =>
  parts.filter((t): t is string => Boolean(t)).join(' · ');

const tagsOf = (p: ProyectoCard): string[] =>
  [p.tipo?.nombre, p.area?.nombre].filter((t): t is string => Boolean(t));

// ── Icons ───────────────────────────────────────────────────────────────────
const SearchIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const ChevronLeftIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="15 18 9 12 15 6" />
  </svg>
);
const ChevronRightIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

// ── Config de categorías ──────────────────────────────────────────────────────
type CategoriaKey = 'organizaciones' | 'empresas' | 'proyectos';
const CATEGORIAS: { key: CategoriaKey; label: string }[] = [
  { key: 'organizaciones', label: 'Organizaciones' },
  { key: 'empresas', label: 'Empresas' },
  { key: 'proyectos', label: 'Proyectos' },
];

const NavButton: React.FC<{
  refEl: React.RefObject<HTMLButtonElement>;
  side: 'left' | 'right';
  children: React.ReactNode;
}> = ({ refEl, side, children }) => (
  <button
    ref={refEl}
    aria-label={side === 'left' ? 'Anterior' : 'Siguiente'}
    className="z-20 flex h-12 w-12 items-center justify-center rounded-full border border-carbon/10 dark:border-white/10 bg-blanco-puro/95 dark:bg-noche-selva/70 backdrop-blur-md shadow-medium transition-all duration-300 hover:-translate-y-0.5 hover:bg-blanco-puro hover:shadow-verde-glow active:scale-95 disabled:opacity-40 motion-reduce:transform-none"
  >
    {children}
  </button>
);

const CardSkeleton: React.FC = () => (
  <div className="flex h-[380px] w-[300px] flex-col overflow-hidden rounded-2xl bg-blanco-puro/95 dark:bg-noche-selva/60 border border-carbon/10 dark:border-white/10">
    <Skeleton className="h-40 w-full" />
    <div className="flex flex-col gap-3 p-5">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-16 w-full" />
    </div>
  </div>
);

const DataPage: React.FC = () => {
  const { data: organizacionesPage, isLoading: organizacionesLoading } = useOrganizaciones({ limit: 100 });
  const { data: empresasPage, isLoading: empresasLoading } = useEmpresas({ limit: 100 });
  const { data: projectsPage, isLoading: projectsLoading } = useProyectos({ limit: 100 });

  const [searchTerm, setSearchTerm] = useState('');
  const [categoria, setCategoria] = useState<CategoriaKey>('organizaciones');
  const { openDetailPanel } = useUI();

  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const reduce = prefersReducedMotion();

  const matchesSearch = (nombre: string) => nombre.toLowerCase().includes(searchTerm.toLowerCase());

  // Items normalizados de la categoría activa → DataCardItem.
  const { items, isLoading } = useMemo(() => {
    if (categoria === 'organizaciones') {
      const list = (organizacionesPage?.data ?? []).filter((o) => matchesSearch(o.nombre));
      return {
        isLoading: organizacionesLoading,
        items: list.map((o: OrganizacionCard): DataCardItem => ({
          id: o.id,
          kind: 'organizacion',
          nombre: o.nombre,
          subtitulo: joinDetalle(o.tipo?.nombre, o.departamento, o.esNacional ? 'Nacional' : 'Internacional'),
          logoUrl: o.logoUrl,
          chips: [o.tipo?.nombre, o.esNacional ? 'Nacional' : 'Internacional'].filter((t): t is string => Boolean(t)),
        })),
      };
    }
    if (categoria === 'empresas') {
      const list = (empresasPage?.data ?? []).filter((e) => matchesSearch(e.nombre));
      return {
        isLoading: empresasLoading,
        items: list.map((e: EmpresaCard): DataCardItem => ({
          id: e.id,
          kind: 'empresa',
          nombre: e.nombre,
          subtitulo: joinDetalle(e.formaJuridica?.nombre, e.departamento),
          logoUrl: e.logoUrl,
          chips: [e.formaJuridica?.nombre, e.departamento].filter((t): t is string => Boolean(t)),
        })),
      };
    }
    const list = (projectsPage?.data ?? []).filter((p) => matchesSearch(p.nombre));
    return {
      isLoading: projectsLoading,
      items: list.map((p: ProyectoCard): DataCardItem => ({
        id: p.id,
        kind: 'proyecto',
        nombre: p.nombre,
        subtitulo: joinDetalle(p.area?.nombre, p.departamento),
        descripcion: p.descripcionCorta,
        imagenUrl: p.imagenPrincipalUrl,
        chips: tagsOf(p),
      })),
    };
  }, [categoria, searchTerm, organizacionesPage, empresasPage, projectsPage, organizacionesLoading, empresasLoading, projectsLoading]);

  // Micro-animación GSAP: pop del contenido de la slide activa al cambiar.
  const popActiveSlide = (swiper: SwiperClass) => {
    if (reduce) return;
    const body = swiper.slides[swiper.activeIndex]?.querySelector('[data-dc="body"]');
    if (body) gsap.fromTo(body, { y: 10, opacity: 0.5 }, { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out' });
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/images/background/bgDat.jpg)' }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-noche-selva/35" aria-hidden="true" />

      <div className="relative z-10 container mx-auto mt-40 mb-12 px-4 sm:px-6 lg:px-8 pt-12 pb-12 space-y-8 rounded-2xl border border-white/40 dark:border-beige-arena/10 bg-beige-arena/80 dark:bg-noche-selva/55 backdrop-blur-md shadow-medium">
        <Reveal className="text-center" y={20}>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-terracota">Red Kaa Iya</p>
          <h1 className="mt-1 font-serif text-4xl md:text-5xl font-extrabold text-carbon dark:text-beige-arena">
            Datos de la Red
          </h1>

          {/* Buscador */}
          <div className="relative mx-auto mt-6 max-w-xl">
            <SearchIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar organizaciones, empresas o proyectos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-carbon/10 dark:border-white/10 bg-blanco-puro/95 dark:bg-noche-selva/60 py-2.5 pl-10 pr-4 shadow-subtle backdrop-blur-md transition-all duration-300 focus:border-transparent focus:ring-2 focus:ring-verde-brote"
            />
          </div>

          {/* Píldoras de categoría */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {CATEGORIAS.map((c) => (
              <Button
                key={c.key}
                size="sm"
                variant={categoria === c.key ? 'primary' : 'outline'}
                onClick={() => setCategoria(c.key)}
              >
                {c.label}
              </Button>
            ))}
          </div>
        </Reveal>

        {/* Carrusel coverflow */}
        <div className="relative">
          {isLoading ? (
            <div className="flex justify-center gap-6 py-6">
              {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
            </div>
          ) : items.length === 0 ? (
            <p className="py-16 text-center text-gris-piedra dark:text-beige-arena/80">
              No se encontraron resultados.
            </p>
          ) : (
            <Swiper
              key={categoria}
              modules={[EffectCoverflow, Navigation, Keyboard, A11y]}
              effect={reduce ? 'slide' : 'coverflow'}
              grabCursor
              centeredSlides
              slidesPerView="auto"
              spaceBetween={reduce ? 24 : 0}
              loop={items.length > 3}
              keyboard={{ enabled: true }}
              a11y={{ prevSlideMessage: 'Anterior', nextSlideMessage: 'Siguiente', containerMessage: 'Carrusel de la red Kaa Iya' }}
              slideToClickedSlide
              coverflowEffect={{ rotate: 35, depth: 120, stretch: 0, modifier: 1, slideShadows: false }}
              navigation={{ prevEl: prevRef.current, nextEl: nextRef.current }}
              onBeforeInit={(swiper) => {
                // Conectar flechas personalizadas antes de inicializar Swiper.
                const nav = swiper.params.navigation;
                if (nav && typeof nav !== 'boolean') {
                  nav.prevEl = prevRef.current;
                  nav.nextEl = nextRef.current;
                }
              }}
              onInit={popActiveSlide}
              onSlideChangeTransitionEnd={popActiveSlide}
              className="!py-8"
            >
              {items.map((item) => (
                <SwiperSlide key={`${item.kind}-${item.id}`} className="!h-[380px] !w-[300px]">
                  <DataCard item={item} onOpen={() => openDetailPanel({ kind: item.kind, id: item.id })} />
                </SwiperSlide>
              ))}
            </Swiper>
          )}

          {/* Flechas de navegación */}
          {!isLoading && items.length > 1 && (
            <div className="mt-2 flex items-center justify-center gap-4">
              <NavButton refEl={prevRef} side="left"><ChevronLeftIcon className="h-6 w-6 text-carbon dark:text-beige-arena" /></NavButton>
              <NavButton refEl={nextRef} side="right"><ChevronRightIcon className="h-6 w-6 text-carbon dark:text-beige-arena" /></NavButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataPage;
