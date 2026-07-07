import React, { useState } from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className, style }) => {
  const [mousePosition, setMousePosition] = useState({ x: -100, y: -100 });
  const [hovered, setHovered] = useState(false);
  const [spot, setSpot] = useState({ x: -9999, y: -9999, opacity: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePosition({ x, y });
    setSpot({ x, y, opacity: 1 });
  };

  const handleMouseLeave = () => {
    setMousePosition({ x: -200, y: -200 });
    setHovered(false);
    setSpot((s) => ({ ...s, opacity: 0 }));
  };

  // Usar el color de fondo del tema (blanco en modo claro, gris oscuro en modo oscuro)
  const baseBackgroundColor = 'var(--theme-background)';
  // Make the radial spot stronger and use a translucent white spot to simulate a "water" highlight
  // We'll remove the full-card dark overlay so the effect is a punctual, following spot.
  const hoverEffectInner = 'rgba(255, 255, 255, 0.22)';
  const hoverEffectMid = 'rgba(255, 255, 255, 0.12)';
  const hoverEffectOuter = 'rgba(255, 255, 255, 0.03)';

  return (
    <div
      // Remove backdrop blur and use a solid background; add a hover overlay for translucency
      className={`rounded-xl p-6 transition-shadow duration-300 ease-in-out ${className}`}
      style={{
        background: `transparent`,
        transition: 'background 220ms ease, box-shadow 300ms ease',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        position: 'relative',
        pointerEvents: 'auto',
        overflow: 'hidden',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        ...style,
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      {/* background layer: solid color but masked locally to reveal page behind where the mouse is */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: baseBackgroundColor,
          borderRadius: 'inherit',
          pointerEvents: 'none',
          transition: 'mask-image 280ms ease, -webkit-mask-image 280ms ease',
          // mask creates a very subtle translucent area in the background layer so the page behind shows through
          // Make this extremely subtle: center mask alpha very close to 1 so only a faint translucency is revealed.
          WebkitMaskImage: 'none',
          maskImage: 'none',
        }}
      />

      {/* Radial glow spot — amarillo muy tenue que sigue el cursor */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          borderRadius: 'inherit',
          background: `radial-gradient(circle 180px at ${spot.x}px ${spot.y}px, rgba(255,252,120,0.28) 0%, rgba(255,252,120,0.12) 50%, transparent 100%)`,
          opacity: spot.opacity,
          transition: 'opacity 300ms ease',
        }}
      />

      {/* content above the background layer */}
      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
    </div>
  );
};

export default GlassCard;