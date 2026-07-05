{/* FIX: Implemented the site-wide Footer component. */}
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-beige-arena dark:bg-noche-selva mt-12 border-t border-gray-200 dark:border-gray-800">
      <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center text-gris-piedra dark:text-gris-piedra">
        <p>&copy; {new Date().getFullYear()} Porerekua. Todos los derechos reservados.</p>
        <p className="text-sm mt-2">
          Ser solidario, compartir lo que se tiene
        </p>
      </div>
    </footer>
  );
};

export default Footer;