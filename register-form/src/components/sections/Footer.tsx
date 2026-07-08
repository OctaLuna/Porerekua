import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer style={{ backgroundColor: 'var(--theme-background)' }}>
      <div className="container mx-auto px-6 py-4 text-center" style={{ color: 'var(--theme-text-primary)', opacity: 0.8 }}>
        <p className="text-sm">&copy; {new Date().getFullYear()} Porerekua. Todos los derechos reservados.</p>
        <p className="mt-1 text-xs">ser solidario, compartir lo que se tiene.</p>
      </div>
    </footer>
  );
};

export default Footer;