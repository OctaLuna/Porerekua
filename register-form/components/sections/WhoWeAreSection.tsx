import React, { forwardRef, useEffect, useRef, useState } from 'react';

type InfoPanelKey = 'quienes' | 'proposito';

const purposeItems = [
  'Conectar empresas, fundaciones, la academia y sociedad civil en torno a iniciativas sostenibles en la Amazonía, promoviendo una plataforma de colaboración multiactor.',
  'Promover acciones orientadas a la conservación de la biodiversidad y la protección de los ecosistemas amazónicos.',
  'Empoderar a las comunidades locales e indígenas en procesos que fortalezcan su desarrollo y reconozcan sus saberes y prácticas.',
  'Garantizar el acceso a información sobre estas iniciativas a través de datos verificados y estructurados, que aporten a la investigación y, en el mediano y largo plazo, a la formulación de políticas públicas basadas en evidencia.',
];

const panels = {
  quienes: {
    title: '¿Quiénes somos?',
    lead:
      'Porerekua, “ser solidario, compartir lo que se tiene”, surge en el marco de la Cátedra Nazaria Ignacia “Querida Amazonía” de la Universidad Católica Boliviana "San Pablo" como un proyecto que busca visibilizar y articular iniciativas sostenibles de empresas y fundaciones comprometidas con la conservación de la Amazonía boliviana y el desarrollo de sus comunidades, como expresión de un compromiso con la sostenibilidad.',
  },
  proposito: {
    title: 'Nuestro propósito',
    lead:
      'Visibilizar y articular iniciativas sostenibles promovidas por empresas y fundaciones locales en la Amazonía boliviana, como aporte al fortalecimiento de acciones de conservación y al bienestar de las comunidades que la habitan.',
  },
};

const teamCategories = [
  {
    color: 'var(--color-verde-hoja)',
    title: 'Dirección & Estrategia',
    members: [
      { name: 'Lucía Ramírez', role: 'Dirección creativa y visión estratégica' },
      { name: 'Jorge Peña', role: 'Estratega de impacto y relaciones institucionales' },
      { name: 'Mara Quispe', role: 'Coordinación comunitaria, Amazonas peruano' },
    ],
  },
  {
    color: 'var(--color-azul-cobalto)',
    title: 'Experiencia Digital',
    members: [
      { name: 'Camila Torres', role: 'Frontend inmersivo y accesibilidad' },
      { name: 'Santiago Meza', role: 'Ingeniería de sonido espacial' },
      { name: 'Ana del Valle', role: 'Diseño UX y sistemas de diseño' },
    ],
  },
  {
    color: 'var(--color-naranja-vibrante)',
    title: 'Contenido & Narrativa',
    members: [
      { name: 'Fernando Duarte', role: 'Antropólogo, etnobotánica amazónica' },
      { name: 'Xiomara Ríos', role: 'Guionista ambiental y storytelling' },
      { name: 'Carla Pinto', role: 'Coordinación editorial multilingüe' },
    ],
  },
];

