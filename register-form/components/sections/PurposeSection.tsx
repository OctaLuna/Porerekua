import React, { forwardRef, useEffect, useRef, useState } from 'react';

type PillarKey = 'conservacion' | 'desarrollo' | 'conocimiento';
type PurposeKey = 'conectar' | 'conservar' | 'empoderar' | 'informacion';
type ActivePanel = PillarKey | PurposeKey;

interface Pillar {
  key: PillarKey;
  title: string;
  subtitle: string;
  detail: string;
  icon: React.ReactNode;
}

interface PurposeAction {
  key: PurposeKey;
  title: string;
  detail: string;
}

const ICON_SIZE = '1.5em';

const PURPOSE_ACTIONS: PurposeAction[] = [
  {
    key: 'conectar',
    title: 'Conectar actores',
    detail:
      'Conectar empresas, fundaciones, la academia y sociedad civil en torno a iniciativas sostenibles en la Amazonía, promoviendo una plataforma de colaboración multiactor.',
  },
  {
    key: 'conservar',
    title: 'Conservar biodiversidad',
    detail:
      'Promover acciones orientadas a la conservación de la biodiversidad y la protección de los ecosistemas amazónicos.',
  },
  {
    key: 'empoderar',
    title: 'Empoderar comunidades',
    detail:
      'Empoderar a las comunidades locales e indígenas en procesos que fortalezcan su desarrollo y reconozcan sus saberes y prácticas.',
  },
  {
    key: 'informacion',
    title: 'Garantizar información',
    detail:
      'Garantizar el acceso a información sobre estas iniciativas a través de datos verificados y estructurados, que aporten a la investigación y, en el mediano y largo plazo, a la formulación de políticas públicas basadas en evidencia.',
  },
];

