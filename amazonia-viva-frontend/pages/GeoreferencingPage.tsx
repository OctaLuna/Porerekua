import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useProyectosMap } from '../hooks/useProyectos';
import Skeleton from '../components/ui/Skeleton';
import { ProyectoMap } from '../types/api';
import Card from '../components/ui/Card';
import { motion } from 'framer-motion';
import { useUI } from '../hooks/useUI';

const SearchIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
);

const ChevronLeftIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="15 18 9 12 15 6"></polyline>
  </svg>
);

const ChevronRightIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);

const CompassIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="12" cy="12" r="10"></circle>
        <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
    </svg>
);

// ── ProjectCard ───────────────────────────────────────────────────────────────
interface ProjectCardProps {
  project: ProyectoMap;
  isSelected: boolean;
  onSelect: (project: ProyectoMap) => void;
  cardRef?: (el: HTMLDivElement | null) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, isSelected, onSelect, cardRef }) => {
  const descripcion = project.descripcion ?? '';
  return (
    <div
      ref={cardRef}
      onClick={() => onSelect(project)}
      data-project-id={project.id}
      className="relative"
    >
      <Card className={`w-60 flex-shrink-0 h-full flex flex-col overflow-hidden backdrop-blur-md border shadow-medium rounded-lg transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-2 cursor-pointer ${
        isSelected
          ? 'border-verde-brote/70 ring-2 ring-verde-brote/50 bg-blanco-puro dark:bg-noche-selva/80 -translate-y-2'
          : 'border-carbon/10 dark:border-white/10 bg-blanco-puro/95 dark:bg-noche-selva/60 hover:shadow-terracota/40'
      }`}>
        {project.imagenPrincipalUrl ? (
          <img src={project.imagenPrincipalUrl} alt={project.nombre} className="w-full h-32 object-cover" />
        ) : (
          <div className="w-full h-32 bg-verde-hoja-seca/40 dark:bg-noche-selva/80 flex items-center justify-center">
            <CompassIcon className="h-8 w-8 text-verde-brote/60" />
          </div>
        )}
        <div className="p-3 flex flex-col flex-grow">
          <h3 className={`text-md font-bold font-serif mb-1 leading-tight line-clamp-2 min-h-[2.5rem] ${isSelected ? 'text-verde-brote' : 'text-carbon dark:text-beige-arena'}`}>{project.nombre}</h3>
          <p className="text-gris-piedra dark:text-beige-arena/80 text-xs flex-grow line-clamp-3">
            {descripcion}
          </p>
          {isSelected && (
            <span className="text-xs font-semibold text-verde-brote mt-2 flex items-center gap-1">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/></svg>
              Ver en mapa
            </span>
          )}
        </div>
      </Card>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const GeoreferencingPage: React.FC = () => {
  const { data: projects, isLoading, isError } = useProyectosMap();
  const { openDetailPanel } = useUI();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<Map<number, maplibregl.Marker>>(new Map());
  const cardRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  const filteredProjects = useMemo(() => {
    if (!projects) return [];
    return projects.filter(p => p.nombre.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [projects, searchTerm]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.clientWidth * 0.75;
      scrollContainerRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  // Volar al marcador, mostrar popup y abrir DetailsPanel
  const handleCardClick = useCallback((project: ProyectoMap) => {
    const lng = Number(project.lng);
    const lat = Number(project.lat);

    setSelectedId(project.id);

    // Scrollear el card al centro del carrusel
    const cardEl = cardRefs.current.get(project.id);
    cardEl?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });

    if (Number.isFinite(lng) && Number.isFinite(lat) && map.current) {
      // Cerrar todos los popups abiertos
      markersRef.current.forEach((marker) => {
        if (marker.getPopup()?.isOpen()) marker.togglePopup();
      });
      // Volar al marcador
      map.current.flyTo({ center: [lng, lat], zoom: 10, duration: 1200 });
      // Abrir popup después de la animación
      setTimeout(() => {
        const marker = markersRef.current.get(project.id);
        if (marker && !marker.getPopup()?.isOpen()) marker.togglePopup();
      }, 1300);
    }

    // Abrir panel de detalle del proyecto
    openDetailPanel({ kind: 'proyecto', id: project.id });
  }, [openDetailPanel]);

  // Inicializar mapa
  const [API_KEY] = useState(import.meta.env.VITE_MAPTILER_KEY ?? '');
  const OSM_STYLE: maplibregl.StyleSpecification = {
    version: 8,
    sources: {
      osm: {
        type: 'raster',
        tiles: ['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png', 'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png'],
        tileSize: 256,
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      },
    },
    layers: [
      // Fondo temático mientras cargan (o si fallan) los tiles, para no mostrar blanco.
      { id: 'bg', type: 'background', paint: { 'background-color': '#dfe4d3' } },
      { id: 'osm-tiles', type: 'raster', source: 'osm', minzoom: 0, maxzoom: 19 },
    ],
  };
  const mapStyle = API_KEY ? `https://api.maptiler.com/maps/dataviz/style.json?key=${API_KEY}` : OSM_STYLE;

  useEffect(() => {
    if (map.current || !mapContainer.current) return;
    map.current = new maplibregl.Map({ container: mapContainer.current, style: mapStyle, center: [-65, -10], zoom: 4 });
    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');
  }, []);

  // Recrear markers cuando cambian los proyectos filtrados
  useEffect(() => {
    if (!map.current || !filteredProjects) return;

    // Limpiar markers existentes
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    for (const project of filteredProjects) {
      const lng = Number(project.lng);
      const lat = Number(project.lat);
      if (!Number.isFinite(lng) || !Number.isFinite(lat)) continue;

      const descripcion = project.descripcion ?? '';
      const popup = new maplibregl.Popup({ offset: 25 }).setHTML(
        `<div style="padding:10px;max-width:220px;">
          <h3 style="font-weight:bold;font-size:14px;margin-bottom:4px;">${project.nombre}</h3>
          <p style="font-size:12px;color:#666;">${descripcion.substring(0, 120)}${descripcion.length > 120 ? '...' : ''}</p>
          <p style="font-size:11px;color:#888;margin-top:4px;">${project.area?.nombre ?? ''} ${project.anioInicio ? `· ${project.anioInicio}` : ''}</p>
        </div>`
      );

      const marker = new maplibregl.Marker({ color: '#4A9B5F' })
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(map.current!);

      // Click en marker también selecciona el card
      marker.getElement().addEventListener('click', () => {
        setSelectedId(project.id);
        const cardEl = cardRefs.current.get(project.id);
        cardEl?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      });

      markersRef.current.set(project.id, marker);
    }
  }, [filteredProjects]);

  const renderSkeletons = () => (
    <>
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="w-60 flex-shrink-0 h-full">
          <Card className="w-full h-full flex flex-col bg-blanco-puro/95 dark:bg-noche-selva/60 backdrop-blur-md border border-carbon/10 dark:border-white/10 shadow-medium rounded-lg">
            <Skeleton className="w-full h-32" />
            <div className="p-3 flex-1">
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-3 w-full mb-1" />
              <Skeleton className="h-3 w-5/6" />
            </div>
          </Card>
        </div>
      ))}
    </>
  );

  return (
    <>
      <style>{`
        .project-scroll::-webkit-scrollbar { display: none; }
        .project-scroll { -ms-overflow-style: none; scrollbar-width: none; }
        .maplibregl-popup .maplibregl-popup-content { padding: 0; border-radius: 8px; }
        .maplibregl-popup-close-button { right: 4px; top: 4px; }
      `}</style>
      <div className="relative w-full h-screen overflow-hidden">
        {/* Map (con fondo degradado como fallback cuando no hay tiles de MapTiler) */}
        <div
          ref={mapContainer}
          className="absolute inset-0 z-0 bg-gradient-to-br from-verde-hoja-seca/20 via-beige-arena to-azul-cobalto/10 dark:from-noche-selva dark:via-noche-selva dark:to-verde-hoja-seca/30"
        />

        {/* Bottom panel */}
        <motion.div
          className="absolute bottom-4 sm:bottom-6 left-4 right-4 z-10"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="rounded-2xl shadow-medium flex h-[220px] sm:h-[270px] md:h-[320px] p-4 border border-white/40 dark:border-beige-arena/10 backdrop-blur-md bg-beige-arena/95 dark:bg-noche-selva/70">
            {/* Left: Search */}
            <div className="w-full md:w-1/3 lg:w-1/4 p-4 flex-shrink-0 flex flex-col justify-center border-r border-white/40 dark:border-beige-arena/10">
              <div className="flex items-center gap-3 mb-4">
                <CompassIcon className="h-6 w-6 text-verde-brote flex-shrink-0" />
                <h2 className="text-3xl font-bold font-serif text-carbon dark:text-beige-arena leading-tight">
                  Explorar Proyectos
                </h2>
              </div>
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nombre..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setSelectedId(null); }}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-blanco-puro/95 dark:bg-noche-selva/60 backdrop-blur-md border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-azul-cobalto focus:border-transparent transition-all"
                />
              </div>
              {selectedId && (
                <button
                  onClick={() => setSelectedId(null)}
                  className="mt-3 text-xs text-gris-piedra hover:text-terracota transition-colors underline text-left"
                >
                  Limpiar selección
                </button>
              )}
            </div>

            {/* Right: Cards carousel */}
            <div className="flex-grow flex items-center relative pl-4 min-w-0">
              <button
                onClick={() => handleScroll('left')}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-blanco-puro/95 dark:bg-noche-selva/60 backdrop-blur-md hover:bg-blanco-puro/80 w-10 h-10 flex items-center justify-center rounded-full shadow-medium transition-all border border-carbon/10 dark:border-white/10"
                aria-label="Scroll left"
              >
                <ChevronLeftIcon className="h-6 w-6 text-carbon dark:text-beige-arena" />
              </button>

              <div ref={scrollContainerRef} className="flex items-stretch gap-4 overflow-x-auto project-scroll w-full h-full px-12 py-4">
                {isLoading && renderSkeletons()}
                {isError && <p className="text-center text-red-500 w-full">Error al cargar los proyectos.</p>}
                {!isLoading && !isError && filteredProjects.length > 0 && filteredProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    isSelected={selectedId === project.id}
                    onSelect={handleCardClick}
                    cardRef={(el) => {
                      if (el) cardRefs.current.set(project.id, el);
                      else cardRefs.current.delete(project.id);
                    }}
                  />
                ))}
                {!isLoading && !isError && filteredProjects.length === 0 && (
                  <div className="w-full h-full flex items-center justify-center">
                    <p className="text-lg text-gray-500 dark:text-gray-400">No se encontraron proyectos.</p>
                  </div>
                )}
              </div>

              <button
                onClick={() => handleScroll('right')}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-blanco-puro/95 dark:bg-noche-selva/60 backdrop-blur-md hover:bg-blanco-puro/80 w-10 h-10 flex items-center justify-center rounded-full shadow-medium transition-all border border-carbon/10 dark:border-white/10"
                aria-label="Scroll right"
              >
                <ChevronRightIcon className="h-6 w-6 text-carbon dark:text-beige-arena" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default GeoreferencingPage;
