import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-beige-arena dark:bg-noche-selva mt-12 border-t border-carbon/10 dark:border-white/10">
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 text-center text-gris-piedra dark:text-beige-arena/70">
        <p className="font-serif font-bold text-carbon dark:text-beige-arena text-base tracking-wide">
          Porerekua
        </p>
        <p className="text-sm mt-1 text-verde-brote font-medium">
          «Ser solidario, compartir lo que se tiene»
        </p>
        <p className="text-xs mt-3 text-gris-piedra dark:text-beige-arena/60 max-w-xl mx-auto leading-relaxed">
          Cátedra Nazaria Ignacia «Querida Amazonía» · Universidad Católica Boliviana "San Pablo"
        </p>
        <p className="text-xs mt-4 text-gris-piedra/60 dark:text-beige-arena/40">
          &copy; {new Date().getFullYear()} Porerekua. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
};

export default Footer;