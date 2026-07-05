import React, { useRef } from 'react';
import { useGSAP } from './gsap-setup';
import { revealElement, type RevealOptions } from './motion';

type RevealProps = RevealOptions &
  React.HTMLAttributes<HTMLDivElement> & {
    /** Etiqueta/elemento a renderizar (por defecto `div`). */
    as?: React.ElementType;
  };

/**
 * Envoltorio declarativo para animaciones de entrada/scroll con GSAP.
 * - Anima solo opacity + transform (bueno para móvil).
 * - Respeta prefers-reduced-motion (deja el contenido visible sin animar).
 * - Con `stagger`, anima los hijos directos en cascada.
 *
 * Ejemplos:
 *   <Reveal>…</Reveal>
 *   <Reveal as="section" y={40} delay={0.1}>…</Reveal>
 *   <Reveal stagger={0.08} className="grid …">{cards}</Reveal>
 */
const Reveal: React.FC<RevealProps> = ({
  as: Tag = 'div',
  y,
  x,
  delay,
  duration,
  ease,
  stagger,
  start,
  once,
  children,
  ...rest
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => revealElement(ref.current, { y, x, delay, duration, ease, stagger, start, once }),
    { scope: ref },
  );

  const Component = Tag;
  return (
    <Component ref={ref} {...rest}>
      {children}
    </Component>
  );
};

export default Reveal;
