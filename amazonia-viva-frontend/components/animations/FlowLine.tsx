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
  const mountedRef = useRef(false);

  useGSAP(
    () => {
      const path = pathRef.current;
      if (!path) return;

      // El CSS de Tailwind (CDN, se inyecta de forma async) puede no haber
      // aplicado aún al montar, y algunos motores devuelven 0 en
      // getTotalLength() para un <path> sin caja de layout todavía — un
      // dasharray de 0 equivale a "sin trazo" (línea sólida siempre visible).
      // Se difiere un frame para medir ya con el layout asentado.
      let cancelled = false;
      const raf = requestAnimationFrame(() => {
        if (cancelled) return;
        const el = pathRef.current;
        if (!el) return;
        const len = el.getTotalLength();
        const reduce = prefersReducedMotion();
        const wasMounted = mountedRef.current;
        mountedRef.current = true;

        // `active === false`: si ya estaba dibujado (p.ej. al quitar el hover),
        // desdibujar rápido — interrumpe de inmediato cualquier trazo en curso
        // (overwrite) en vez de esperar a que termine. Siempre re-fija también
        // el dasharray (no solo el offset) para autocorregir una medición
        // previa inválida. En el montaje inicial se oculta al instante, sin animar.
        if (active === false) {
          if (!wasMounted || reduce) {
            gsap.set(el, { strokeDasharray: len, strokeDashoffset: len });
          } else {
            gsap.to(el, { strokeDasharray: len, strokeDashoffset: len, duration: 0.2, ease: 'power1.out', overwrite: true });
          }
          return;
        }

        gsap.set(el, { strokeDasharray: len, strokeDashoffset: reduce ? 0 : len });
        if (reduce) return;

        if (scrub) {
          gsap.to(el, {
            strokeDashoffset: 0,
            ease: 'none',
            scrollTrigger: { trigger: wrapRef.current, start: 'top 85%', end: 'bottom 30%', scrub: true },
          });
        } else {
          gsap.to(el, { strokeDashoffset: 0, duration, ease: 'power2.out', overwrite: true });
        }
      });

      return () => {
        cancelled = true;
        cancelAnimationFrame(raf);
        ScrollTrigger.getAll().forEach((s) => s.trigger === wrapRef.current && s.kill());
      };
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
