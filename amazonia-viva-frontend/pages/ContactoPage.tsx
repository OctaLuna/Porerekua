import React from 'react';
import { motion } from 'framer-motion';

const CONTACT_CHANNELS = [
  {
    label: 'WhatsApp',
    color: '#25D366',
    href: 'https://wa.me/?text=Hola%2C%20tengo%20un%20comentario%20sobre%20Porerekua',
    description: 'Escríbenos directamente para consultas o alianzas.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.118.549 4.107 1.512 5.837L.057 23.012a.75.75 0 0 0 .931.931l5.175-1.455A11.94 11.94 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.907 0-3.693-.513-5.228-1.407l-.374-.224-3.878 1.09 1.09-3.878-.224-.374A9.956 9.956 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
      </svg>
    ),
  },
  {
    label: 'Correo Electrónico',
    color: '#EA4335',
    href: 'mailto:contacto@porerekua.com?subject=Contacto%20Porerekua',
    description: 'contacto@porerekua.com',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.272H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L12 9.915l8.073-6.422C21.69 2.28 24 3.434 24 5.457z"/>
      </svg>
    ),
  },
  {
    label: 'Instagram',
    color: '#E1306C',
    href: 'https://instagram.com/porerekua',
    description: '@porerekua en Instagram',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
      </svg>
    ),
  },
  {
    label: 'Facebook',
    color: '#1877F2',
    href: 'https://facebook.com/porerekua',
    description: 'Porerekua en Facebook',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
      </svg>
    ),
  },
];

const ContactoPage: React.FC = () => {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amarillo-sol">Conecta con nosotros</p>
        <h1 className="mt-2 text-4xl sm:text-5xl font-extrabold font-serif text-carbon dark:text-beige-arena">
          Contacto
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-base sm:text-lg text-gris-piedra dark:text-beige-arena/80 leading-relaxed">
          Comparte tu experiencia y conecta con la comunidad Porerekua por el canal que prefieras.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
        {CONTACT_CHANNELS.map((item) => (
          <a
            key={item.label}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-5 rounded-2xl border border-carbon/10 dark:border-white/10 bg-white dark:bg-noche-selva/80 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
          >
            <div
              className="flex items-center justify-center h-12 w-12 rounded-xl text-white shrink-0"
              style={{ backgroundColor: item.color }}
            >
              {item.icon}
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-carbon dark:text-beige-arena">{item.label}</h3>
              <p className="text-xs text-gris-piedra dark:text-beige-arena/60">{item.description}</p>
            </div>
          </a>
        ))}
      </div>

      <div className="mt-12 text-center p-6 rounded-2xl border border-carbon/10 dark:border-white/10 bg-verde-brote/10">
        <p className="text-sm font-semibold text-verde-brote uppercase tracking-wider mb-1">
          Iniciativa Académica e Interinstitucional
        </p>
        <p className="text-xs text-gris-piedra dark:text-beige-arena/70">
          Cátedra Nazaria Ignacia «Querida Amazonía» · Universidad Católica Boliviana "San Pablo"
        </p>
      </div>
    </div>
  );
};

export default ContactoPage;