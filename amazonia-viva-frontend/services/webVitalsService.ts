/**
 * Servicio para monitoreo de Web Vitals
 * 
 * Este servicio recopila las métricas esenciales de rendimiento web
 * usando la API nativa del navegador y las envía a Supabase.
 * 
 * @see https://web.dev/vitals/
 */

// Extender Navigator para incluir connection
declare global {
  interface Navigator {
    connection?: {
      effectiveType: string;
      rtt: number;
      downlink: number;
      saveData: boolean;
    };
  }
}

// Tipos para métricas de rendimiento
export interface PerformanceMetric {
  name: 'CLS' | 'FCP' | 'LCP' | 'FID' | 'TTFB' | 'INP';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
}

export interface WebVitalReport {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
  userAgent: string;
  url: string;
  connection?: {
    effectiveType: string;
    rtt: number;
    downlink: number;
  };
}

/**
 * Servicio para monitoreo de Web Vitals usando Performance API
 */
export class WebVitalsService {
  private static instance: WebVitalsService;
  private metrics: Map<string, PerformanceMetric[]> = new Map();
  private observer: PerformanceObserver | null = null;
  private isEnabled: boolean = false;

  private constructor() {}

  public static getInstance(): WebVitalsService {
    if (!WebVitalsService.instance) {
      WebVitalsService.instance = new WebVitalsService();
    }
    return WebVitalsService.instance;
  }

