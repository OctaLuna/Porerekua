import React from 'react';

const TestimoniosPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">Testimonios</h1>
      <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
        Voces de la Amazonía: escucha los mensajes de quienes lideran el cambio.
      </p>
      <div className="w-24 h-1 bg-emerald-500 rounded-full"></div>
      <p className="mt-6 text-gray-500 dark:text-gray-400 animate-pulse">
        Contenido próximamente...
      </p>
    </div>
  );
};

export default TestimoniosPage;