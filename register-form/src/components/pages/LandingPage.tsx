import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Navbar';
import HeroSection from '../sections/HeroSection';
import PurposeSection from '../sections/PurposeSection';
import HowItWorksSection from '../sections/HowItWorksSection';
import WhoWeAreSection from '../sections/WhoWeAreSection';
import GlobalLayeredBackground from '../GlobalLayeredBackground';
import { useDayNightCycle } from '../../hooks/useDayNightCycle';
import { useSoundManager } from '../../utils/SoundManager';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [audioInitialized, setAudioInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(() => {
    // Check if we've already loaded the app in this session
    return !sessionStorage.getItem('hasLoadedApp');
  });
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isImmersiveMovementEnabled, setIsImmersiveMovementEnabled] = useState(true);
  const { currentTheme, setTheme } = useDayNightCycle(0);

  const toggleImmersiveMovement = () => {
    setIsImmersiveMovementEnabled(prev => !prev);
  };

  const toggleTheme = () => {
    setTheme(currentTheme.theme === 'night' ? 'day' : 'night');
  };
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const purposeRef = useRef<HTMLDivElement>(null);
  const howItWorksRef = useRef<HTMLDivElement>(null);
  const quienesSomosRef = useRef<HTMLDivElement>(null);

  const { initialize: initializeAudio, resumeAmbient } = useSoundManager();

  const sections = useMemo(() => [
    { id: 'home', title: 'Inicio', ref: heroRef },
    { id: 'purpose', title: 'Propósito', ref: purposeRef },
    { id: 'how-it-works', title: 'Cómo Funciona', ref: howItWorksRef },
    { id: 'quienes-somos', title: 'Quiénes Somos', ref: quienesSomosRef },
  ], []);

  // --- Lógica de Scroll --- 
  useEffect(() => {
    const container = scrollContainerRef.current;

    const handleScroll = () => {
      if (container) {
        const { scrollTop, clientHeight } = container;
        const progress = Math.max(0, Math.min(1, scrollTop / clientHeight));
        setScrollProgress(progress);
      }
    };

    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  // Simular carga de la aplicación y precargar assets
  useEffect(() => {
    if (!isLoading) return;

    let isMounted = true;
    
    // Lista de assets críticos que causan lag si se cargan por demanda
    const criticalAssets = [
      '/assets/background/bg1.png',
      '/assets/ui/organization.jpg',
      '/assets/ui/enterprise.jpg',
      '/assets/background/bg21.jpg',
      '/assets/background/bg21_dawn.jpg',
      '/assets/background/bg21_dusk.jpg',
      '/assets/background/bg21_night.jpg'
    ];

    const preloadImages = (urls: string[]) => {
      return Promise.all(
        urls.map((url) => {
          return new Promise((resolve) => {
            const img = new Image();
            img.onload = resolve;
            img.onerror = resolve; // Continuar aunque falle una imagen
            img.src = url;
          });
        })
      );
    };

    // Timeout de respaldo por si el internet es muy lento (max 5 segs)
    const fallbackTimer = setTimeout(() => {
      if (isMounted) {
        setIsLoading(false);
        sessionStorage.setItem('hasLoadedApp', 'true');
      }
    }, 5000);

    void preloadImages(criticalAssets).then(() => {
      if (isMounted) {
        clearTimeout(fallbackTimer);
        // Damos 300ms extras para asegurar que React haya renderizado las capas
        setTimeout(() => {
          setIsLoading(false);
          sessionStorage.setItem('hasLoadedApp', 'true');
        }, 300);
      }
    });

    return () => {
      isMounted = false;
      clearTimeout(fallbackTimer);
    };
  }, [isLoading]);

  // Intentar iniciar audio inmediatamente al montar (durante la pantalla de carga)
  useEffect(() => {
    if (audioInitialized) return;

    // Intentar autoplay directo (funciona si hay contexto de interacción previa)
    const tryAutoplay = () => {
      if (audioInitialized) return;
      setAudioInitialized(true);
      initializeAudio();
    };

    tryAutoplay();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fallback: si el navegador bloqueó el autoplay, arrancar con la primera interacción
  useEffect(() => {
    if (audioInitialized) return;

    const handleFirstInteraction = () => {
      if (!audioInitialized) {
        setAudioInitialized(true);
        initializeAudio();
        resumeAmbient();
      }
    };

    const events = ['click', 'keydown', 'touchstart', 'mousemove', 'scroll'];
    events.forEach(event => {
      document.addEventListener(event, handleFirstInteraction, { once: true, passive: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleFirstInteraction);
      });
    };
  }, [audioInitialized, initializeAudio, resumeAmbient]);

  return (
    <>
      {isLoading && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center" style={{ backgroundColor: '#7A9A3E' }}>
          <div className="text-center">
            <div className="relative w-16 h-16 mx-auto mb-6">
              <div className="absolute inset-0 border-4 rounded-full" style={{ borderColor: 'rgba(0, 123, 255, 0.2)' }}></div>
              <div className="absolute inset-0 border-4 rounded-full animate-spin" style={{ borderColor: '#F39C12', borderTopColor: 'transparent' }}></div>
            </div>
            
            <h2 className="text-2xl font-serif mb-2" style={{ color: '#F4F4F4' }}>Porerekua</h2>
            <p className="text-sm" style={{ color: 'rgba(244, 244, 244, 0.8)' }}>ser solidario, compartir lo que se tiene.</p>
            
            <div className="mt-6 w-48 h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(0, 123, 255, 0.2)'}}>
              <div className="h-full rounded-full animate-pulse" style={{ width: '100%', animation: 'loadingBar 2.5s ease-in-out', backgroundColor: '#F39C12' }}></div>
            </div>
          </div>
        </div>
      )}

      <GlobalLayeredBackground scrollProgress={scrollProgress} isImmersiveMovementEnabled={isImmersiveMovementEnabled} />
      <div 
        ref={scrollContainerRef}
        className={`h-screen snap-y snap-mandatory transition-opacity duration-500 hide-scrollbar ${
          isLoading ? 'opacity-0' : 'opacity-100'
        } overflow-y-scroll`} 
        style={{ scrollBehavior: 'smooth' }}
      >
        <Navbar
          sections={sections}
          isImmersiveMovementEnabled={isImmersiveMovementEnabled}
          toggleImmersiveMovement={toggleImmersiveMovement}
          isDarkTheme={currentTheme.theme === 'night'}
          toggleTheme={toggleTheme}
        />
        <main>
          <HeroSection ref={heroRef} onRegister={() => { void navigate('/registro'); }} scrollProgress={scrollProgress} />
          <PurposeSection ref={purposeRef} />
          <HowItWorksSection ref={howItWorksRef} onRegister={() => { void navigate('/registro'); }} />
          <WhoWeAreSection ref={quienesSomosRef} />
        </main>
      </div>

      <style>{`
        @keyframes loadingBar {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; }
        }
      `}</style>
    </>
  );
};

export default LandingPage;
