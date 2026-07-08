import React, { forwardRef, useRef, useEffect, useState } from 'react';

// ─── Types ─────────────────────────────────────────────────────────────────
interface HowItWorksSectionProps {
  onRegister: () => void;
}

// ─── Contact options panel ──────────────────────────────────────────────────
const CONTACT_OPTIONS = [
  {
    label: 'WhatsApp',
    color: '#25D366',
    href: 'https://wa.me/?text=Hola%2C%20tengo%20un%20comentario%20sobre%20Porerekua',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.118.549 4.107 1.512 5.837L.057 23.012a.75.75 0 0 0 .931.931l5.175-1.455A11.94 11.94 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.907 0-3.693-.513-5.228-1.407l-.374-.224-3.878 1.09 1.09-3.878-.224-.374A9.956 9.956 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
      </svg>
    ),
  },
  {
    label: 'Gmail',
    color: '#EA4335',
    href: 'mailto:contacto@porerekua.com?subject=Comentario%20sobre%20Porerekua',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.272H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L12 9.915l8.073-6.422C21.69 2.28 24 3.434 24 5.457z"/>
      </svg>
    ),
  },
  {
    label: 'Instagram',
    color: '#E1306C',
    href: 'https://instagram.com/porerekua',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
      </svg>
    ),
  },
  {
    label: 'Facebook',
    color: '#1877F2',
    href: 'https://facebook.com/porerekua',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
      </svg>
    ),
  },
  {
    label: 'Teléfono',
    color: '#312F2A',
    href: 'tel:+00000000000',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.18 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
      </svg>
    ),
  },
];