  /**
   * Inicializa el monitoreo usando Performance Observer API
   */
  public init(): void {
    if (this.isEnabled) return;

    try {
      // Observar diferentes tipos de entradas de rendimiento
      const entryTypes = ['largest-contentful-paint', 'first-input', 'layout-shift'];
      
      for (const type of entryTypes) {
        try {
          this.observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              this.handlePerformanceEntry(entry);
            }
          });
          
          // @ts-ignore - Tipos de PerformanceObserver no están completos
          this.observer.observe({ type, buffered: true });
        } catch {
          // Tipo de entrada no soportado
        }
      }

      // Medir Navigation Timing (TTFB, FCP)
      this.observeNavigationTiming();

      this.isEnabled = true;
      console.log('✅ Web Vitals monitoring initialized (native API)');
    } catch (error) {
      console.warn('⚠️ Web Vitals monitoring failed:', error);
    }
  }

  /**
   * Maneja entradas de rendimiento del Performance Observer
   */
  private handlePerformanceEntry(entry: PerformanceEntry): void {
    let metric: PerformanceMetric | null = null;

    switch (entry.entryType) {
      case 'largest-contentful-paint':
        const lcpEntry = entry as PerformanceEntry & { renderTime?: number; loadTime?: number };
        metric = {
          name: 'LCP',
          value: lcpEntry.renderTime || lcpEntry.loadTime || entry.startTime,
          rating: this.getRating('LCP', lcpEntry.renderTime || lcpEntry.loadTime || entry.startTime),
          timestamp: Date.now(),
        };
        break;

      case 'first-input':
        const fidEntry = entry as PerformanceEntry & { processingStart: number };
        metric = {
          name: 'FID',
          value: fidEntry.processingStart - entry.startTime,
          rating: this.getRating('FID', fidEntry.processingStart - entry.startTime),
          timestamp: Date.now(),
        };
        break;

      case 'layout-shift':
        const clsEntry = entry as PerformanceEntry & { value: number };
        metric = {
          name: 'CLS',
          value: clsEntry.value,
          rating: this.getRating('CLS', clsEntry.value),
          timestamp: Date.now(),
        };
        break;
    }

    if (metric) {
      this.storeMetric(metric);
    }
  }

  /**
   * Observa Navigation Timing para TTFB y FCP
   */
  private observeNavigationTiming(): void {
    if (performance.getEntriesByType) {
      const navigationEntries = performance.getEntriesByType('navigation');
      if (navigationEntries.length > 0) {
        const navEntry = navigationEntries[0] as PerformanceNavigationTiming;
        
        // TTFB
        const ttfb = navEntry.responseStart;
        this.storeMetric({
          name: 'TTFB',
          value: ttfb,
          rating: this.getRating('TTFB', ttfb),
          timestamp: Date.now(),
        });

        // FCP (usando paint timing)
        const paintEntries = performance.getEntriesByType('paint');
        for (const paintEntry of paintEntries) {
          if (paintEntry.name === 'first-contentful-paint') {
            this.storeMetric({
              name: 'FCP',
              value: paintEntry.startTime,
              rating: this.getRating('FCP', paintEntry.startTime),
              timestamp: Date.now(),
            });
          }
        }
      }
    }
  }

  /**
   * Almacena una métrica
   */
  private storeMetric(metric: PerformanceMetric): void {
    if (!this.metrics.has(metric.name)) {
      this.metrics.set(metric.name, []);
    }
    
    const metricsArray = this.metrics.get(metric.name)!;
    metricsArray.push(metric);
    
    // Mantener solo últimas 100 métricas
    if (metricsArray.length > 100) {
      metricsArray.splice(0, metricsArray.length - 100);
    }

    // Log en desarrollo
    if (process.env.NODE_ENV === 'development') {
      const emoji = metric.rating === 'good' ? '✅' : metric.rating === 'needs-improvement' ? '⚠️' : '🔴';
      console.log(`${emoji} ${metric.name}: ${metric.value.toFixed(2)}`);
    }

    // Enviar al servidor
    this.scheduleSend(metric);
  }

  /**
   * Obtiene el rating para una métrica
   */
  private getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
    const thresholds: Record<string, { good: number; needsImprovement: number }> = {
      CLS: { good: 0.1, needsImprovement: 0.25 },
      FCP: { good: 1800, needsImprovement: 3000 },
      LCP: { good: 2500, needsImprovement: 4000 },
      FID: { good: 100, needsImprovement: 300 },
      TTFB: { good: 800, needsImprovement: 1800 },
      INP: { good: 200, needsImprovement: 500 },
    };

    const threshold = thresholds[name];
    if (!threshold) return 'good';

    if (value <= threshold.good) return 'good';
    if (value <= threshold.needsImprovement) return 'needs-improvement';
    return 'poor';
  }

  /**
   * Programa el envío de métricas
   */
  private scheduleSend(metric: PerformanceMetric): void {
    // Enviar después de 5 segundos
    setTimeout(() => {
      this.sendToSupabase(metric);
    }, 5000);
  }

  /**
   * Envía métricas a Supabase
   */
  private async sendToSupabase(metric: PerformanceMetric): Promise<void> {
    const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
    const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) return;

    const report: WebVitalReport = {
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      timestamp: metric.timestamp,
      userAgent: navigator.userAgent,
      url: window.location.href,
      connection: navigator.connection ? {
        effectiveType: navigator.connection.effectiveType,
        rtt: navigator.connection.rtt,
        downlink: navigator.connection.downlink,
      } : undefined,
    };

    try {
      await fetch(`${supabaseUrl}/rest/v1/web_vitals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify(report),
      });
    } catch (error) {
      console.error('Error sending Web Vitals:', error);
    }
  }

  /**
   * Obtiene el resumen de métricas
   */
  public getSummary(): Record<string, { average: number; count: number; rating: string }> {
    const summary: Record<string, { average: number; count: number; rating: string }> = {};

    for (const [name, metrics] of this.metrics.entries()) {
      if (metrics.length === 0) continue;

      const sum = metrics.reduce((acc, m) => acc + m.value, 0);
      const average = sum / metrics.length;
      const rating = this.getRating(name, average);

      summary[name] = {
        average,
        count: metrics.length,
        rating,
      };
    }

    return summary;
  }

  /**
   * Limpia métricas
   */
  public clear(): void {
    this.metrics.clear();
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    this.isEnabled = false;
  }
}

export const webVitalsService = WebVitalsService.getInstance();

export default webVitalsService;