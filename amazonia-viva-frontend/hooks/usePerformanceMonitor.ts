/**
 * Hook personalizado para monitoreo de rendimiento
 * 
 * Este hook permite medir el tiempo de renderizado de componentes
 * y detectar posibles problemas de rendimiento en la aplicación.
 * 
 * @usage
 * ```tsx
 * const MyComponent = () => {
 *   const { renderTime, memoryUsage } = usePerformanceMonitor('MyComponent');
 *   // ... resto del componente
 * };
 * ```
 */

import { useEffect, useRef, useState, useCallback } from 'react';

// Extender el tipo Performance para incluir memory (Chrome/Edge only)
declare global {
  interface Performance {
    memory?: {
      usedJSHeapSize: number;
      totalJSHeapSize: number;
      jsHeapSizeLimit: number;
    };
  }
}

export interface PerformanceMetrics {
  componentName: string;
  renderTime: number;
  memoryUsage?: number;
  timestamp: number;
  isSlow?: boolean;
}

export interface UsePerformanceMonitorResult {
  renderTime: number;
  memoryUsage?: number;
  isSlow: boolean;
  metrics: PerformanceMetrics[];
  logMetrics: () => void;
  sendMetrics: () => Promise<void>;
}

/**
 * Hook para monitorear el rendimiento de componentes
 */
export function usePerformanceMonitor(componentName: string): UsePerformanceMonitorResult {
  const startTimeRef = useRef<number>(0);
  const metricsRef = useRef<PerformanceMetrics[]>([]);
  const [renderTime, setRenderTime] = useState<number>(0);
  const [memoryUsage, setMemoryUsage] = useState<number | undefined>(undefined);
  const [isSlow, setIsSlow] = useState<boolean>(false);

  // Umbral para considerar un renderizado como "lento" (en ms)
  const SLOW_THRESHOLD = 16; // 1 frame a 60fps

  useEffect(() => {
    startTimeRef.current = performance.now();

    return () => {
      const endTime = performance.now();
      const currentRenderTime = endTime - startTimeRef.current;

      const metrics: PerformanceMetrics = {
        componentName,
        renderTime: currentRenderTime,
        timestamp: Date.now(),
        isSlow: currentRenderTime > SLOW_THRESHOLD,
      };

      // Obtener uso de memoria si está disponible (Chrome/Edge)
      if (performance.memory) {
        const memUsage = performance.memory.usedJSHeapSize;
        metrics.memoryUsage = memUsage;
        setMemoryUsage(memUsage);
      }

      metricsRef.current.push(metrics);
      setRenderTime(currentRenderTime);
      setIsSlow(currentRenderTime > SLOW_THRESHOLD);

      // Log en desarrollo
      if (process.env.NODE_ENV === 'development') {
        const status = metrics.isSlow ? '⚠️ SLOW' : '✅';
        console.log(`[${status}] ${componentName} render: ${currentRenderTime.toFixed(2)}ms`);
        
        if (metrics.memoryUsage) {
          console.log(`   Memory: ${(metrics.memoryUsage / (1024 * 1024)).toFixed(2)} MB`);
        }
      }

      // Enviar métricas en producción (con debounce)
      if (process.env.NODE_ENV === 'production' && metrics.isSlow) {
        sendMetricsToServer(metrics);
      }
    };
  }, [componentName]);

  /**
   * Envía métricas al servidor de monitoreo
   */
  const sendMetricsToServer = useCallback(async (metrics: PerformanceMetrics) => {
    try {
      // Enviar a Supabase o servicio de monitoreo
      const response = await fetch('/api/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metrics),
      });

      if (!response.ok) {
        console.warn('Failed to send performance metrics');
      }
    } catch (error) {
      console.error('Error sending performance metrics:', error);
    }
  }, []);

  /**
   * Registra las métricas en consola
   */
  const logMetrics = useCallback(() => {
    console.group(`📊 Performance Metrics: ${componentName}`);
    console.log(`Total renders: ${metricsRef.current.length}`);
    console.log(`Average render time: ${(
      metricsRef.current.reduce((sum: number, m: PerformanceMetrics) => sum + m.renderTime, 0) / metricsRef.current.length
    ).toFixed(2)}ms`);
    console.log(`Slowest render: ${Math.max(...metricsRef.current.map((m: PerformanceMetrics) => m.renderTime)).toFixed(2)}ms`);
    console.log(`Slow renders: ${metricsRef.current.filter((m: PerformanceMetrics) => m.isSlow).length}`);
    console.groupEnd();
  }, [componentName]);

  /**
   * Envía todas las métricas acumuladas
   */
  const sendMetrics = useCallback(async () => {
    if (metricsRef.current.length === 0) return;

    const avgRenderTime = metricsRef.current.reduce((sum: number, m: PerformanceMetrics) => sum + m.renderTime, 0) / metricsRef.current.length;
    const slowRenders = metricsRef.current.filter((m: PerformanceMetrics) => m.isSlow);

    const summary = {
      componentName,
      totalRenders: metricsRef.current.length,
      avgRenderTime,
      slowRenders: slowRenders.length,
      slowRenderPercentage: (slowRenders.length / metricsRef.current.length) * 100,
      timestamp: Date.now(),
    };

    try {
      await fetch('/api/performance/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(summary),
      });
    } catch (error) {
      console.error('Error sending performance summary:', error);
    }
  }, [componentName]);

  return {
    renderTime,
    memoryUsage,
    isSlow,
    metrics: metricsRef.current,
    logMetrics,
    sendMetrics,
  };
}

