import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { NAV_LINKS } from '../../constants';
import { useTheme } from '../../hooks/useTheme';
import { useUI } from '../../hooks/useUI';
import { useAuth } from '../../hooks/useAuth';
import { RoleEnum } from '../../types/api';
import Logo from './Logo';
import FlowLine from '../animations/FlowLine';

// Placeholder icons to avoid dependency issues
const SunIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>;
const MoonIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>;
const MenuIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>;
const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const LoginIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
const LogOutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>;

const ThemeToggleButton = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full text-carbon dark:text-beige-arena hover:bg-verde-brote/20 transition-colors"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? <MoonIcon /> : <SunIcon />}
    </button>
  );
};

const AuthControls = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { openLoginPanel } = useUI();

  if (isAuthenticated && user) {
    return (
      <div className="flex items-center gap-1">
        <span
          className="hidden lg:inline text-sm font-medium text-carbon dark:text-beige-arena max-w-[140px] truncate"
          title={user.email}
        >
          {user.nombre}
        </span>
        <button
          onClick={logout}
          className="p-2 rounded-full text-carbon dark:text-beige-arena hover:bg-verde-brote/20 transition-colors"
          aria-label="Cerrar sesión"
          title="Cerrar sesión"
        >
          <LogOutIcon />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={openLoginPanel}
      className="p-2 rounded-full text-carbon dark:text-beige-arena hover:bg-verde-brote/20 transition-colors"
      aria-label="Login"
    >
      <LoginIcon />
    </button>
  );
};

// Ítem de nav en pill; el activo lleva el subrayado del motivo "flujo".
const navItemBase = 'relative rounded-full px-4 py-1.5 text-sm font-medium transition-colors';
const navItemActive = 'text-verde-brote';
const navItemInactive = 'text-gris-piedra hover:text-carbon dark:text-beige-arena/70 dark:hover:text-beige-arena';

const NavItem: React.FC<{ to: string; label: string; onClick?: () => void; block?: boolean }> = ({ to, label, onClick, block }) => (
  <NavLink to={to} onClick={onClick} className={({ isActive }) => `${block ? 'block text-center ' : ''}${navItemBase} ${isActive ? navItemActive : navItemInactive}`}>
    {({ isActive }) => (
      <>
        {label}
        {isActive && <FlowLine className="absolute -bottom-0.5 left-3 right-3 h-2 text-verde-brote" active />}
      </>
    )}
  </NavLink>
);

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const isAdmin = isAuthenticated && !!user && (user.rol === RoleEnum.Superadmin || user.rol === RoleEnum.Admin);

  // Barra frosted que se solidifica al hacer scroll (transparente/tenue → chrome).
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-12 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-nav-chrome/95 dark:bg-noche-selva/90 backdrop-blur-lg shadow-md'
          : 'bg-nav-chrome/55 dark:bg-noche-selva/45 backdrop-blur-md shadow-none'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <Link
              to="/"
              aria-label="Porerekua — Inicio"
              className="group flex items-center gap-4 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-verde-brote focus-visible:ring-offset-2 focus-visible:ring-offset-stone-200 dark:focus-visible:ring-offset-noche-selva"
            >
              <Logo
                aria-hidden="true"
                className="h-10 w-auto text-verde-hoja-seca dark:text-verde-brote transition-transform duration-300 ease-out group-hover:scale-105 group-hover:-rotate-1"
              />
              <span className="text-2xl font-bold font-serif text-carbon dark:text-beige-arena transition-colors group-hover:text-verde-brote dark:group-hover:text-verde-brote">
                Porerekua
              </span>
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-3">
            <nav className="flex items-center gap-1 rounded-full border border-carbon/10 dark:border-white/10 bg-blanco-puro/40 dark:bg-noche-selva/40 px-1.5 py-1 backdrop-blur-sm">
              {NAV_LINKS.map((link) => (
                <NavItem key={link.name} to={link.href.replace('#', '')} label={link.name} />
              ))}
              {isAdmin && <NavItem to="/admin" label="Admin" />}
            </nav>
            <ThemeToggleButton />
            <AuthControls />
          </div>
          <div className="md:hidden flex items-center">
            <ThemeToggleButton />
            <AuthControls />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="ml-2 p-2 rounded-md text-carbon dark:text-beige-arena hover:bg-verde-brote/20 transition-colors"
              aria-controls="mobile-menu"
              aria-expanded={isMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? <XIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
        
        {isMenuOpen && (
          <div className="md:hidden" id="mobile-menu">
              <div className="pb-4">
                <div className="mt-2 bg-nav-chrome/95 dark:bg-noche-selva/95 backdrop-blur-lg rounded-2xl shadow-lg border border-carbon/10 dark:border-white/10">
                    <div className="px-3 pt-3 pb-3 space-y-1">
                        {NAV_LINKS.map((link) => (
                            <NavItem key={link.name} to={link.href.replace('#', '')} label={link.name} onClick={() => setIsMenuOpen(false)} block />
                        ))}
                        {isAdmin && <NavItem to="/admin" label="Admin" onClick={() => setIsMenuOpen(false)} block />}
                    </div>
                </div>
              </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;