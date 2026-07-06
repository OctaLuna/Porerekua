import React, { useRef } from 'react';
import { gsap, useGSAP } from '../animations/gsap-setup';
import { prefersReducedMotion } from '../animations/motion';

/**
 * Banda/ticker infinita (translateX en loop con GSAP), pausable al hover.
 * Reduced-motion → estática (solo muestra el contenido, sin desplazamiento).
 */
interface MarqueeProps {
  items: React.ReactNode[];
  speed?: number; // px por segundo
  className?: string;
  itemClassName?: string;
  separator?: React.ReactNode;
}

const Marquee: React.FC<MarqueeProps> = ({
  items,
  speed = 45,
  className = '',
  itemClassName = '',
  separator = <span className="text-terracota">•</span>,
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  useGSAP(
    () => {
      const track = trackRef.current;
      if (!track || prefersReducedMotion()) return;
      const half = track.scrollWidth / 2;
      if (half <= 0) return;
      tweenRef.current = gsap.to(track, { x: -half, duration: half / speed, ease: 'none', repeat: -1 });
      return () => tweenRef.current?.kill();
    },
    { scope: trackRef, dependencies: [items.length, speed] },
  );

  const Row = (
    <div className="flex shrink-0 items-center gap-8 pr-8" aria-hidden="true">
      {items.map((it, i) => (
        <span key={i} className={`flex items-center gap-8 whitespace-nowrap ${itemClassName}`}>
          {it}
          {separator}
        </span>
      ))}
    </div>
  );

  return (
    <div
      className={`overflow-hidden ${className}`}
      onMouseEnter={() => tweenRef.current?.pause()}
      onMouseLeave={() => tweenRef.current?.resume()}
    >
      <div ref={trackRef} className="flex w-max">
        {Row}
        {Row}
      </div>
    </div>
  );
};

export default Marquee;
