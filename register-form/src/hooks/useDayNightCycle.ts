import { useState, useEffect, useCallback } from 'react';

export type TimeOfDay = 'dawn' | 'day' | 'dusk' | 'night';
export type Theme = 'day' | 'night';

interface TimeTheme {
  theme: Theme;
  timeOfDay: TimeOfDay;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  backgroundImage: string;
  intensity: 'low' | 'medium' | 'high';
}

const TIME_THEMES: Record<TimeOfDay, TimeTheme> = {
  dawn: {
    theme: 'day',
    timeOfDay: 'dawn',
    colors: {
      primary: '#ff7b7b',
      secondary: '#ffb347',
      accent: '#59D499',
      background: 'linear-gradient(135deg, #ff9a8b 0%, #ffd1a9 100%)',
      text: '#4A3F35',
    },
    backgroundImage: '/assets/background/bg21_dawn.jpg',
    intensity: 'low',
  },
  day: {
    theme: 'day',
    timeOfDay: 'day',
    colors: {
      primary: '#59D499',
      secondary: '#A0ACB2',
      accent: '#D95F43',
      background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      text: '#4A3F35',
    },
    backgroundImage: '/assets/background/bg21.jpg',
    intensity: 'medium',
  },
  dusk: {
    theme: 'night',
    timeOfDay: 'dusk',
    colors: {
      primary: '#9b59b6',
      secondary: '#e67e22',
      accent: '#f39c12',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      text: '#F5F1E9',
    },
    backgroundImage: '/assets/background/bg21_dusk.jpg',
    intensity: 'medium',
  },
  night: {
    theme: 'night',
    timeOfDay: 'night',
    colors: {
      primary: '#3498db',
      secondary: '#2c3e50',
      accent: '#1abc9c',
      background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
      text: '#F5F1E9',
    },
    backgroundImage: '/assets/background/bg21_night.jpg',
    intensity: 'high',
  },
};

export const useDayNightCycle = (updateInterval: number = 60000) => {
  const [currentTheme, setCurrentTheme] = useState<TimeTheme>(() => {
    // Intentar leer la preferencia guardada
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved === 'night') {
        return TIME_THEMES.night;
      } else if (saved === 'day') {
        return TIME_THEMES.day;
      }
    }
    return TIME_THEMES.day;
  });
  const [isTransitioning, setIsTransitioning] = useState(false);

  function getThemeByTime(): TimeTheme {
    const hour = new Date().getHours();
    
    if (hour >= 5 && hour < 7) return TIME_THEMES.dawn;
    if (hour >= 7 && hour < 18) return TIME_THEMES.day;
    if (hour >= 18 && hour < 20) return TIME_THEMES.dusk;
    return TIME_THEMES.night;
  }

  const applyThemeVariables = useCallback((theme: TimeTheme) => {
    const root = document.documentElement;
    const isNight = theme.theme === 'night';

    // Aplicar variables CSS
    root.style.setProperty('--theme-primary', isNight ? '#7A9A3E' : '#7A9A3E');
    root.style.setProperty('--theme-secondary', isNight ? '#F39C12' : '#007BFF');
    root.style.setProperty('--theme-accent', theme.colors.accent);
    root.style.setProperty('--theme-background', isNight ? '#312F2A' : '#F4F4F4');
    root.style.setProperty('--theme-text', theme.colors.text);
    root.style.setProperty('--theme-text-primary', isNight ? '#F4F4F4' : '#312F2A');
    root.style.setProperty('--theme-text-secondary', isNight ? '#D8C764' : '#78716C');
    root.style.setProperty('--theme-bg-image', `url(${theme.backgroundImage})`);

    // Aplicar clase de tema al body
    document.body.className = document.body.className
      .replace(/theme-(day|night|dawn|dusk)/, '')
      .trim();
    document.body.classList.add(`theme-${theme.timeOfDay}`);
  }, []);

  const updateTheme = useCallback(async () => {
    const newTheme = getThemeByTime();

    if (newTheme.timeOfDay !== currentTheme.timeOfDay) {
      setIsTransitioning(true);

      // Esperar un poco para que las animaciones CSS se inicien
      await new Promise(resolve => setTimeout(resolve, 100));

      setCurrentTheme(newTheme);
      const root = window.document.documentElement;
      if (newTheme.theme === 'night') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }


      // Aplicar variables CSS globales
      applyThemeVariables(newTheme);

      // Completar transición
      setTimeout(() => {
        setIsTransitioning(false);
      }, 2000); // Duración de la transición
    }
  }, [currentTheme, applyThemeVariables]);

  const setThemeMode = useCallback((mode: 'day' | 'night') => {
    const root = window.document.documentElement;
    if (mode === 'night') {
      root.classList.add('dark');
      const nightTheme = TIME_THEMES.night;
      setCurrentTheme(nightTheme);
    } else {
      root.classList.remove('dark');
      const dayTheme = TIME_THEMES.day;
      setCurrentTheme(dayTheme);
    }
    localStorage.setItem('theme', mode);
  }, []);

  // Efecto para actualizar automáticamente
  useEffect(() => {
    // Aplicar tema inicial e inicializar clase dark si es necesario
    applyThemeVariables(currentTheme);
    const root = window.document.documentElement;
    if (currentTheme.theme === 'night') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // Configurar intervalo de actualización
    if (updateInterval <= 0) return;

    const interval = setInterval(() => { void updateTheme(); }, updateInterval);
    
    return () => clearInterval(interval);
  }, [currentTheme, updateTheme, updateInterval, applyThemeVariables]);

  return {
    currentTheme,
    isTransitioning,
    setTheme: setThemeMode,
    updateTheme,
  };
};
