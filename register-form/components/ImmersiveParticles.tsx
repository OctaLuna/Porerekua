import React, { useCallback, useMemo } from 'react';
import { Engine, IOptions } from '@tsparticles/engine';
import { loadBasic } from '@tsparticles/basic';
import Particles from '@tsparticles/react';

interface ImmersiveParticlesProps {
  theme: 'day' | 'night';
  isEnabled: boolean;
  intensity?: 'low' | 'medium' | 'high';
}

const ImmersiveParticles: React.FC<ImmersiveParticlesProps> = ({ 
  theme, 
  isEnabled, 
  intensity = 'medium' 
}) => {
  // Inicializar el engine de partículas
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadBasic(engine);
  }, []);

  // Configuración dinámica basada en el tema
  const particlesConfig: IOptions = useMemo(() => {
    const baseConfig = {
      background: {
        color: {
          value: "transparent",
        },
      },
      fpsLimit: 60,
      detectRetina: true,
      interactivity: {
        detectsOn: "canvas",
        events: {
          onHover: {
            enable: false,
          },
          resize: true,
        },
      },
    };

    // Configuración específica para cada tema
    if (theme === 'day') {
      // Partículas de polvo/polen diurno
      return {
        ...baseConfig,
        particles: {
          color: {
            value: ["#ffd700", "#ffed4e", "#fff8dc", "#f0e68c"],
          },
          move: {
            direction: "none",
            enable: true,
            outModes: {
              default: "out",
            },
            random: true,
            speed: intensity === 'low' ? 0.3 : intensity === 'medium' ? 0.5 : 0.8,
            straight: false,
            trail: {
              enable: false,
            },
          },
          number: {
            density: {
              enable: true,
              area: 2000,
            },
            value: intensity === 'low' ? 15 : intensity === 'medium' ? 25 : 40,
          },
          opacity: {
            value: { min: 0.1, max: 0.4 },
            animation: {
              enable: true,
              speed: 0.5,
              sync: false,
            },
          },
          shape: {
            type: "circle",
          },
          size: {
            value: { min: 1, max: 3 },
            animation: {
              enable: true,
              speed: 2,
              sync: false,
            },
          },
          wobble: {
            distance: 10,
            enable: true,
            speed: 1,
          },
        },
      };
    } else {
      // Luciérnagas nocturnas
      return {
        ...baseConfig,
        particles: {
          color: {
            value: ["#00ff88", "#66ffaa", "#88ffcc", "#aaffee"],
          },
          move: {
            direction: "none",
            enable: true,
            outModes: {
              default: "bounce",
            },
            random: true,
            speed: intensity === 'low' ? 0.2 : intensity === 'medium' ? 0.4 : 0.6,
            straight: false,
          },
          number: {
            density: {
              enable: true,
              area: 3000,
            },
            value: intensity === 'low' ? 8 : intensity === 'medium' ? 15 : 25,
          },
          opacity: {
            value: { min: 0.2, max: 0.8 },
            animation: {
              enable: true,
              speed: 1.5,
              sync: false,
            },
          },
          shape: {
            type: "circle",
          },
          size: {
            value: { min: 2, max: 5 },
            animation: {
              enable: true,
              speed: 3,
              sync: false,
            },
          },
          twinkle: {
            particles: {
              enable: true,
              frequency: 0.05,
              opacity: 1,
            },
          },
          wobble: {
            distance: 20,
            enable: true,
            speed: 0.5,
          },
        },
      };
    }
  }, [theme, intensity]);

  if (!isEnabled) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-[15]">
      <Particles
        id={`particles-${theme}`}
        init={particlesInit}
        options={particlesConfig}
        style={{
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};

export default ImmersiveParticles;