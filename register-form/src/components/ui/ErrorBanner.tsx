import React, { useState } from 'react';

interface Props {
  title?: string;
  message: string;
  technical?: string;
  onRetry?: () => void;
}

const ErrorBanner: React.FC<Props> = ({ title = 'Ha ocurrido un problema', message, technical, onRetry }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="mt-4 px-4 py-3 rounded-md border border-red-500 dark:border-red-600 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm" role="alert" aria-live="polite">
      <div className="flex items-start justify-between">
        <div>
          <div className="font-medium">{title}</div>
          <div className="mt-1">{message}</div>
        </div>

        <div className="flex flex-col items-end ml-4">
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="text-xs underline underline-offset-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
            >
              Reintentar
            </button>
          )}

          {technical && (
            <button
              type="button"
              onClick={() => setShowDetails(s => !s)}
              className="text-xs text-red-600 dark:text-red-400 mt-2 hover:text-red-700 dark:hover:text-red-300"
              aria-expanded={showDetails}
            >
              {showDetails ? 'Ocultar detalles' : 'Mostrar detalles técnicos'}
            </button>
          )}
        </div>
      </div>

      {showDetails && technical && (
        <pre className="mt-3 max-h-44 overflow-auto whitespace-pre-wrap bg-red-100/50 dark:bg-red-900/30 p-3 rounded text-xs text-red-700 dark:text-red-300 border border-red-300 dark:border-red-700">{technical}</pre>
      )}
    </div>
  );
};

export default ErrorBanner;
