import React, { useState } from 'react';
import { useSoundManager } from '../utils/SoundManager';

const SimpleAccessibilityButton: React.FC = () => {
  const [showControls, setShowControls] = useState(false);
  const { toggle: toggleAudio, isEnabled: audioEnabled, initialize, isInitialized } = useSoundManager();

  // Log para debug
  console.log('🎛️ SimpleAccessibilityButton renderizando - audioEnabled:', audioEnabled, 'isInitialized:', isInitialized);

  return (
    <>
      {/* Botón flotante simple */}
      <button
        onClick={() => setShowControls(!showControls)}
        className="fixed bottom-6 right-6 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-lg z-50 transition-all duration-300 hover:bg-white"
        aria-label="Controles"
        style={{ pointerEvents: 'auto' }} // Asegurar que no interfiera con scroll
      >
        ⚙️
      </button>

      {/* Panel simple SIN afectar scroll */}
      {showControls && (
        <div className="fixed bottom-20 right-6 bg-white/95 backdrop-blur-md rounded-lg shadow-lg p-4 z-50" style={{ pointerEvents: 'auto' }}>
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium">Audio:</label>
            <button
              onClick={() => {
                console.log('🎯 Click en botón de audio - Estado antes:', audioEnabled);
                
                // Solo inicializar si no está inicializado (por si acaso)
                if (!isInitialized) {
                  console.log('🎵 Inicializando audio por click del usuario...');
                  initialize();
                }
                
                // Toggle del audio
                const newState = !audioEnabled;
                console.log('🔄 Cambiando audio de', audioEnabled, 'a', newState);
                toggleAudio(newState);
              }}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                audioEnabled ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-gray-300 hover:bg-gray-400'
              }`}
            >
              {audioEnabled ? 'ON' : 'OFF'}
            </button>
          </div>
          <div className="text-xs text-gray-600 mt-1">
            {!isInitialized 
              ? 'Inicializando audio...' 
              : `Ambiente de selva: ${audioEnabled ? 'Activado' : 'Silenciado'}`
            }
          </div>
          <button
            onClick={() => setShowControls(false)}
            className="mt-2 text-xs text-gray-500 hover:text-gray-700"
          >
            Cerrar
          </button>
        </div>
      )}
    </>
  );
};

export default SimpleAccessibilityButton;