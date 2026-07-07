/**
 * Generador de audio sintético para pruebas
 * Crea sonidos de prueba usando Web Audio API cuando no hay archivos de audio reales
 */

class AudioTestGenerator {
  private audioContext: AudioContext | null = null;

  constructor() {
    // Inicializar AudioContext al crear la instancia
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('⚠️ Web Audio API no disponible:', error);
    }
  }

  /**
   * Genera un tono de prueba para simular sonidos de ambiente
   */
  public generateAmbientSound(duration: number = 5000): AudioBuffer | null {
    if (!this.audioContext) return null;

    const sampleRate = this.audioContext.sampleRate;
    const length = Math.floor(sampleRate * (duration / 1000));
    const buffer = this.audioContext.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    // Generar ruido rosa para simular ambiente de selva
    let last = 0;
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + white * 0.02) * 0.9;
      data[i] = last * 0.1; // Volumen bajo para ambiente
    }

    return buffer;
  }

  /**
   * Genera un sonido de pájaro sintético con variaciones aleatorias
   */
  public generateBirdSound(): AudioBuffer | null {
    if (!this.audioContext) return null;

    const sampleRate = this.audioContext.sampleRate;
    const duration = 0.8 + Math.random() * 0.7; // Duración variable: 0.8-1.5 segundos
    const length = Math.floor(sampleRate * duration);
    const buffer = this.audioContext.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    // Parámetros variables para cada sonido
    const baseFreq = 600 + Math.random() * 800; // Frecuencia base: 600-1400 Hz
    const modDepth = 200 + Math.random() * 400; // Profundidad de modulación
    const modSpeed = 8 + Math.random() * 12; // Velocidad de modulación
    const chirpType = Math.random(); // Tipo de trino

    // Generar sonido de pájaro con frecuencias variables
    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      
      let frequency;
      if (chirpType < 0.3) {
        // Trino ascendente
        frequency = baseFreq + (t / duration) * modDepth + Math.sin(t * modSpeed * 2 * Math.PI) * 100;
      } else if (chirpType < 0.6) {
        // Trino descendente
        frequency = baseFreq + modDepth - (t / duration) * modDepth + Math.sin(t * modSpeed * 2 * Math.PI) * 100;
      } else {
        // Trino ondulante
        frequency = baseFreq + Math.sin(t * modSpeed * 2 * Math.PI) * modDepth;
      }
      
      // Envelope más natural con múltiples segmentos
      let envelope;
      if (t < duration * 0.1) {
        // Ataque rápido
        envelope = t / (duration * 0.1);
      } else if (t < duration * 0.7) {
        // Sustain
        envelope = 1;
      } else {
        // Decay exponencial
        const releaseTime = t - duration * 0.7;
        envelope = Math.exp(-releaseTime * 8);
      }
      
      // Agregar múltiples armónicos para sonido más realista pero sutil
      const fundamental = Math.sin(2 * Math.PI * frequency * t);
      const harmonic2 = Math.sin(2 * Math.PI * frequency * 2 * t) * 0.2; // Reducido
      const harmonic3 = Math.sin(2 * Math.PI * frequency * 3 * t) * 0.05; // Reducido
      
      data[i] = (fundamental + harmonic2 + harmonic3) * envelope * 0.2; // Volumen base más sutil
    }

    return buffer;
  }

  /**
   * Genera sonido de agua goteando
   */
  public generateWaterDropSound(): AudioBuffer | null {
    if (!this.audioContext) return null;

    const sampleRate = this.audioContext.sampleRate;
    const duration = 0.8;
    const length = Math.floor(sampleRate * duration);
    const buffer = this.audioContext.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      const frequency = 300 * Math.exp(-t * 8); // Frecuencia que decae
      const envelope = Math.exp(-t * 15) * (1 - Math.exp(-t * 50)); // Ataque rápido, decay rápido
      data[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.4;
    }

    return buffer;
  }

  /**
   * Reproduce un buffer de audio
   */
  public playBuffer(buffer: AudioBuffer, loop: boolean = false, volume: number = 1): AudioBufferSourceNode | null {
    if (!this.audioContext || !buffer) return null;

    const source = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();

    source.buffer = buffer;
    source.loop = loop;
    gainNode.gain.value = Math.max(0, Math.min(1, volume));

    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    source.start();
    return source;
  }

  /**
   * Crea un reproductor de ambiente continuo
   */
  public createAmbientPlayer(volume: number = 0.2): {
    start: () => void;
    stop: () => void;
    setVolume: (vol: number) => void;
  } {
    let currentSource: AudioBufferSourceNode | null = null;
    let gainNode: GainNode | null = null;
    let isPlaying = false;

    const start = () => {
      if (isPlaying || !this.audioContext) return;
      
      const buffer = this.generateAmbientSound(10000); // 10 segundos
      if (!buffer) return;

      currentSource = this.audioContext.createBufferSource();
      gainNode = this.audioContext.createGain();

      currentSource.buffer = buffer;
      currentSource.loop = true;
      gainNode.gain.value = volume;

      currentSource.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      currentSource.start();
      isPlaying = true;

      console.log('🔊 Audio ambiente sintético iniciado');
    };

    const stop = () => {
      if (currentSource) {
        currentSource.stop();
        currentSource = null;
        isPlaying = false;
        console.log('🔇 Audio ambiente sintético detenido');
      }
    };

    const setVolume = (vol: number) => {
      if (gainNode) {
        gainNode.gain.value = Math.max(0, Math.min(1, vol));
      }
      volume = vol;
    };

    return { start, stop, setVolume };
  }

  /**
   * Reproduce un sonido esporádico sintético - SOLO AMBIENTE (NO PÁJAROS)
   */
  public playRandomSporadicSound(): void {
    if (!this.audioContext) return;

    // SOLO sonidos de ambiente, nunca pájaros
    const soundType = Math.random();
    let buffer: AudioBuffer | null = null;

    if (soundType < 0.7) {
      // 70% - Sonido de gota de agua
      buffer = this.generateWaterDropSound();
    } else {
      // 30% - Sonido de viento suave o susurro
      buffer = this.generateWindSound();
    }

    if (buffer) {
      this.playBuffer(buffer, false, 0.2 + Math.random() * 0.2); // Volumen más bajo para ambiente
    }
  }

  /**
   * Genera un sonido de viento suave para ambiente
   */
  public generateWindSound(): AudioBuffer | null {
    if (!this.audioContext) return null;

    const sampleRate = this.audioContext.sampleRate;
    const duration = 1.5 + Math.random() * 1; // 1.5-2.5 segundos
    const length = Math.floor(sampleRate * duration);
    const buffer = this.audioContext.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    // Generar ruido filtrado para simular viento suave
    let last = 0;
    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      const white = Math.random() * 2 - 1;
      
      // Filtro paso bajo simple para suavizar
      last = (last + white * 0.1) * 0.9;
      
      // Envelope suave
      const envelope = Math.sin(Math.PI * t / duration) * 0.15; // Muy suave
      
      data[i] = last * envelope;
    }

    return buffer;
  }

  /**
   * Cleanup
   */
  public dispose(): void {
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }
  }
}

export const audioTestGenerator = new AudioTestGenerator();