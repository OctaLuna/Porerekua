import { Howl, Howler } from 'howler';
import { audioTestGenerator } from './AudioTestGenerator';
import { useEffect, useReducer } from 'react';

interface SoundConfig {
  src: string[];
  volume: number;
  loop?: boolean;
  html5?: boolean;
  /** Para sonidos no-loop: rango en ms para auto-repeticiÃ³n [min, max] */
  repeatInterval?: [number, number];
}

class SoundManager {
  private isInitialized: boolean = false;
  private isEnabled: boolean = true;
  private currentTheme: 'day' | 'night' = 'day';
  private sounds: Map<string, Howl> = new Map();
  private repeatTimers: Map<string, ReturnType<typeof setTimeout>> = new Map();
  private listeners: Set<() => void> = new Set();

  // Solo sonidos que existen en /assets/sounds/
  private soundConfigs: Record<string, SoundConfig> = {
    // â”€â”€â”€ AMBIENTE (loop continuo) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    dayAmbient: {
      src: ['/assets/sounds/amazon_day_ambient.mp3'],
      volume: 0.35,
      loop: true,
      html5: true,
    },
    nightAmbient: {
      src: ['/assets/sounds/amazon_night_ambient.mp3'],
      volume: 0.38,
      loop: true,
      html5: true,
    },
    // â”€â”€â”€ CAPA AMBIENTE ADICIONAL (loop continuo) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    leafRustle: {
      src: ['/assets/sounds/leaf_rustle.mp3'],
      volume: 0.28,
      loop: true,
      html5: true,
    },
    // â”€â”€â”€ SONIDOS ANIMALES (se repiten periÃ³dicamente) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    monkeyChatter: {
      src: ['/assets/sounds/monkey_chatter.mp3'],
      volume: 0.30,
      repeatInterval: [18000, 35000],
    },
    birdFlutter: {
      src: ['/assets/sounds/bird_flutter.mp3'],
      volume: 0.42,
      repeatInterval: [12000, 25000],
    },
    // â”€â”€â”€ SONIDOS ENTORNO (se repiten periÃ³dicamente) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    waterDrop: {
      src: ['/assets/sounds/water_drop.mp3'],
      volume: 0.50,
      repeatInterval: [8000, 20000],
    },
  };

  constructor() {
    this.createHowls();
  }

  // â”€â”€ Listeners â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  private notifyListeners(): void {
    this.listeners.forEach(l => { try { l(); } catch { /* */ } });
  }

  public addListener(listener: () => void): void { this.listeners.add(listener); }
  public removeListener(listener: () => void): void { this.listeners.delete(listener); }

  // â”€â”€ CreaciÃ³n de Howls â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  private createHowls(): void {
    Object.entries(this.soundConfigs).forEach(([key, config]) => {
      const { repeatInterval: _repeatInterval, ...howlConfig } = config;
      const sound = new Howl({
        ...howlConfig,
        onloaderror: (_id, err) => console.warn(`No se pudo cargar ${key}:`, err),
        onplayerror: (_id, err) => {
          console.warn(`Error reproduciendo ${key}:`, err);
          // Reintento tras desbloqueo de contexto de audio
          sound.once('unlock', () => { if (this.isEnabled) sound.play(); });
        },
      });
      this.sounds.set(key, sound);
    });
  }

  // â”€â”€ InicializaciÃ³n â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  public initialize(): void {
    if (this.isInitialized || !this.isEnabled) return;

    Howler.volume(1.0);
    this.setThemeByTime();
    this.startAll();

    this.isInitialized = true;
    this.notifyListeners();
  }

  /** Reinicia todos los sonidos tras desbloqueo de autoplay */
  public resumeAll(): void {
    if (!this.isEnabled) return;
    if (!this.isInitialized) {
      this.initialize();
      return;
    }
    this.startAll();
  }

  private setThemeByTime(): void {
    const hour = new Date().getHours();
    this.currentTheme = (hour >= 18 || hour < 7) ? 'night' : 'day';
  }

  // â”€â”€ Arranque de todos los sonidos â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  private startAll(): void {
    // Ambiente principal segÃºn hora
    this.playLoop(this.currentTheme === 'day' ? 'dayAmbient' : 'nightAmbient');

    // Capa de hojas siempre activa
    this.playLoop('leafRustle');

    // Sonidos periÃ³dicos: empiezan inmediatamente y luego se repiten
    const periodicKeys = ['monkeyChatter', 'birdFlutter', 'waterDrop'];
    periodicKeys.forEach((key, i) => {
      // PequeÃ±o escalonado de arranque solo para que no ocurran exactamente en el mismo sample
      const initDelay = i * 400;
      setTimeout(() => {
        if (this.isEnabled) this.scheduleRepeat(key, true);
      }, initDelay);
    });
  }

  /** Arranca un sonido en loop, esperando si aÃºn estÃ¡ cargando */
  private playLoop(key: string): void {
    const sound = this.sounds.get(key);
    if (!sound) return;

    const play = () => {
      if (!this.isEnabled || sound.playing()) return;
      sound.play();
    };

    if (sound.state() === 'loaded') {
      play();
    } else {
      sound.once('load', play);
    }
  }

  /**
   * Reproduce un sonido periÃ³dico y programa su siguiente repeticiÃ³n.
   * @param immediate si true, lo reproduce ahora mismo ademÃ¡s de programar el siguiente
   */
  private scheduleRepeat(key: string, immediate: boolean): void {
    const sound = this.sounds.get(key);
    const config = this.soundConfigs[key];
    if (!sound || !config?.repeatInterval || !this.isEnabled) return;

    const [min, max] = config.repeatInterval;

    const playAndSchedule = () => {
      if (!this.isEnabled) return;

      // Reproducir
      const doPlay = () => {
        if (this.isEnabled && !sound.playing()) {
          const vol = config.volume + (Math.random() - 0.5) * 0.06;
          sound.volume(Math.max(0.1, Math.min(1, vol)));
          sound.play();
        }
      };

      if (sound.state() === 'loaded') {
        doPlay();
      } else {
        sound.once('load', doPlay);
      }

      // Programar la siguiente
      const nextDelay = min + Math.random() * (max - min);
      const timer = setTimeout(playAndSchedule, nextDelay);
      this.repeatTimers.set(key, timer);
    };

    if (immediate) {
      playAndSchedule();
    } else {
      const delay = min + Math.random() * (max - min);
      const timer = setTimeout(playAndSchedule, delay);
      this.repeatTimers.set(key, timer);
    }
  }

  // â”€â”€ Sonido interactivo (eventos de usuario) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  public playInteractive(soundKey: string): void {
    if (!this.isEnabled) return;
    if (!this.isInitialized) { this.initialize(); return; }

    const sound = this.sounds.get(soundKey === 'birdFlutter' ? 'birdFlutter' : soundKey)
                ?? this.sounds.get('birdFlutter');

    if (sound && sound.state() === 'loaded') {
      sound.play();
    } else {
      const buf = audioTestGenerator.generateBirdSound();
      if (buf) audioTestGenerator.playBuffer(buf, false, 0.25);
    }
  }

  // â”€â”€ Cambio de tema dÃ­a/noche â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  public setTheme(theme: 'day' | 'night'): void {
    if (this.currentTheme === theme) return;

    const oldKey = this.currentTheme === 'day' ? 'dayAmbient' : 'nightAmbient';
    const newKey = theme === 'day' ? 'dayAmbient' : 'nightAmbient';
    this.currentTheme = theme;

    const oldSound = this.sounds.get(oldKey);
    const newSound = this.sounds.get(newKey);

    if (oldSound?.playing()) {
      oldSound.fade(oldSound.volume(), 0, 2000);
      oldSound.once('fade', () => oldSound.stop());
    }

    if (newSound && this.isInitialized) {
      this.playLoop(newKey);
    }

    this.notifyListeners();
  }

  // â”€â”€ Toggle / Volumen â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  public toggle(enabled: boolean): void {
    this.isEnabled = enabled;

    if (!enabled) {
      this.sounds.forEach(s => s.stop());
      this.repeatTimers.forEach(t => clearTimeout(t));
      this.repeatTimers.clear();
    } else if (this.isInitialized) {
      this.startAll();
    }

    this.notifyListeners();
  }

  public setVolume(volume: number): void {
    Howler.volume(Math.max(0, Math.min(1, volume)));
  }

  public destroy(): void {
    this.repeatTimers.forEach(t => clearTimeout(t));
    this.sounds.forEach(s => s.unload());
    this.sounds.clear();
    this.isInitialized = false;
  }

  // â”€â”€ Getters â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  public get initialized(): boolean { return this.isInitialized; }
  public get enabled(): boolean { return this.isEnabled; }
  public get theme(): 'day' | 'night' { return this.currentTheme; }
}

// Instancia singleton
export const soundManager = new SoundManager();

// Hook para React
export const useSoundManager = () => {
  const [, forceUpdate] = useReducer((x: number) => x + 1, 0);

  useEffect(() => {
    const handleUpdate = () => forceUpdate();
    soundManager.addListener(handleUpdate);
    return () => soundManager.removeListener(handleUpdate);
  }, []);

  return {
    initialize: () => soundManager.initialize(),
    resumeAmbient: () => soundManager.resumeAll(),
    playInteractive: (soundKey: string) => soundManager.playInteractive(soundKey),
    setTheme: (theme: 'day' | 'night') => soundManager.setTheme(theme),
    toggle: (enabled: boolean) => soundManager.toggle(enabled),
    setVolume: (volume: number) => soundManager.setVolume(volume),
    getDiagnostic: () => {},
    isInitialized: soundManager.initialized,
    isEnabled: soundManager.enabled,
    currentTheme: soundManager.theme,
  };
};



