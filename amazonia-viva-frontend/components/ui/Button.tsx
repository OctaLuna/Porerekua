import React from 'react';

/**
 * Botón reutilizable y unificado para todo el sitio.
 * - `variant` define color/estado; `size` define padding y tamaño de texto.
 * - Estados hover/focus/active/disabled consistentes en toda la app.
 * - Respeta prefers-reduced-motion (sin desplazamiento en hover).
 * - Sigue aceptando `className` para ajustes puntuales de layout (ancho, gap…).
 */
export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'neutral'
  | 'outline'
  | 'ghost'
  | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const BASE =
  'inline-flex items-center justify-center rounded-md font-medium select-none ' +
  'transition-all duration-300 ease-in-out ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent ' +
  'disabled:opacity-50 disabled:pointer-events-none ' +
  'hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] ' +
  'motion-reduce:transform-none motion-reduce:transition-colors';

const SIZES: Record<ButtonSize, string> = {
  sm: 'text-xs px-3 py-1.5 gap-1.5',
  md: 'text-sm px-4 py-2 gap-2',
  lg: 'text-base px-6 py-3 gap-2',
};

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-verde-brote text-blanco-puro hover:bg-verde-oscuro hover:shadow-verde-glow focus-visible:ring-verde-brote/50',
  secondary:
    'bg-terracota text-white hover:brightness-105 hover:shadow-azai-glow focus-visible:ring-terracota/50',
  neutral:
    'bg-gris-piedra/85 text-white hover:bg-gris-piedra hover:shadow-medium focus-visible:ring-gris-piedra/50',
  outline:
    'border border-carbon/15 dark:border-white/15 text-carbon dark:text-beige-arena hover:bg-verde-brote/10 hover:border-verde-brote/40 focus-visible:ring-verde-brote/40',
  ghost:
    'text-carbon dark:text-beige-arena hover:bg-carbon/5 dark:hover:bg-white/10 focus-visible:ring-verde-brote/30',
  danger:
    'bg-accent-rojo/90 text-white hover:bg-accent-rojo hover:shadow-rojo-glow focus-visible:ring-accent-rojo/50',
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', children, ...props }, ref) => (
    <button
      ref={ref}
      className={`${BASE} ${SIZES[size]} ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  ),
);

Button.displayName = 'Button';

export default Button;