function getInitials(name: string): string {
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const WhoWeAreSection = forwardRef<HTMLDivElement>((_, ref) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [activePanel, setActivePanel] = useState<InfoPanelKey | null>(null);
  const [openCategory, setOpenCategory] = useState<string | null>(teamCategories[0].title);
  const activeContent = activePanel ? panels[activePanel] : null;

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const fit = () => {
      el.style.fontSize = '';
      requestAnimationFrame(() => {
        if (!el || el.scrollHeight <= el.clientHeight) return;
        let size = parseFloat(getComputedStyle(el).fontSize);
        while (el.scrollHeight > el.clientHeight && size > 8) {
          size -= 0.5;
          el.style.fontSize = `${size}px`;
        }
      });
    };

    const ro = new ResizeObserver(fit);
    ro.observe(el);
    fit();
    return () => ro.disconnect();
  }, [openCategory]);

  return (
    <>
      <style>{`
        @keyframes whoPanelFadeIn {
          from { opacity: 0; transform: translateY(8px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes whoOverlayIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .who-info-btn {
          display: inline-flex;
          min-height: 2.55em;
          align-items: center;
          justify-content: center;
          border: 2px solid rgba(122,154,62,0.28);
          border-radius: 0.7em;
          background: var(--panel-card-bg);
          color: var(--theme-text-primary);
          cursor: pointer;
          font-family: inherit;
          padding: 0.35em 0.9em;
          text-align: center;
          transition: border-color 180ms ease, box-shadow 180ms ease, filter 180ms ease, transform 120ms ease;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }
        .who-info-btn:hover {
          border-color: rgba(244,196,48,0.78);
          box-shadow: 0 0 0 3px rgba(244,196,48,0.14), 0 0 16px rgba(244,196,48,0.36), 0 4px 14px rgba(49,47,42,0.1);
          filter: brightness(1.04);
          transform: translateY(-1px);
        }
        .who-info-btn__title {
          color: var(--theme-text-primary);
          font-size: 1em;
          font-weight: 700;
          line-height: 1.1;
        }
        .who-close-btn {
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
        .who-close-btn:hover {
          background: rgba(122,154,62,0.25);
        }
        .who-team-tab {
          flex: 1;
          min-height: 2.35em;
          padding: 0.35em 0.55em;
          border: none;
          border-radius: 0.6em;
          background: transparent;
          color: var(--theme-text-secondary);
          cursor: pointer;
          font-family: inherit;
          font-size: 0.78em;
          font-weight: 650;
          letter-spacing: 0.015em;
          transition: background 180ms ease, box-shadow 180ms ease, color 180ms ease;
        }
        .who-team-tab:hover {
          background: var(--panel-card-bg);
        }
        .who-team-tab--active {
          background: var(--panel-card-bg);
          box-shadow: 0 2px 10px rgba(0,0,0,0.08);
        }
        @media (max-width: 760px) {
          .who-actions-grid,
          .who-members-grid {
            grid-template-columns: 1fr !important;
          }
          .who-info-btn {
            min-height: 2.35em;
          }
        }
      `}</style>
      <section
        id="quienes-somos"
        ref={ref}
        className="relative snap-start"
        style={{
          height: '100vh',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          zIndex: 11,
          backgroundImage: "url('/assets/background/birds/bg41.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
          backgroundColor: 'var(--theme-background)',
          padding: 'calc(10rem + 4vh) max(4vw, 1rem) 6vh',
          pointerEvents: 'auto',
        }}
      >
        <div
          ref={contentRef}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            maxWidth: 'min(94vw, 60rem)',
            width: '100%',
            margin: '0 auto',
            gap: 'clamp(0.45rem, 1.2vh, 0.8rem)',
            fontSize: 'clamp(0.76rem, 1.45vh, 0.98rem)',
          }}
        >
          <div
            className="rounded-2xl shadow-lg"
            style={{
              flexShrink: 0,
              backgroundColor: 'var(--theme-background)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
              padding: '0.95em 1.35em',
              opacity: 0.92,
            }}
          >
            <div style={{ maxWidth: '48em', margin: '0 auto', textAlign: 'center' }}>
              <p
                style={{
                  fontSize: '0.7em',
                  textTransform: 'uppercase',
                  letterSpacing: '0.36em',
                  color: 'var(--color-verde-hoja)',
                  fontWeight: 700,
                  marginBottom: '0.45em',
                }}
              >
                ¿Quiénes somos?
              </p>
              <h2
                className="font-serif font-bold"
                style={{
                  color: 'var(--theme-text-primary)',
                  fontSize: '1.75em',
                  letterSpacing: '-0.01em',
                  marginBottom: '0.35em',
                  lineHeight: 1.15,
                }}
              >
                Porerekua, ser solidario, compartir lo que se tiene
              </h2>
              <p
                style={{
                  color: 'var(--theme-text-secondary)',
                  fontSize: '0.9em',
                  lineHeight: 1.5,
                  letterSpacing: '0.01em',
                  margin: 0,
                }}
              >
                Porerekua, voz guaraní que significa “ser solidario, compartir lo que se tiene”, alude a la construcción colectiva de la sostenibilidad amazónica mediante el intercambio de conocimientos, experiencias y capacidades entre los distintos actores comprometidos con el territorio.
              </p>
            </div>
          </div>

          <div
            className="rounded-2xl shadow-lg"
            style={{
              flexShrink: 0,
              backgroundColor: 'var(--theme-background)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
              padding: '0.7em 1em',
              opacity: 0.92,
            }}
          >
            <div
              className="who-actions-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                gap: '0.65em',
              }}
            >
              <button className="who-info-btn" onClick={() => setActivePanel('quienes')}>
                <span className="who-info-btn__title font-serif">¿Quiénes somos?</span>
              </button>

              <button className="who-info-btn" onClick={() => setActivePanel('proposito')}>
                <span className="who-info-btn__title font-serif">Nuestro propósito</span>
              </button>
            </div>
          </div>

          <div
            className="rounded-2xl shadow-lg"
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              backgroundColor: 'var(--theme-background)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
              padding: '0.9em 1.2em 1em',
              minHeight: 0,
              opacity: 0.92,
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '0.55em', flexShrink: 0 }}>
              <h3
                className="font-serif font-bold"
                style={{ color: 'var(--theme-text-primary)', fontSize: '1.28em', letterSpacing: '-0.005em', margin: 0 }}
              >
                Integrantes del equipo
              </h3>
            </div>

            <div style={{ maxWidth: '42em', margin: '0 auto', width: '100%', flexShrink: 0 }}>
              <div
                style={{
                  display: 'flex',
                  gap: '0.35em',
                  padding: '0.22em',
                  borderRadius: '0.8em',
                  backgroundColor: 'rgba(0,0,0,0.04)',
                  marginBottom: '0.7em',
                }}
              >
                {teamCategories.map((cat) => {
                  const isActive = openCategory === cat.title;
                  return (
                    <button
                      key={cat.title}
                      onClick={() => setOpenCategory(prev => (prev === cat.title ? null : cat.title))}
                      className={`who-team-tab${isActive ? ' who-team-tab--active' : ''}`}
                      style={{ color: isActive ? cat.color : 'var(--theme-text-secondary)' }}
                      aria-selected={isActive}
                    >
                      {cat.title}
                    </button>
                  );
                })}
              </div>
            </div>

            <div
              style={{
                flex: 1,
                overflow: 'hidden',
                maxWidth: '42em',
                margin: '0 auto',
                width: '100%',
              }}
            >
              {openCategory && (() => {
                const cat = teamCategories.find(c => c.title === openCategory)!;
                return (
                  <div
                    className="who-members-grid"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: 'clamp(0.45rem, 1.2vh, 0.8rem)',
                    }}
                  >
                    {cat.members.map((member) => (
                      <div
                        key={member.name}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          textAlign: 'center',
                          gap: '0.42em',
                          padding: '0.75em 0.65em',
                          borderRadius: '0.85em',
                          background: 'var(--panel-card-bg)',
                          boxShadow: '0 2px 14px rgba(0,0,0,0.06)',
                        }}
                      >
                        <div
                          style={{
                            width: '2.45em',
                            height: '2.45em',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            fontSize: '0.85em',
                            fontWeight: 700,
                            flexShrink: 0,
                            background: cat.color,
                          }}
                        >
                          {getInitials(member.name)}
                        </div>
                        <p style={{ fontSize: '0.8em', fontWeight: 650, color: 'var(--theme-text-primary)', margin: 0 }}>
                          {member.name}
                        </p>
                        <p style={{ fontSize: '0.7em', color: 'var(--theme-text-secondary)', lineHeight: 1.35, margin: 0 }}>
                          {member.role}
                        </p>
                      </div>
                    ))}
                  </div>
                );
              })()}

              {!openCategory && (
                <p
                  style={{
                    textAlign: 'center',
                    color: 'var(--theme-text-secondary)',
                    fontSize: '0.82em',
                    opacity: 0.72,
                    letterSpacing: '0.02em',
                    marginTop: '0.5em',
                  }}
                >
                  Selecciona un área para conocer al equipo
                </p>
              )}
            </div>
          </div>
        </div>

        {activeContent && (
          <div
            onClick={() => setActivePanel(null)}
            style={{
              position: 'fixed',
              inset: 0,
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              background: 'rgba(0, 0, 0, 0.3)',
              zIndex: 120,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 'max(1rem, 2vw)',
              animation: 'whoOverlayIn 0.22s ease forwards',
            }}
          >
            <div
              onClick={(event) => event.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: activePanel === 'proposito' ? '42em' : '38em',
                maxHeight: 'min(78vh, 42rem)',
                overflow: 'auto',
                padding: '2.1em 2em',
                borderRadius: '1em',
                background: 'var(--theme-background)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
                animation: 'whoPanelFadeIn 0.28s ease forwards',
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
                <h3
                  className="font-serif font-bold"
                  style={{
                    color: 'var(--theme-primary)',
                    fontSize: '1.35em',
                    letterSpacing: '0.02em',
                    margin: 0,
                  }}
                >
                  {activeContent.title}
                </h3>
                <button
                  className="who-close-btn"
                  onClick={() => setActivePanel(null)}
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
                  fontSize: '0.94em',
                  lineHeight: 1.72,
                  letterSpacing: '0.015em',
                  margin: activePanel === 'proposito' ? '0 0 0.85em' : 0,
                }}
              >
                {activeContent.lead}
              </p>

              {activePanel === 'proposito' && (
                <ul
                  style={{
                    color: 'var(--theme-text-primary)',
                    opacity: 0.88,
                    fontSize: '0.9em',
                    lineHeight: 1.58,
                    margin: 0,
                    paddingLeft: '1.2em',
                  }}
                >
                  {purposeItems.map((item) => (
                    <li key={item} style={{ marginBottom: '0.5em' }}>
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </section>
    </>
  );
});

WhoWeAreSection.displayName = 'WhoWeAreSection';
export default WhoWeAreSection;
