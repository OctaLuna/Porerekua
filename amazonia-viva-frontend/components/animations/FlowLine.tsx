import React, { useRef } from 'react';
import { gsap, ScrollTrigger, useGSAP } from './gsap-setup';
import { prefersReducedMotion } from './motion';

/**
 * Motivo de firma "flujo" — una línea orgánica (río/raíz) que se dibuja sola.
 * Evoca la idea de *intercambio/compartir* que significa "Pororekua".
 * Se reutiliza como: subrayado del nav activo, acento bajo títulos y trazo del hero.
 *
 * - `draw` (por defecto) anima el trazo al montar / cuando cambia `active`.
 * - `scrub` liga el dibujo al progreso de scroll (ScrollTrigger).
 * - `vertical` usa un trazo vertical (para el hero).
 * Respeta prefers-reduced-motion (queda dibujada, sin animar).
 */
interface FlowLineProps {
  className?: string;
  color?: string;
  strokeWidth?: number;
  duration?: number;
  active?: boolean;
  scrub?: boolean;
  vertical?: boolean;
}

const H_PATH = 'M2 9 C 46 2, 84 15, 130 8 S 216 2, 300 9';
const V_PATH = 'M9 2 C 2 70, 15 150, 8 230 S 2 380, 9 470';

const FlowLine: React.FC<FlowLineProps> = ({
  className = '',
  color = 'currentColor',
  strokeWidth = 2.5,
  duration = 0.9,
  active,
  scrub = false,
  vertical = false,
}) => {
  const wrapRef = useRef<HTMLSpanElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  useGSAP(
    () => {
      const path = pathRef.current;
      if (!path) return;
      const len = path.getTotalLength();
      const reduce = prefersReducedMotion();
      gsap.set(path, { strokeDasharray: len, strokeDashoffset: reduce ? 0 : len });
      if (reduce) return;

      if (scrub) {
        gsap.to(path, {
          strokeDashoffset: 0,
          ease: 'none',
          scrollTrigger: { trigger: wrapRef.current, start: 'top 85%', end: 'bottom 30%', scrub: true },
        });
      } else {
        gsap.to(path, { strokeDashoffset: 0, duration, ease: 'power2.out' });
      }
      return () => ScrollTrigger.getAll().forEach((s) => s.trigger === wrapRef.current && s.kill());
    },
    { scope: wrapRef, dependencies: [active, scrub, vertical] },
  );

  return (
    <span ref={wrapRef} className={`pointer-events-none block ${className}`} aria-hidden="true">
      <svg
        viewBox={vertical ? '0 0 16 472' : '0 0 302 18'}
        preserveAspectRatio="none"
        className="h-full w-full overflow-visible"
      >
        <path
          ref={pathRef}
          d={vertical ? V_PATH : H_PATH}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </span>
  );
};

export default FlowLine;