// ─── Comment panel ──────────────────────────────────────────────────────────
const CommentPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [msg, setMsg] = useState('');

  return (
    <div
      onClick={onClose}
      style={{
        position: 'absolute',
        inset: 0,
        borderRadius: 'inherit',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        background: 'rgba(0, 0, 0, 0.4)',
        zIndex: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.4em',
        animation: 'hiw-fade 0.22s ease forwards',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '28em',
          background: 'var(--theme-background)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderRadius: '1em',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '1.4em 1.5em',
          animation: 'hiw-slide 0.28s ease forwards',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8em' }}>
          <h4 className="font-serif font-bold" style={{ fontSize: '1.1em', color: 'var(--theme-primary)', margin: 0 }}>
            Deja tu comentario
          </h4>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-gris-piedra)', lineHeight: 1 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <textarea
          value={msg}
          onChange={e => setMsg(e.target.value)}
          placeholder="Escribí tu mensaje..."
          style={{
            width: '100%',
            resize: 'none',
            height: '5.5em',
            borderRadius: '0.6em',
            border: '1px solid rgba(0,0,0,0.12)',
            padding: '0.6em 0.75em',
            fontSize: '0.85em',
            fontFamily: 'inherit',
            color: 'var(--theme-text-primary)',
            outline: 'none',
            boxSizing: 'border-box',
            marginBottom: '0.85em',
          }}
        />
        <p style={{ fontSize: '0.72em', color: 'var(--color-gris-piedra)', marginBottom: '0.65em', letterSpacing: '0.02em' }}>
          Enviá tu mensaje por:
        </p>
        <div style={{ display: 'flex', gap: '0.55em', flexWrap: 'wrap' }}>
          {CONTACT_OPTIONS.map(opt => (
            <a
              key={opt.label}
              href={opt.href}
              target="_blank"
              rel="noopener noreferrer"
              title={opt.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '2.6em',
                height: '2.6em',
                borderRadius: '50%',
                background: `${opt.color}18`,
                color: opt.color,
                textDecoration: 'none',
                transition: 'transform 150ms ease, background 150ms ease',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.transform = 'scale(1.15)';
                (e.currentTarget as HTMLElement).style.background = `${opt.color}30`;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
                (e.currentTarget as HTMLElement).style.background = `${opt.color}18`;
              }}
            >
              {opt.icon}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Step component ─────────────────────────────────────────────────────────
interface StepProps {
  number: string;
  title: string;
  children: React.ReactNode;
  isActive: boolean;
  isDone: boolean;
  onTitleClick?: () => void;
  isLast?: boolean;
}

const Step: React.FC<StepProps> = ({ number, title, children, isActive, isDone, onTitleClick, isLast }) => (
  <div className="flex" style={{ marginBottom: isLast ? 0 : '0.9em', opacity: isActive || isDone ? 1 : 0.38, transition: 'opacity 0.4s ease' }}>
    <div className="flex flex-col items-center" style={{ marginRight: '1.1em' }}>
      <div
        className="rounded-full flex items-center justify-center font-bold shrink-0"
        style={{
          backgroundColor: isDone
            ? 'var(--theme-primary)'
            : isActive
              ? 'rgba(122,154,62,0.2)'
              : 'rgba(122,154,62,0.08)',
          color: isDone ? '#fff' : 'var(--theme-primary)',
          fontSize: '0.85em',
          width: '2.5em',
          height: '2.5em',
          marginBottom: '0.5em',
          letterSpacing: '0.02em',
          transition: 'background 0.4s ease, color 0.4s ease',
          boxShadow: isActive ? '0 0 0 3px rgba(122,154,62,0.25)' : 'none',
        }}
      >
        {isDone ? (
          <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        ) : number}
      </div>
      {!isLast && <div className="w-px flex-1" style={{ backgroundColor: isDone ? 'var(--theme-primary)' : 'rgba(122,154,62,0.2)', transition: 'background 0.4s ease' }} />}
    </div>
    <div style={{ paddingBottom: isLast ? 0 : '0.5em' }}>
      <h3
        className="font-bold"
        onClick={onTitleClick}
        style={{
          color: isActive ? 'var(--theme-primary)' : isDone ? 'var(--color-verde-hoja)' : 'var(--theme-text-secondary)',
          fontSize: '1.15em',
          marginBottom: '0.3em',
          letterSpacing: '0.025em',
          cursor: onTitleClick ? 'pointer' : 'default',
          textDecoration: onTitleClick && isActive ? 'underline dotted' : 'none',
          textUnderlineOffset: '3px',
          transition: 'color 0.3s ease',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.35em',
        }}
      >
        {title}
        {isActive && onTitleClick && (
          <svg width="0.7em" height="0.7em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        )}
      </h3>
      <div style={{ color: 'var(--theme-text-primary)', opacity: 0.85, fontSize: '0.88em', lineHeight: 1.6, letterSpacing: '0.015em' }}>{children}</div>
    </div>
  </div>
);

// ─── Main section ────────────────────────────────────────────────────────────
const HowItWorksSection = forwardRef<HTMLDivElement, HowItWorksSectionProps>(({ onRegister }, ref) => {
  const panelRef = useRef<HTMLDivElement>(null);
  // activeStep: 0=form, 1=web, 2=comments
  const [activeStep, setActiveStep] = useState(0);
  const [doneSteps, setDoneSteps] = useState<Set<number>>(new Set());
  const [showComments, setShowComments] = useState(false);

  // Blink pulse controlled via CSS keyframe — no JS interval needed
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const fit = () => {
      panel.style.fontSize = '';
      requestAnimationFrame(() => {
        if (!panel || panel.scrollHeight <= panel.clientHeight) return;
        let size = parseFloat(getComputedStyle(panel).fontSize);
        while (panel.scrollHeight > panel.clientHeight && size > 9) {
          size -= 0.5;
          panel.style.fontSize = `${size}px`;
        }
      });
    };
    const ro = new ResizeObserver(fit);
    ro.observe(panel);
    fit();
    return () => ro.disconnect();
  }, [activeStep, showComments]);

  const handleFormClick = () => {
    onRegister();
    // Mark step 0 done and advance to step 1
    setDoneSteps(prev => new Set([...prev, 0]));
    setActiveStep(1);
  };

  const handleWebClick = () => {
    window.open('https://example.com', '_blank', 'noopener,noreferrer');
    setDoneSteps(prev => new Set([...prev, 1]));
    setActiveStep(2);
  };

  const handleCommentsClick = () => {
    setShowComments(true);
  };

  return (
    <>
      <style>{`
        @keyframes hiw-pulse {
          0%, 100% { box-shadow: 0 0 0 3px rgba(122,154,62,0.25); }
          50%       { box-shadow: 0 0 0 6px rgba(122,154,62,0.12); }
        }
        @keyframes hiw-fade {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes hiw-slide {
          from { opacity: 0; transform: translateY(10px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .hiw-active-bubble {
          animation: hiw-pulse 2s ease-in-out infinite;
        }
      `}</style>
      <section
        ref={ref}
        id="how-it-works"
        className="relative snap-start z-10"
        style={{
          height: '100dvh',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          backgroundImage: "url('/assets/background/bg31.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
          backgroundColor: 'var(--theme-background)',
          padding: 'calc(14rem + 4vh) max(4vw, 1rem) 4vh',
        }}
      >
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'clip',
            maxWidth: 'min(90vw, 36rem)',
            width: '100%',
            margin: '0 auto',
            transform: 'translateY(-1.2rem)',
          }}
        >
          <div
            ref={panelRef}
            className="rounded-lg shadow-lg"
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: 'var(--theme-background)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
              fontSize: 'clamp(0.82rem, 1.75vh, 1.05rem)',
              padding: '1.8em 1.6em',
              overflow: 'clip',
              position: 'relative',
              opacity: 0.92,
            }}
          >
            <div className="text-center" style={{ marginBottom: '1em', flexShrink: 0 }}>
              <h2
                className="font-serif font-bold"
                style={{ color: 'var(--theme-text-primary)', fontSize: '2.1em', letterSpacing: '-0.01em' }}
              >
                Cómo Funciona
              </h2>
              <p style={{ fontSize: '0.82em', color: 'var(--color-gris-piedra)', marginTop: '0.3em', letterSpacing: '0.01em' }}>
                Seguí los pasos — hacé clic en cada título para continuar
              </p>
            </div>

            <div style={{ flex: 1 }}>
              <Step
                number="1"
                title="Completá el formulario"
                isActive={activeStep === 0}
                isDone={doneSteps.has(0)}
                onTitleClick={handleFormClick}
              >
                <p>Contanos sobre tu empresa, tus motivaciones y las áreas en las que querés generar impacto.</p>
              </Step>
              <Step
                number="2"
                title="Visualizá tus datos en la web"
                isActive={activeStep === 1}
                isDone={doneSteps.has(1)}
                onTitleClick={handleWebClick}
              >
                <p>Tu perfil y compromisos quedan visibles en nuestra plataforma pública.</p>
              </Step>
              <Step
                number="3"
                title="Dejá tus comentarios"
                isActive={activeStep === 2}
                isDone={doneSteps.has(2)}
                onTitleClick={handleCommentsClick}
                isLast
              >
                <p>Compartí tu experiencia y conectá con la comunidad Porerekua por el canal que prefieras.</p>
              </Step>
            </div>

            {/* Comment panel overlay */}
            {showComments && <CommentPanel onClose={() => { setShowComments(false); setDoneSteps(prev => new Set([...prev, 2])); }} />}
          </div>
        </div>
      </section>
    </>
  );
});

HowItWorksSection.displayName = 'HowItWorksSection';
export default HowItWorksSection;

