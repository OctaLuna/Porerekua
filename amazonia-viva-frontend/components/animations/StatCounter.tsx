import React, { useRef } from 'react';
import { gsap, ScrollTrigger, useGSAP } from './gsap-setup';
import { prefersReducedMotion } from './motion';

/**
 * Contador con conteo ascendente al entrar en el viewport (GSAP + ScrollTrigger).
 * Reduced-motion → muestra el valor final directamente, sin animar.
 */
interface StatCounterProps {
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

const format = (n: number, decimals: number) =>
  n.toLocaleString('es-BO', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

const StatCounter: React.FC<StatCounterProps> = ({
  value,
  duration = 1.6,
  decimals = 0,
  prefix = '',
  suffix = '',
  className = '',
}) => {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      if (prefersReducedMotion()) {
        el.textContent = `${prefix}${format(value, decimals)}${suffix}`;
        return;
      }
      const obj = { n: 0 };
      el.textContent = `${prefix}${format(0, decimals)}${suffix}`;
      gsap.to(obj, {
        n: value,
        duration,
        ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        onUpdate: () => {
          el.textContent = `${prefix}${format(obj.n, decimals)}${suffix}`;
        },
      });
      return () => ScrollTrigger.getAll().forEach((s) => s.trigger === el && s.kill());
    },
    { scope: ref, dependencies: [value] },
  );

  return <span ref={ref} className={className}>{`${prefix}${format(value, decimals)}${suffix}`}</span>;
};

export default StatCounter;