const PILLARS: Pillar[] = [
  {
    key: 'conservacion',
    title: 'Conservación',
    subtitle: 'Un manto de vida protegido',
    detail:
      'Promover la conservación de la Amazonía mediante iniciativas impulsadas por empresas y fundaciones, orientadas a proteger, mantener y gestionar responsablemente los ecosistemas, sus especies y recursos, asegurando su equilibrio y continuidad.',
    icon: (
      <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    key: 'desarrollo',
    title: 'Desarrollo Comunitario',
    subtitle: 'Centinelas de la vida amazónica',
    detail:
      'Fortalecer el desarrollo de los pueblos indígenas, promoviendo el ejercicio de sus derechos sobre sus territorios y recursos naturales, y favoreciendo condiciones de sostenibilidad que aseguren la continuidad de sus formas de vida, su organización y su identidad cultural.',
    icon: (
      <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    key: 'conocimiento',
    title: 'Democratizar Conocimiento',
    subtitle: 'Datos para preservar, conocimiento para transformar',
    detail:
      'Facilitar el acceso a datos sobre iniciativas de sostenibilidad de empresas y fundaciones en la Amazonía boliviana, contribuyendo a la generación de conocimiento desde la investigación y la construcción de políticas públicas.',
    icon: (
      <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 3v18h18" />
        <path d="M18 17V9" />
        <path d="M13 17V5" />
        <path d="M8 17v-3" />
      </svg>
    ),
  },
];

const PurposeSection = forwardRef<HTMLDivElement>((_, ref) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<ActivePanel | null>(null);
  const activePillar = active ? PILLARS.find((p) => p.key === active) : null;
  const activePurpose = active ? PURPOSE_ACTIONS.find((item) => item.key === active) : null;

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    const fit = () => {
      panel.style.fontSize = '';
      requestAnimationFrame(() => {
        if (!panel || panel.scrollHeight <= panel.clientHeight) return;
        let size = parseFloat(getComputedStyle(panel).fontSize);
        while (panel.scrollHeight > panel.clientHeight && size > 8.2) {
          size -= 0.5;
          panel.style.fontSize = `${size}px`;
        }
      });
    };

    const ro = new ResizeObserver(fit);
    ro.observe(panel);
    fit();
    return () => ro.disconnect();
  }, []);

  return (
    <>
      <style>{`
        @keyframes purposeFadeIn {
          from { opacity: 0; transform: translateY(8px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes purposeOverlayIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .purpose-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.55em;
          min-height: 5em;
          padding: 0.56em 0.72em;
          border-radius: 0.75em;
          border: 2px solid rgba(122,154,62,0.25);
          background: var(--theme-background-panel);
          color: var(--theme-text-primary);
          cursor: pointer;
          font-weight: 700;
          font-family: inherit;
          font-size: 1em;
          letter-spacing: 0.02em;
          text-align: center;
          transition: border-color 180ms ease, box-shadow 180ms ease, filter 180ms ease, transform 120ms ease;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }
        .purpose-btn:hover {
          border-color: rgba(244,196,48,0.76);
          box-shadow: 0 0 0 3px rgba(244,196,48,0.13), 0 0 16px rgba(244,196,48,0.32), 0 4px 14px rgba(49,47,42,0.1);
          filter: brightness(1.04);
          transform: translateY(-1px);
        }
        .purpose-action-btn {
          min-height: 2.55em;
          padding: 0.35em 0.75em;
          border-color: rgba(243,156,18,0.34);
          font-size: 0.9em;
        }
        .purpose-close-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 2em;
          height: 2em;
          border-radius: 50%;
          border: none;
          background: rgba(122,154,62,0.12);
          color: var(--theme-primary);
          cursor: pointer;
          flex-shrink: 0;
          transition: background 150ms ease;
        }
        .purpose-close-btn:hover {
          background: rgba(122,154,62,0.25);
        }
        @media (max-width: 760px) {
          .purpose-grid,
          .purpose-actions-grid {
            grid-template-columns: 1fr !important;
          }
          .purpose-btn {
            min-height: 4.6em;
          }
          .purpose-action-btn {
            min-height: 2.45em;
          }
        }
      `}</style>
      <section
        ref={ref}
        id="purpose"
        className="relative snap-start"
        style={{
          height: '100dvh',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          zIndex: 12,
          padding: 'calc(15rem + 4vh) max(4vw, 1rem) 4vh',
          backgroundColor: 'var(--theme-background)',
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: "url('/assets/background/bg21.jpg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center center',
            backgroundRepeat: 'no-repeat',
            backgroundColor: '#0E120D',
            zIndex: 0,
          }}
        />
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'visible',
            maxWidth: 'min(94vw, 58rem)',
            width: '100%',
            margin: '0 auto',
            marginTop: 'clamp(0.5rem, 1.4vh, 1rem)',
          }}
        >
          <div
            ref={panelRef}
            className="rounded-lg shadow-lg"
            style={{
              flex: '0 0 auto',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: 'var(--theme-background)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
              opacity: 0.92,
              isolation: 'isolate',
              fontSize: 'clamp(0.78rem, 1.48vh, 0.96rem)',
              padding: '1.05em 1.2em',
              overflow: 'visible',
              position: 'relative',
            }}
          >
            <div className="text-center" style={{ marginBottom: '0.7em' }}>
              <h2
                className="font-serif font-bold"
                style={{
                  color: 'var(--theme-text-primary)',
                  fontSize: '1.85em',
                  letterSpacing: '-0.01em',
                  marginBottom: '0.25em',
                }}
              >
                Nuestro propósito
              </h2>
              <p
                style={{
                  color: 'var(--theme-text-primary)',
                  opacity: 0.9,
                  fontSize: '0.92em',
                  lineHeight: 1.45,
                  letterSpacing: '0.015em',
                  maxWidth: '42em',
                  margin: '0 auto',
                }}
              >
                Porerekua, “ser solidario, compartir lo que se tiene”, surge en el marco de la Cátedra Nazaria Ignacia “Querida Amazonía” de la Universidad Católica Boliviana "San Pablo" como un proyecto que busca visibilizar y articular iniciativas sostenibles de empresas y fundaciones comprometidas con la conservación de la Amazonía boliviana y el desarrollo de sus comunidades, como expresión de un compromiso con la sostenibilidad.
              </p>
              <p
                style={{
                  color: 'var(--theme-text-secondary)',
                  opacity: 0.72,
                  fontSize: '0.92em',
                  lineHeight: 1.45,
                  letterSpacing: '0.015em',
                  maxWidth: '42em',
                  margin: '0.45em auto 0',
                }}
              >
                Intercambio de conocimientos, experiencias y capacidades para construir sostenibilidad amazónica.
              </p>
            </div>

            <div
              className="purpose-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '0.62em',
                marginBottom: '0.75em',
              }}
            >
              {PILLARS.map((pillar) => (
                <button
                  key={pillar.key}
                  onClick={() => setActive(pillar.key)}
                  className="purpose-btn"
                  aria-pressed={active === pillar.key}
                >
                  <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                    {pillar.icon}
                  </span>
                  <span>
                    {pillar.title}
                    <span
                      style={{
                        display: 'block',
                        marginTop: '0.35em',
                        fontSize: '0.74em',
                        fontWeight: 600,
                        lineHeight: 1.2,
                        opacity: 0.78,
                      }}
                    >
                      {pillar.subtitle}
                    </span>
                  </span>
                </button>
              ))}
            </div>

            <div
              className="purpose-actions-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                gap: '0.48em',
              }}
            >
              {PURPOSE_ACTIONS.map((item) => (
                <button
                  key={item.key}
                  className="purpose-btn purpose-action-btn"
                  onClick={() => setActive(item.key)}
                  aria-pressed={active === item.key}
                >
                  <span className="font-serif" style={{ fontWeight: 700, lineHeight: 1.15 }}>
                    {item.title}
                  </span>
                </button>
              ))}
            </div>

            {(activePillar || activePurpose) && (
              <div
                onClick={() => setActive(null)}
                style={{
                  position: 'fixed',
                  inset: 0,
                  backdropFilter: 'blur(3px)',
                  WebkitBackdropFilter: 'blur(3px)',
                  background: 'rgba(244,244,244,0.06)',
                  zIndex: 120,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 'max(1rem, 2vw)',
                  animation: 'purposeOverlayIn 0.22s ease forwards',
                }}
              >
                <div
                  key={active ?? 'panel'}
                  onClick={(event) => event.stopPropagation()}
                  style={{
                    width: '100%',
                    maxWidth: activePurpose ? '40em' : '36em',
                    maxHeight: 'min(78vh, 42rem)',
                    overflow: 'auto',
                    padding: '2.1em 2em',
                    borderRadius: '1em',
                    background: 'var(--theme-background-panel)',
                    border: '1px solid rgba(122,154,62,0.25)',
                    boxShadow: '0 10px 44px rgba(0,0,0,0.2)',
                    animation: 'purposeFadeIn 0.28s ease forwards',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '1em',
                      marginBottom: '0.9em',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5em' }}>
                      {activePillar && (
                        <span style={{ display: 'flex', alignItems: 'center', color: 'var(--theme-primary)' }}>
                          {activePillar.icon}
                        </span>
                      )}
                      <div>
                        <h3
                          className="font-serif font-bold"
                          style={{
                            color: 'var(--theme-primary)',
                            fontSize: '1.25em',
                            letterSpacing: '0.02em',
                            margin: 0,
                          }}
                        >
                          {activePurpose?.title ?? activePillar?.title}
                        </h3>
                        {activePillar && (
                          <p style={{ color: 'var(--theme-text-secondary)', fontSize: '0.9em', margin: '0.2em 0 0' }}>
                            {activePillar.subtitle}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      className="purpose-close-btn"
                      onClick={() => setActive(null)}
                      aria-label="Cerrar"
                    >
                      <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>

                  <p
                    style={{
                      color: 'var(--theme-text-primary)',
                      opacity: 0.9,
                      fontSize: '0.93em',
                      lineHeight: 1.75,
                      letterSpacing: '0.015em',
                      margin: 0,
                    }}
                  >
                    {activePurpose?.detail ?? activePillar?.detail}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
});

PurposeSection.displayName = 'PurposeSection';
export default PurposeSection;
