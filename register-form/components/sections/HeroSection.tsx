import React, { forwardRef } from 'react';
import Button from '../ui/Button';
import GlassCard from '../ui/GlassCard';

interface HeroSectionProps {
  onRegister: () => void;
  scrollProgress: number;
}

const HeroSection = forwardRef<HTMLDivElement, HeroSectionProps>(({ onRegister, scrollProgress }, ref) => {
  const opacity = Math.max(0, 1 - scrollProgress * 1.5);
  const scale = 1 + scrollProgress * 0.25;
  return (
    <section ref={ref} id="home" className="relative h-screen snap-start">
      <style>{`
         #home {
            --hero-panel-center-y: 68vh;
            --hero-panel-height: clamp(220px, 38vh, 440px);
            --hero-navbar-height: 9rem;
            --hero-panel-top: calc(var(--hero-panel-center-y) - (var(--hero-panel-height) / 2));
          }

         @media (max-height: 580px) {
           #home {
             --hero-panel-height: clamp(160px, 32vh, 230px);
           }
           .hero-secondary-text {
             display: none !important;
           }
           .hero-panel-card {
             padding-top: 0.8vh !important;
             padding-bottom: 0.8vh !important;
           }
           .hero-title {
             font-size: clamp(24px, 6.5vh, 36px) !important;
             margin-bottom: 0.6vh !important;
           }
           .hero-button-container {
             margin-top: 1.2vh !important;
           }
         }
       `}</style>


      <div
        style={{
          position: 'fixed',
          top: 'var(--hero-panel-center-y)',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 9,
          opacity,
          willChange: 'opacity, transform',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            width: '66vh',
            maxWidth: '92vw',
            margin: '0 auto',
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
          }}
        >
          <div style={{ pointerEvents: opacity > 0 ? 'auto' : 'none' }}>
            <GlassCard
              className="!p-0 hero-panel-card"
              style={{
                padding: 'min(2.8vh, 22px)',
                height: 'var(--hero-panel-height)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                minHeight: 'auto',
                opacity: 0.92,
              }}
            >
              <p
                className="uppercase font-semibold"
                style={{
                  color: 'var(--color-amarillo-sol)',
                  fontSize: 'clamp(10px, 1.4vh, 14px)',
                  letterSpacing: '0.45em',
                  marginBottom: '1vh',
                  textAlign: 'center',
                }}
              >
                ser solidario, compartir lo que se tiene
              </p>
              <h1
                className="font-serif font-bold hero-title"
                style={{
                  color: 'var(--theme-text-primary)',
                  fontSize: 'clamp(32px, 5.5vh, 56px)',
                  marginBottom: '1.5vh',
                  lineHeight: '1.1',
                  textAlign: 'center',
                }}
              >
                Porerekua
              </h1>
              <div
                style={{
                  color: 'var(--theme-text-secondary)',
                  fontSize: 'clamp(14px, 1.9vh, 18px)',
                  marginBottom: '0.8vh',
                  maxWidth: '60vh',
                  margin: '0 auto 0.8vh',
                  lineHeight: '1.4',
                  textAlign: 'center',
                }}
              >
                Conectamos iniciativas que cuidan la Amazonía.<br />
                <span className="hero-secondary-text" style={{ fontSize: 'clamp(12px, 1.6vh, 15px)', opacity: 0.8 }}>
                  Registra tu aporte y forma parte de una red que impulsa conservación, conocimiento y bienestar comunitario.
                </span>
              </div>
              <div className="flex items-center justify-center hero-button-container" style={{ marginTop: '2.5vh' }}>
                <Button
                  onClick={onRegister}
                  variant="primary"
                  className="!bg-transparent !border-[var(--color-naranja-vibrante)] !text-[var(--color-naranja-vibrante)] hover:!bg-[rgba(243,156,18,0.10)] uppercase font-semibold"
                  style={{
                    padding: 'min(1.2vh, 12px) min(4vh, 32px)',
                    fontSize: 'clamp(12px, 1.6vh, 14px)',
                    letterSpacing: '0.1em',
                    height: 'clamp(40px, 5.5vh, 54px)',
                  }}
                >
                  Regístrate
                </Button>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </section>
  );
});

HeroSection.displayName = 'HeroSection';
export default HeroSection;
