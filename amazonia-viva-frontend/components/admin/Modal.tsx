import React, { useEffect } from 'react';

const Modal: React.FC<{ title: string; onClose: () => void; children: React.ReactNode }> = ({ title, onClose, children }) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-carbon/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="bg-fibra-natural dark:bg-carbon rounded-lg shadow-2xl w-full max-w-md relative p-6 text-carbon dark:text-beige-arena max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold font-serif mb-4">{title}</h3>
        {children}
      </div>
    </div>
  );
};

export default Modal;
