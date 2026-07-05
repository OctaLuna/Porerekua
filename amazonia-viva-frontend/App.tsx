import React, { useEffect, useRef } from 'react';
import { HashRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useLenis } from './hooks/useLenis';
import { gsap, ScrollTrigger } from './components/animations/gsap-setup';
import { prefersReducedMotion } from './components/animations/motion';

import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import GeoreferencingPage from './pages/GeoreferencingPage';
import DataPage from './pages/DataPage';
import DashboardPage from './pages/DashboardPage';
import InvestigacionesPage from './pages/InvestigacionesPage';
import PublicacionDetallePage from './pages/PublicacionDetallePage';
import NosotrosPage from './pages/NosotrosPage';
import RegistrationPage from './pages/RegistrationPage';
import MisPublicacionesPage from './pages/investigador/MisPublicacionesPage';
import PublicacionEditorPage from './pages/investigador/PublicacionEditorPage';
import AdminRoute from './components/admin/AdminRoute';
import AdminLayout from './components/admin/AdminLayout';
import SolicitudesPage from './pages/admin/SolicitudesPage';
import UsuariosPage from './pages/admin/UsuariosPage';
import LogsPage from './pages/admin/LogsPage';
import { useUI } from './hooks/useUI';
import LoginPanel from './components/features/auth/LoginPanel';
import RegistrationPanel from './components/features/auth/RegistrationPanel';
import DetailsPanel from './components/features/details/DetailsPanel';

const FULL_BLEED_PATHS = [
  '/',
  '/georeferencia',
  '/nosotros',
  '/dashboard',
  '/datos',
  '/investigaciones',
  '/registro',
];

const isFullBleed = (pathname: string) =>
  FULL_BLEED_PATHS.includes(pathname) || pathname.startsWith('/investigaciones/');

const AppContent: React.FC = () => {
  const location = useLocation();
  const { activePanel, isDetailPanelOpen } = useUI();
  const mainRef = useRef<HTMLElement>(null);

  useLenis();

  // Reset scroll and re-measure ScrollTrigger pins on SPA route changes.
  // Fade-in de entrada en cada cambio de ruta (solo opacity → no afecta el layout
  // ni la medición de los pins). Respeta prefers-reduced-motion.
  useEffect(() => {
    window.scrollTo(0, 0);
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    if (!prefersReducedMotion() && mainRef.current) {
      gsap.fromTo(mainRef.current, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'power1.out' });
    }
    return () => cancelAnimationFrame(id);
  }, [location.pathname]);

  const fullBleed = isFullBleed(location.pathname);
  const mainClasses = fullBleed
    ? 'flex-grow'
    : 'flex-grow container mx-auto px-4 sm:px-6 lg:px-8 pt-40 pb-8';

  return (
    <div className="flex flex-col min-h-screen bg-beige-arena dark:bg-noche-selva text-carbon dark:text-beige-arena/90 transition-colors duration-300">
      <Header />
      <main ref={mainRef} className={mainClasses}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/georeferencia" element={<GeoreferencingPage />} />
          <Route path="/datos" element={<DataPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/nosotros" element={<NosotrosPage />} />
          <Route path="/registro" element={<RegistrationPage />} />

          {/* Publicaciones */}
          <Route path="/investigaciones" element={<InvestigacionesPage />} />
          <Route path="/investigaciones/nueva" element={<PublicacionEditorPage />} />
          <Route path="/investigaciones/:id/editar" element={<PublicacionEditorPage />} />
          <Route path="/investigaciones/:slug" element={<PublicacionDetallePage />} />

          {/* Investigador */}
          <Route path="/mis-publicaciones" element={<MisPublicacionesPage />} />

          {/* Admin */}
          <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route index element={<Navigate to="solicitudes" replace />} />
            <Route path="solicitudes" element={<SolicitudesPage />} />
            <Route path="usuarios" element={<UsuariosPage />} />
            <Route path="logs" element={<LogsPage />} />
          </Route>
        </Routes>
      </main>
      {!fullBleed && <Footer />}
      <AnimatePresence>
        {activePanel === 'login' && <LoginPanel />}
        {activePanel === 'registration' && <RegistrationPanel />}
        {isDetailPanelOpen && <DetailsPanel />}
      </AnimatePresence>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