/**
 * Hook para monitorear el rendimiento de consultas de React Query
 */
export function useQueryPerformanceMonitor(queryKey: string[]) {
  const [queryTime, setQueryTime] = useState<number>(0);
  const [isSlowQuery, setIsSlowQuery] = useState<boolean>(false);
  const queryStartTimeRef = useRef<number>(0);

  const startQueryTimer = useCallback(() => {
    queryStartTimeRef.current = performance.now();
  }, []);

  const endQueryTimer = useCallback(() => {
    const endTime = performance.now();
    const duration = endTime - queryStartTimeRef.current;
    setQueryTime(duration);
    setIsSlowQuery(duration > 1000); // Más de 1 segundo es lento

    if (process.env.NODE_ENV === 'development') {
      const status = isSlowQuery ? '⚠️ SLOW QUERY' : '✅';
      console.log(`[${status}] ${queryKey.join('.')} fetched in ${duration.toFixed(2)}ms`);
    }

    return duration;
  }, [queryKey, isSlowQuery]);

  return {
    queryTime,
    isSlowQuery,
    startQueryTimer,
    endQueryTimer,
  };
}

/**
 * Hook para monitorear el uso de memoria de la aplicación
 */
export function useMemoryMonitor(interval = 5000) {
  const [memoryStats, setMemoryStats] = useState({
    usedJSHeapSize: 0,
    totalJSHeapSize: 0,
    jsHeapSizeLimit: 0,
    usage: 0,
  });
  const [memoryHistory, setMemoryHistory] = useState<{ timestamp: number; used: number }[]>([]);

  useEffect(() => {
    if (!performance.memory) {
      console.warn('Memory API not available in this browser');
      return;
    }

    const updateMemoryStats = () => {
      const memory = performance.memory;
      if (!memory) return;
      
      const stats = {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
        usage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
      };

      setMemoryStats(stats);
      setMemoryHistory((prev: { timestamp: number; used: number }[]) => [
        ...prev.slice(-60), // Mantener últimas 60 lecturas (5 minutos a 5s de intervalo)
        { timestamp: Date.now(), used: memory.usedJSHeapSize }
      ]);
    };

    // Actualización inicial
    updateMemoryStats();

    // Actualización periódica
    const intervalId = setInterval(updateMemoryStats, interval);

    return () => clearInterval(intervalId);
  }, [interval]);

  // Detectar posibles memory leaks
  const detectMemoryLeak = useCallback(() => {
    if (memoryHistory.length < 10) return false;

    // Comparar las últimas 10 lecturas con las primeras 10
    const recent = memoryHistory.slice(-10);
    const initial = memoryHistory.slice(0, 10);

    const avgRecent = recent.reduce((sum: number, m: { used: number }) => sum + m.used, 0) / recent.length;
    const avgInitial = initial.reduce((sum: number, m: { used: number }) => sum + m.used, 0) / initial.length;

    // Si el crecimiento es mayor al 20%, posible memory leak
    const growth = ((avgRecent - avgInitial) / avgInitial) * 100;
    return growth > 20;
  }, [memoryHistory]);

  return {
    ...memoryStats,
    memoryHistory,
    detectMemoryLeak,
    hasMemoryLeak: detectMemoryLeak(),
  };
}

export default usePerformanceMonitor;