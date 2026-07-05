import React from 'react';

/** Tipo de entidad que representa la tarjeta (coincide con `openDetailPanel`). */
export type DataKind = 'organizacion' | 'empresa' | 'proyecto';

export interface DataCardItem {
  id: number;
  kind: DataKind;
  nombre: string;
  subtitulo: string;
  descripcion?: string | null;
  imagenUrl?: string | null;
  logoUrl?: string | null;
  chips: string[];
}

const MapPinIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const ArrowRightIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

/**
 * Tarjeta de la red (Organización / Empresa / Proyecto) para el carrusel coverflow
 * de /datos. Cabecera con imagen o logo, cuerpo con título, ubicación, descripción,
 * chips y un botón circular de acción. Mantiene la paleta del sitio.
 */
const DataCard: React.FC<{ item: DataCardItem; onOpen: () => void }> = ({ item, onOpen }) => {
  const { nombre, subtitulo, descripcion, imagenUrl, logoUrl, chips } = item;

  return (
    <div
      className="flex h-full w-full flex-col overflow-hidden rounded-2xl bg-blanco-puro/95 dark:bg-noche-selva/70 border border-carbon/10 dark:border-white/10 shadow-medium"
    >
      {/* Cabecera: imagen (proyecto) o banda con logo/inicial (entidad) */}
      <div className="relative h-40 shrink-0 overflow-hidden">
        {imagenUrl ? (
          <img src={imagenUrl} alt={nombre} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-verde-brote/25 via-verde-hoja-seca/25 to-terracota/20">
            {logoUrl ? (
              <img src={logoUrl} alt={nombre} className="h-20 w-20 rounded-full border-2 border-white/70 object-cover shadow-medium" />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-white/70 bg-verde-hoja-seca/60 text-3xl font-bold font-serif text-blanco-puro shadow-medium">
                {nombre.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Cuerpo */}
      <div data-dc="body" className="flex flex-1 flex-col p-5">
        <h3 className="font-serif text-lg font-bold text-carbon dark:text-beige-arena line-clamp-2">
          {nombre}
        </h3>
        {subtitulo && (
          <p className="mt-1 flex items-center gap-1.5 text-xs text-gris-piedra dark:text-beige-arena/70">
            <MapPinIcon className="shrink-0 text-terracota" />
            <span className="truncate">{subtitulo}</span>
          </p>
        )}
        {descripcion && (
          <p className="mt-3 text-sm text-gris-piedra dark:text-beige-arena/80 line-clamp-3">
            {descripcion}
          </p>
        )}

        {/* Chips + acción */}
        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <div className="flex flex-wrap gap-1.5">
            {chips.slice(0, 3).map((chip) => (
              <span
                key={chip}
                className="rounded-full bg-verde-brote/15 px-2.5 py-0.5 text-[11px] font-semibold text-verde-oscuro dark:text-verde-brote"
              >
                {chip}
              </span>
            ))}
          </div>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onOpen(); }}
            aria-label={`Ver detalles de ${nombre}`}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-verde-brote text-blanco-puro shadow-verde-glow transition-all duration-300 hover:bg-verde-oscuro hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-verde-brote/50 motion-reduce:transform-none"
          >
            <ArrowRightIcon />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataCard;
