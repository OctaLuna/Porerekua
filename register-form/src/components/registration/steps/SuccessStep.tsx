import React from 'react';
import Button from '../../ui/Button';

interface SuccessStepProps {
  onClose: () => void;
  message?: string;
}

const SuccessStep: React.FC<SuccessStepProps> = ({ onClose, message }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 md:p-16 flex-grow animate-fade-in">
        <div className="w-20 h-20 bg-verde-brote/20 rounded-full flex items-center justify-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-verde-brote" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
        </div>
      <h2 className="text-3xl font-serif font-bold text-verde-brote mb-4">¡Registro Enviado!</h2>
      <p className="text-carbon-muted dark:text-gray-300 max-w-md mb-8">
        {message ?? 'Gracias por dar el primer paso para proteger la Amazonia. Nuestro equipo revisará su información y se pondrá en contacto con usted a la brevedad.'}
      </p>
      <Button onClick={onClose} variant="primary">Cerrar</Button>
    </div>
  );
};

export default SuccessStep;