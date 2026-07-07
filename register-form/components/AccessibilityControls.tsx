import React, { useState, useEffect } from 'react';
import { useSoundManager } from '../utils/SoundManager';

interface AccessibilityControlsProps {
  onReducedMotionChange: (enabled: boolean) => void;
  onEffectsChange: (enabled: boolean) => void;
}

const AccessibilityControls: React.FC<AccessibilityControlsProps> = ({
  onReducedMotionChange,
  onEffectsChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [effectsEnabled, setEffectsEnabled] = useState(true);
  const [volume, setVolume] = useState(0.7);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  const { toggle: toggleAudio, setVolume: setAudioVolume, isEnabled: audioEnabled } = useSoundManager();

  // Detectar preferencia del sistema para reducir animaciones
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
      if (e.matches) {
        handleReducedMotionToggle(true);
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    
    // Si el usuario prefiere movimiento reducido, aplicarlo automáticamente
    if (mediaQuery.matches) {
      handleReducedMotionToggle(true);
    }
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Persistir configuraciones en localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('amazonia-accessibility-settings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        setReducedMotion(settings.reducedMotion || false);
        setEffectsEnabled(settings.effectsEnabled ?? true);
        setVolume(settings.volume ?? 0.7);
      } catch (error) {
        console.warn('Error loading accessibility settings:', error);
      }
    }
  }, []);

  const saveSettings = (settings: any) => {
    try {
      localStorage.setItem('amazonia-accessibility-settings', JSON.stringify(settings));
    } catch (error) {
      console.warn('Error saving accessibility settings:', error);
    }
  };

  const handleReducedMotionToggle = (enabled: boolean) => {
    setReducedMotion(enabled);
    onReducedMotionChange(enabled);
    
    const newSettings = { reducedMotion: enabled, effectsEnabled, volume };
    saveSettings(newSettings);
    
    // Aplicar clase CSS global
    if (enabled) {
      document.documentElement.classList.add('reduce-motion');
    } else {
      document.documentElement.classList.remove('reduce-motion');
    }
  };

  const handleEffectsToggle = (enabled: boolean) => {
    setEffectsEnabled(enabled);
    onEffectsChange(enabled);
    toggleAudio(enabled);
    
    const newSettings = { reducedMotion, effectsEnabled: enabled, volume };
    saveSettings(newSettings);
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    setAudioVolume(newVolume);
    
    const newSettings = { reducedMotion, effectsEnabled, volume: newVolume };
    saveSettings(newSettings);
  };

  return (
    <>
      {/* Botón flotante de accesibilidad (ultra minimalista) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Abrir controles de accesibilidad"
        aria-expanded={isOpen}
        title="Controles de accesibilidad"
        className="fixed bottom-6 right-6 w-10 h-10 rounded-full z-50 transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 floating-control-btn"
      >
        {/* Icono ultra simplificado: círculo con ondas */}
        <svg
          className="w-4 h-4"
          fill="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="2" />
          <circle cx="12" cy="12" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
          <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3" />
        </svg>
      </button>

      {/* Panel de controles */}
      <div
        className={`fixed bottom-24 right-6 w-80 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/30 z-50 transition-all duration-500 ease-out ${
          isOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95 pointer-events-none'
        }`}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-earth-brown-adaptive">Accesibilidad</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Cerrar controles"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-6">
            {/* Control de movimiento reducido */}
            <div className="flex items-center justify-between">
              <div className="flex-1 pr-4">
                <label htmlFor="reduced-motion" className="block text-sm font-medium text-earth-brown-adaptive mb-1">
                  Reducir animaciones
                </label>
                <p className="text-xs text-gray-600">
                  Minimiza movimientos y transiciones
                </p>
                {prefersReducedMotion && (
                  <p className="text-xs text-leaf-vibrant-adaptive mt-1">
                    ✓ Detectado desde configuración del sistema
                  </p>
                )}
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  id="reduced-motion"
                  type="checkbox"
                  checked={reducedMotion}
                  onChange={(e) => handleReducedMotionToggle(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-leaf-vibrant rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-leaf-vibrant"></div>
              </label>
            </div>

            {/* Control de efectos */}
            <div className="flex items-center justify-between">
              <div className="flex-1 pr-4">
                <label htmlFor="effects-enabled" className="block text-sm font-medium text-earth-brown-adaptive mb-1">
                  Efectos de sonido
                </label>
                <p className="text-xs text-gray-600">
                  Sonidos ambientales y partículas
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  id="effects-enabled"
                  type="checkbox"
                  checked={effectsEnabled}
                  onChange={(e) => handleEffectsToggle(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-leaf-vibrant rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-leaf-vibrant"></div>
              </label>
            </div>

            {/* Control de volumen */}
            {effectsEnabled && (
              <div>
                <label htmlFor="volume-slider" className="block text-sm font-medium text-earth-brown-adaptive mb-2">
                  Volumen: {Math.round(volume * 100)}%
                </label>
                <input
                  id="volume-slider"
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, #59D499 0%, #59D499 ${volume * 100}%, #e2e8f0 ${volume * 100}%, #e2e8f0 100%)`,
                  }}
                />
              </div>
            )}

            {/* Información adicional */}
            <div className="pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 leading-relaxed">
                Estos controles te permiten personalizar la experiencia según tus necesidades de accesibilidad.
                La configuración se guarda automáticamente.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Estilos CSS para el slider */}
      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 18px;
          width: 18px;
          border-radius: 50%;
          background: #59D499;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .slider::-moz-range-thumb {
          height: 18px;
          width: 18px;
          border-radius: 50%;
          background: #59D499;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
      `}</style>
    </>
  );
};

export default AccessibilityControls;