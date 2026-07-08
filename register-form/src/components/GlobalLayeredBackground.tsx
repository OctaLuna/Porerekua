import React, { useState, useEffect } from 'react';

interface GlobalLayeredBackgroundProps {
  scrollProgress: number;
  isImmersiveMovementEnabled: boolean;
}

const GlobalLayeredBackground: React.FC<GlobalLayeredBackgroundProps> = ({ scrollProgress = 0, isImmersiveMovementEnabled = true }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({ x: event.clientX, y: event.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const zoomScale = 1.1;
  const panIntensity = 0.15;

  const centerX = typeof window !== 'undefined' ? window.innerWidth / 2 : 0;
  const centerY = typeof window !== 'undefined' ? window.innerHeight / 2 : 0;

  const finalMousePosition = isImmersiveMovementEnabled 
    ? mousePosition 
    : { x: centerX, y: centerY };

  const mouseNormX = (finalMousePosition.x / (window.innerWidth || 1)) * 2 - 1;
  const mouseNormY = (finalMousePosition.y / (window.innerHeight || 1)) * 2 - 1;

  const maxSafePanX = ((window.innerWidth || 800) * (zoomScale - 1)) / 2;
  const maxSafePanY = ((window.innerHeight || 600) * (zoomScale - 1)) / 2;

  const panX = mouseNormX * maxSafePanX * panIntensity;
  const panY = mouseNormY * maxSafePanY * panIntensity;

  const heroFade = 1 - scrollProgress;

  const bg1Zoom = 1 + scrollProgress * 0.2;

  const purposeAlpha = scrollProgress > 0.15 ? Math.min(1, (scrollProgress - 0.15) * 2.5) : 0;

  const purposeStart = 0.35;
  const purposeLen = 0.4;
  const pProg = scrollProgress > purposeStart ? (scrollProgress - purposeStart) / purposeLen : 0;
  const bg2Alpha = Math.max(0, Math.min(1, pProg <= 0.5 ? pProg * 2 : 2 - pProg * 2));
  const bg2Zoom = 1 - pProg * 0.2;

  const purposeOverlayAlpha = scrollProgress > 0.15 && scrollProgress < 0.6 ? Math.min(0.5, (scrollProgress - 0.15) * 1.2) : 0;

  const bg3Alpha = heroFade > 0 ? Math.pow(heroFade, 1.5) : 0;
  const bg3Scale = zoomScale * (1 - scrollProgress * 0.2);
  const bg3Y = scrollProgress * -15;
  const bg3PanneX = panX * heroFade;
  const bg3PanneY = panY * heroFade;

  const bg4Alpha = scrollProgress > 0.5 ? Math.min(1, (scrollProgress - 0.5) * 2.5) : 0;

  const bg31Alpha = scrollProgress > 0.65 ? Math.min(1, (scrollProgress - 0.65) * 2.5) : 0;

  return (
    <>
      <div className="fixed top-0 left-0 w-full h-screen pointer-events-none bg-black" style={{ zIndex: -1 }}>
        <img src="/assets/background/bg21.jpg" alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover" style={{ opacity: purposeAlpha, willChange: 'opacity' }} />
        <img src="/assets/background/bg1.png" alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover" style={{ opacity: heroFade, transform: `scale(${bg1Zoom})`, willChange: 'opacity, transform' }} />
        <img src="/assets/background/bg11.png" alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover" style={{ opacity: bg3Alpha, transform: `translate(${bg3PanneX}px, ${bg3PanneY}px) scale(${bg3Scale}) translateY(${bg3Y}vh)`, willChange: 'opacity, transform' }} />
        <div className="absolute inset-0 z-[2]" style={{ opacity: 0 }} />
        <img src="/assets/background/bg2.png" alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover" style={{ opacity: bg2Alpha, transform: `scale(${bg2Zoom})`, willChange: 'opacity, transform' }} />
        <img src="/assets/background/bg4.png" alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover" style={{ opacity: bg4Alpha, transform: `scale(${zoomScale})`, willChange: 'opacity, transform' }} />
        <div className="absolute inset-0 bg-black/40" style={{ opacity: purposeOverlayAlpha, pointerEvents: 'none' }} />
      </div>
      
      <div className="fixed top-0 left-0 w-full h-screen pointer-events-none" style={{ zIndex: -1 }}>
       
        <img src="/assets/background/bg31.jpg" alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover" style={{ opacity: bg31Alpha, willChange: 'opacity' }} />
        <div className="absolute inset-0 bg-black" style={{ opacity: bg31Alpha * 0.5 }} />
      </div>
    </>
  );
};

export default GlobalLayeredBackground;