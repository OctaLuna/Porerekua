import React, { useEffect, useState } from 'react';
import { useNavigate, Routes, Route, useLocation } from 'react-router-dom';
import RegistrationModal from './RegistrationModal';
import OrganizationModal from './OrganizationModal';

type Phase = 'zoom' | 'cards';

const RegistrationGateway: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [phase, setPhase] = useState<Phase>('zoom');
  const [cardsVisible, setCardsVisible] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('cards'), 80); // Reducido de 500 a 150ms
    const t2 = setTimeout(() => setCardsVisible(true), 80); // Reducido de 540 a 200ms
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      // Solo cerrar el gateway si no estamos dentro de un modal
      if (e.key === 'Escape' && location.pathname === '/registro') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [location.pathname]);

  const handleClose = () => {
    setClosing(true);
    setCardsVisible(false);
    setTimeout(() => navigate('/'), 340);
  };

  const handleSelect = (type: 'empresa' | 'organizacion') => {
    navigate(`/registro/${type}`);
  };

  return (
    <>
      {/* â”€â”€ Keyframes â”€â”€ */}
      {/* ── Keyframes ── */}
      <style>{`
        @keyframes gatewayFadeOut {
          0%   { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes gatewayImageZoom {
          0%   { transform: scale(1.46) translateZ(0); opacity: 0; }
          100% { transform: scale(1) translateZ(0); opacity: 1; }
        }
      `}</style>

      {/* ── Contenedor raíz ── */}
      <div
        onClick={phase === 'cards' && location.pathname === '/registro' ? handleClose : undefined}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 200,
          overflow: 'hidden',
          backgroundColor: '#08140C' // Fondo sólido para ocultar cualquier elemento de la página anterior
        }}
      >
        {/* Imagen de fondo de la nueva sección */}
        <img
          src="/assets/background/bg1.png"
          alt="Background"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100vw',
            height: '100dvh',
            objectFit: 'cover',
            filter: 'blur(3px) brightness(0.56)', // Filtro estático para no matar el rendimiento
            transform: 'translateZ(0)', // Forza aceleración por hardware
            willChange: 'transform, opacity',
            animation: closing
              ? 'gatewayFadeOut 340ms ease-in forwards'
              : 'gatewayImageZoom 800ms cubic-bezier(0.2, 0.8, 0.2, 1) forwards',
          }}
        />

        {/* â”€â”€ Oscurecimiento progresivo encima del zoom â”€â”€ */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(6, 18, 6, 0.56)',
            opacity: phase === 'cards' && !closing ? 1 : 0,
            transition: 'opacity 450ms ease',
          }}
        />

        {/* â”€â”€ Cards â”€â”€ */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: phase === 'cards' ? 'auto' : 'none',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2rem',
              width: 'min(88vw, 52rem)',
              opacity: cardsVisible && !closing ? 1 : 0,
              transform: cardsVisible && !closing
                ? 'translateY(0) scale(1)'
                : 'translateY(2.5rem) scale(0.97)',
              transition: 'opacity 420ms cubic-bezier(0.22,1,0.36,1), transform 480ms cubic-bezier(0.22,1,0.36,1)',
            }}
          >
            {/* Encabezado */}
            <div style={{ textAlign: 'center' }}>
              <p style={{
                fontSize: '0.7rem', letterSpacing: '0.45em',
                textTransform: 'uppercase', fontWeight: 600,
                color: 'var(--color-amarillo-sol)', marginBottom: '0.5rem',
              }}>Únete a la red</p>
              <h2 style={{
                fontFamily: 'Lora, serif', fontSize: '2.25rem',
                fontWeight: 700, color: '#F4F4F4', lineHeight: 1.2,
              }}>¿Cómo quieres participar?</h2>
              <p style={{ marginTop: '0.6rem', fontSize: '0.9rem', color: 'rgba(244,244,244,0.62)' }}>
                Selecciona tu perfil para comenzar el registro
              </p>
            </div>

            {/* Tarjetas */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', width: '100%' }}>

              {/* OrganizaciÃ³n */}
              <button
                onClick={(e) => { e.stopPropagation(); handleSelect('organizacion'); }}
                style={{
                  backgroundImage: "linear-gradient(rgba(8,24,16,0.58), rgba(8,24,16,0.58)), url('/assets/ui/organization.jpg')",
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  border: '1px solid rgba(0,123,255,0.50)',
                  borderRadius: '1.25rem', padding: '2rem 1.5rem',
                  cursor: 'pointer', textAlign: 'left',
                  transition: 'border-color 220ms ease, transform 220ms ease, filter 220ms ease, box-shadow 220ms ease',
                  color: '#F4F4F4',
                  backdropFilter: 'blur(2px)', WebkitBackdropFilter: 'blur(2px)',
                  boxShadow: '0 10px 24px rgba(0,0,0,0.25)',
                }}
                onMouseEnter={e => { const b = e.currentTarget; b.style.borderColor = 'rgba(0,123,255,0.85)'; b.style.transform = 'translateY(-4px)'; b.style.filter = 'brightness(1.08)'; b.style.boxShadow = '0 14px 30px rgba(0,0,0,0.35)'; }}
                onMouseLeave={e => { const b = e.currentTarget; b.style.borderColor = 'rgba(0,123,255,0.50)'; b.style.transform = 'translateY(0)'; b.style.filter = 'brightness(1)'; b.style.boxShadow = '0 10px 24px rgba(0,0,0,0.25)'; }}
              >
                <div style={{ width: '3rem', height: '3rem', borderRadius: '50%', background: 'rgba(0,123,255,0.24)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <img
                    src="/assets/icons/organization.svg"
                    alt=""
                    aria-hidden="true"
                    style={{ width: '1.5rem', height: '1.5rem', objectFit: 'contain' }}
                  />
                </div>
                <h3 style={{ fontFamily: 'Lora, serif', fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: 'rgba(100,190,255,0.95)' }}>Soy una Organización</h3>
                <p style={{ fontSize: '0.82rem', color: 'rgba(244,244,244,0.65)', lineHeight: 1.55 }}>
                  ONGs, comunidades, grupos de investigación y entidades sin fines de lucro que trabajan en el bosque.
                </p>
              </button>

              {/* Empresa */}
              <button
                onClick={(e) => { e.stopPropagation(); handleSelect('empresa'); }}
                style={{
                  backgroundImage: "linear-gradient(rgba(24,16,8,0.56), rgba(24,16,8,0.56)), url('/assets/ui/enterprise.jpg')",
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  border: '1px solid rgba(243,156,18,0.50)',
                  borderRadius: '1.25rem', padding: '2rem 1.5rem',
                  cursor: 'pointer', textAlign: 'left',
                  transition: 'border-color 220ms ease, transform 220ms ease, filter 220ms ease, box-shadow 220ms ease',
                  color: '#F4F4F4',
                  backdropFilter: 'blur(2px)', WebkitBackdropFilter: 'blur(2px)',
                  boxShadow: '0 10px 24px rgba(0,0,0,0.25)',
                }}
                onMouseEnter={e => { const b = e.currentTarget; b.style.borderColor = 'rgba(243,156,18,0.85)'; b.style.transform = 'translateY(-4px)'; b.style.filter = 'brightness(1.08)'; b.style.boxShadow = '0 14px 30px rgba(0,0,0,0.35)'; }}
                onMouseLeave={e => { const b = e.currentTarget; b.style.borderColor = 'rgba(243,156,18,0.50)'; b.style.transform = 'translateY(0)'; b.style.filter = 'brightness(1)'; b.style.boxShadow = '0 10px 24px rgba(0,0,0,0.25)'; }}
              >
                <div style={{ width: '3rem', height: '3rem', borderRadius: '50%', background: 'rgba(243,156,18,0.24)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <img
                    src="/assets/icons/enterprise.svg"
                    alt=""
                    aria-hidden="true"
                    style={{ width: '1.5rem', height: '1.5rem', objectFit: 'contain' }}
                  />
                </div>
                <h3 style={{ fontFamily: 'Lora, serif', fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: 'rgba(243,180,80,0.95)' }}>Soy una Empresa</h3>
                <p style={{ fontSize: '0.82rem', color: 'rgba(244,244,244,0.65)', lineHeight: 1.55 }}>
                  Empresas y corporaciones que quieren registrar sus acciones e impacto en el territorio amazÃ³nico.
                </p>
              </button>
            </div>

            {/* Cerrar */}
            <button
              onClick={(e) => { e.stopPropagation(); handleClose(); }}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'rgba(244,244,244,0.38)', fontSize: '0.78rem',
                letterSpacing: '0.1em', transition: 'color 200ms ease',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(244,244,244,0.78)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(244,244,244,0.38)'; }}
            >
              ESC {'\u00B7'} Volver al Inicio
            </button>
          </div>
        </div>

        {/* Modales cargados por ruta */}
        <Routes>
          <Route path="empresa" element={<RegistrationModal onClose={() => navigate('/registro')} />} />
          <Route path="organizacion" element={<OrganizationModal onClose={() => navigate('/registro')} />} />
        </Routes>
      </div>
    </>
  );
};

export default RegistrationGateway;
