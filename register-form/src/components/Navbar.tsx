import React, { useState, useEffect } from 'react';
import { Expand, SunMoon } from 'lucide-react';
import type { Section } from '../types';
import useScrollSpy from '../hooks/useScrollSpy';
import { useSoundManager } from '../utils/SoundManager';
import Logo from './Logo';

interface NavbarProps {
  sections: Section[];
  isImmersiveMovementEnabled: boolean;
  toggleImmersiveMovement: () => void;
  isDarkTheme: boolean;
  toggleTheme: () => void;
}

const Navbar: React.FC<NavbarProps> = ({
  sections,
  isImmersiveMovementEnabled,
  toggleImmersiveMovement,
  isDarkTheme,
  toggleTheme,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { toggle: toggleAudio, isEnabled: audioEnabled, initialize, isInitialized } = useSoundManager();
  const activeSection = useScrollSpy(sections.map(s => s.ref));

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const navLinkBaseStyle = "px-3 py-2 text-sm font-medium transition-colors border-b-2";

  const getLinkStyle = (isActive: boolean) => {
    const style: React.CSSProperties = {
      transition: 'color 0.2s ease-in-out, border-color 0.2s ease-in-out',
      borderBottomWidth: '2px',
    };
    if (isActive) {
      style.color = 'var(--theme-primary)';
      style.borderColor = 'var(--theme-primary)';
    } else {
      style.color = isDarkTheme ? '#FFFFFF' : '#4B5563'; // Gris-700 en claro, Blanco en oscuro
      style.borderColor = 'transparent';
    }
    return style;
  };

  return (
    <>
      <header className="fixed top-16 inset-x-0 z-30 shadow-sm" style={{ backgroundColor: 'var(--theme-background)', boxSizing: 'border-box' }}>
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            <button
              onClick={() => sections[0] && scrollToSection(sections[0].ref)}
              className="flex items-center gap-3 group focus:outline-none"
              aria-label="Ir al inicio"
            >
              <Logo
                style={{ color: isDarkTheme ? '#7A9A3E' : '#585C45' }}
                className="h-10 w-auto shrink-0 transition-transform duration-200 group-hover:scale-105"
              />
              <h1
                className="text-2xl font-serif font-bold tracking-tight"
                style={{ color: 'var(--theme-text-primary)' }}
              >
                Porerekua
              </h1>
            </button>
            <div className="hidden md:flex items-center space-x-4">
              <nav className="flex space-x-1">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.ref)}
                    className={`${navLinkBaseStyle}`}
                    style={getLinkStyle(activeSection === section.id)}
                    onMouseEnter={(e) => {
                      if (activeSection !== section.id) {
                        e.currentTarget.style.color = 'var(--theme-secondary)';
                        e.currentTarget.style.borderColor = 'var(--theme-secondary)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (activeSection !== section.id) {
                        const originalStyle = getLinkStyle(false);
                        e.currentTarget.style.color = originalStyle.color || '';
                        e.currentTarget.style.borderColor = originalStyle.borderColor || '';
                      }
                    }}
                  >
                    {section.title}
                  </button>
                ))}
              </nav>
              {/* ── Icon controls ── */}
              <div className="flex items-center gap-2 ml-2">
                {/* Audio toggle */}
                <button
                  onClick={() => {
                    if (!isInitialized) initialize();
                    toggleAudio(!audioEnabled);
                  }}
                  aria-label={audioEnabled ? 'Silenciar audio ambiental' : 'Activar audio ambiental'}
                  title={audioEnabled ? 'Silenciar audio' : 'Activar audio'}
                  style={{
                    width: '2.25rem',
                    height: '2.25rem',
                    borderRadius: '50%',
                    border: 'none',
                    background: audioEnabled ? 'rgba(122,154,62,0.12)' : 'rgba(0,0,0,0.05)',
                    color: audioEnabled ? 'var(--color-verde-hoja)' : 'var(--color-gris-piedra)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'background 200ms ease, color 200ms ease, transform 150ms ease',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.12)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                >
                  {audioEnabled ? (
                    /* Speaker with waves */
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                    </svg>
                  ) : (
                    /* Speaker muted (X) */
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                      <line x1="23" y1="9" x2="17" y2="15" />
                      <line x1="17" y1="9" x2="23" y2="15" />
                    </svg>
                  )}
                </button>

                {/* Movement toggle */}
                <button
                  onClick={toggleImmersiveMovement}
                  aria-label={isImmersiveMovementEnabled ? 'Desactivar movimiento inmersivo' : 'Activar movimiento inmersivo'}
                  title={isImmersiveMovementEnabled ? 'Desactivar parallax' : 'Activar parallax'}
                  style={{
                    width: '2.25rem',
                    height: '2.25rem',
                    borderRadius: '50%',
                    border: 'none',
                    background: isImmersiveMovementEnabled ? 'rgba(122,154,62,0.12)' : 'rgba(0,0,0,0.05)',
                    color: isImmersiveMovementEnabled ? 'var(--color-verde-hoja)' : 'var(--color-gris-piedra)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'background 200ms ease, color 200ms ease, transform 150ms ease',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.12)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                >
                  <Expand size={18} strokeWidth={1.8} />
                </button>

                {/* Theme toggle */}
                <button
                  onClick={toggleTheme}
                  aria-label={isDarkTheme ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
                  title={isDarkTheme ? 'Tema claro' : 'Tema oscuro'}
                  style={{
                    width: '2.25rem',
                    height: '2.25rem',
                    borderRadius: '50%',
                    border: 'none',
                    background: isDarkTheme ? 'rgba(122,154,62,0.12)' : 'rgba(0,0,0,0.05)',
                    color: isDarkTheme ? 'var(--color-verde-hoja)' : 'var(--color-gris-piedra)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'background 200ms ease, color 200ms ease, transform 150ms ease',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.12)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                >
                  <SunMoon size={18} strokeWidth={1.8} />
                </button>
              </div>
            </div>
            <div className="md:hidden flex items-center">
              <button
                onClick={toggleMenu}
                className="ml-2 p-2 rounded-md hover:bg-gray-200 transition-colors"
                aria-controls="mobile-menu"
                aria-expanded={isMenuOpen}
              >
                <span className="sr-only">Open main menu</span>
                {isMenuOpen ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
                )}
              </button>
            </div>
          </div>
        </div>
        
            {isMenuOpen && (
          <div className="md:hidden" id="mobile-menu">
            <div className="pb-4">
              <div className="mt-2 rounded-xl shadow-lg" style={{ backgroundColor: 'var(--color-blanco-hueso)' }}>
                <div className="px-3 pt-2 pb-3 space-y-1">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.ref)}
                      className={`block w-full text-center text-base rounded-md ${navLinkBaseStyle}`}
                      style={getLinkStyle(activeSection === section.id)}
                    >
                      {section.title}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default Navbar;
