import React from 'react';

/**
 * Tarjeta flexible para bento grids (tamaños mixtos vía `className` con col/row-span).
 * - `image`: si se pasa, es una foto-card (fondo cover + overlay + texto claro encima).
 * - sin `image`: superficie clara sobre la paleta actual.
 * Hover lift sutil (respeta prefers-reduced-motion vía motion-reduce).
 */
interface BentoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  image?: string;
  overlay?: boolean;
  interactive?: boolean;
  eyebrow?: string;
}

const BentoCard: React.FC<BentoCardProps> = ({
  image,
  overlay = true,
  interactive = true,
  eyebrow,
  className = '',
  children,
  ...rest
}) => {
  const base =
    'relative overflow-hidden rounded-2xl border transition-all duration-300 ' +
    (interactive ? 'hover:-translate-y-1 hover:shadow-medium motion-reduce:transform-none ' : '');

  if (image) {
    return (
      <div
        className={`${base} border-white/15 shadow-medium ${className}`}
        {...rest}
      >
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105 motion-reduce:transform-none"
          style={{ backgroundImage: `url(${image})` }}
          aria-hidden="true"
        />
        {overlay && (
          <div
            className="absolute inset-0 bg-gradient-to-t from-carbon/85 via-carbon/35 to-transparent"
            aria-hidden="true"
          />
        )}
        <div className="relative z-10 flex h-full flex-col p-5 text-blanco-puro">
          {eyebrow && (
            <span className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-amarillo-sol">
              {eyebrow}
            </span>
          )}
          {children}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${base} border-carbon/10 dark:border-white/10 bg-blanco-puro/95 dark:bg-noche-selva/60 backdrop-blur-md shadow-subtle ${className}`}
      {...rest}
    >
      <div className="flex h-full flex-col p-5">
        {eyebrow && (
          <span className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-terracota">
            {eyebrow}
          </span>
        )}
        {children}
      </div>
    </div>
  );
};

export default BentoCard;
