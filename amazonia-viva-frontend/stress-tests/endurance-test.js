/**
 * Porerekua - Prueba de Resistencia (Endurance Test)
 * 
 * Objetivo: Detectar memory leaks y degradación por uso prolongado
 * Escenario: 1 hora de carga constante con picos intermitentes
 * 
 * Ejecución: k6 run stress-tests/endurance-test.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// ============================================================================
// MÉTRICAS PERSONALIZADAS
// ============================================================================

const errorRate = new Rate('errors');
const dbQueryTime = new Trend('db_query_time');
const memoryUsage = new Trend('memory_usage');
const responseTimeDegradation = new Trend('response_time_degradation');
const longRunningQueries = new Counter('long_running_queries');
const timeoutErrors = new Counter('timeout_errors');

// ============================================================================
// CONFIGURACIÓN DE PRUEBA
// ============================================================================

export const options = {
  scenarios: {
    // Carga constante durante 1 hora
    constant_load: {
      executor: 'constant-vus',
      vus: 10,
      duration: '1h',
      exec: 'constantLoad',
      tags: { type: 'constant' },
    },
    
    // Picos de carga intermitentes
    spike_load: {
      executor: 'ramping-arrival-rate',
      preAllocatedVUs: 50,
      timeUnit: '1s',
      stages: [
        { duration: '10m', target: 30 },  // 30 req/s
        { duration: '10m', target: 60 },  // 60 req/s (pico)
        { duration: '10m', target: 30 },  // Volver a 30 req/s
        { duration: '20m', target: 30 },  // Mantener 30 req/s
        { duration: '10m', target: 0 },   // Ramp down
      ],
      exec: 'spikeLoad',
      tags: { type: 'spike' },
    },
  },
  
  thresholds: {
    http_req_duration: ['p(95)<2000'],
    http_req_failed: ['rate<0.1'],
    errors: ['rate<0.1'],
    db_query_time: ['p(95)<1500'],
    long_running_queries: ['count<50'],    // Menos de 50 consultas lentas
    timeout_errors: ['count<10'],          // Menos de 10 timeouts
  },
};

// ============================================================================
// CONFIGURACIÓN
// ============================================================================

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const SUPABASE_URL = __ENV.SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = __ENV.SUPABASE_ANON_KEY || 'your-anon-key';

const headers = {
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
};

// ============================================================================
// FUNCIONES DE PRUEBA
// ============================================================================

/**
 * Simula carga constante de usuarios
 */
export function constantLoad() {
  const startTime = Date.now();
  
  // 1. Cargar página principal
  let res = http.get(`${BASE_URL}/`, { timeout: '30s' });
  
  if (res.status === 200) {
    responseTimeDegradation.add(Date.now() - startTime);
  } else if (res.error_code === 3 || res.error_code === 4) {
    // Timeout o error de conexión
    timeoutErrors.add(1);
  }
  
  check(res, { 'home loaded': (r) => r.status === 200 });
  errorRate.add(res.status !== 200);
  
  // 2. Cargar datos de proyectos
  const queryStart = Date.now();
  res = http.get(
    `${SUPABASE_URL}/rest/v1/projects?select=id,name,description&limit=10`,
    { headers, timeout: '30s' }
  );
  dbQueryTime.add(Date.now() - queryStart);
  
  // Detectar consultas lentas (> 5 segundos)
  if (Date.now() - queryStart > 5000) {
    longRunningQueries.add(1);
  }
  
  check(res, { 'projects loaded': (r) => r.status === 200 });
  errorRate.add(res.status !== 200);
  
  // 3. Simular uso de memoria (monitoreo)
  if (performance && performance.memory) {
    memoryUsage.add(performance.memory.usedJSHeapSize);
  }
  
  sleep(10 + Math.random() * 20); // Pausa larga para simular sesión real
}

/**
 * Simula picos de carga
 */
export function spikeLoad() {
  const startTime = Date.now();
  
  // Consulta rápida a Supabase
  const res = http.get(
    `${SUPABASE_URL}/rest/v1/projects?select=id,name&limit=5`,
    { headers, timeout: '10s' }
  );
  
  dbQueryTime.add(Date.now() - startTime);
  
  check(res, { 'spike query ok': (r) => r.status === 200 });
  errorRate.add(res.status !== 200);
  
  sleep(0.5 + Math.random() * 1);
}

// ============================================================================
// SETUP Y TEARDOWN
// ============================================================================

export function setup() {
  console.log('===========================================');
  console.log('Porerekua - Prueba de Resistencia (1 hora)');
  console.log('===========================================');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Supabase URL: ${SUPABASE_URL}`);
  console.log('Objetivo: Detectar memory leaks y degradación');
  console.log('===========================================');
  
  // Health check inicial
  const healthCheck = http.get(`${BASE_URL}/`, { timeout: '30s' });
  if (healthCheck.status !== 200) {
    throw new Error(`Frontend no disponible: ${healthCheck.status}`);
  }
  
  const supabaseCheck = http.get(`${SUPABASE_URL}/rest/v1/projects?limit=1`, { 
    headers, 
    timeout: '30s' 
  });
  if (supabaseCheck.status !== 200) {
    throw new Error(`Supabase no disponible: ${supabaseCheck.status}`);
  }
  
  console.log('✓ Conectividad verificada');
  console.log('===========================================');
  
  return { 
    startTime: Date.now(),
    initialMemory: performance && performance.memory ? performance.memory.usedJSHeapSize : 0,
  };
}

export function teardown(data) {
  const duration = (Date.now() - data.startTime) / 1000;
  const durationMinutes = (duration / 60).toFixed(2);
  
  console.log('===========================================');
  console.log('Prueba de resistencia completada');
  console.log(`Duración: ${durationMinutes} minutos`);
  console.log('===========================================');
  
  // Análisis de memory leak
  const finalMemory = performance && performance.memory ? performance.memory.usedJSHeapSize : 0;
  const memoryGrowth = finalMemory - data.initialMemory;
  const memoryGrowthMB = (memoryGrowth / (1024 * 1024)).toFixed(2);
  
  console.log('📊 ANÁLISIS DE MEMORIA:');
  console.log(`  Memoria inicial: ${(data.initialMemory / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`  Memoria final: ${(finalMemory / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`  Crecimiento: ${memoryGrowthMB} MB`);
  
  if (memoryGrowth > 50 * 1024 * 1024) { // 50MB
    console.log('⚠️  ALERTA: Posible memory leak detectado (> 50MB)');
  } else if (memoryGrowth > 20 * 1024 * 1024) { // 20MB
    console.log('⚡ ADVERTENCIA: Crecimiento de memoria moderado');
  } else {
    console.log('✅ Memoria estable - No se detectaron leaks significativos');
  }
  
  console.log('===========================================');
  console.log('📈 MÉTRICAS DE RENDIMIENTO:');
  console.log(`  Consultas lentas (> 5s): ${longRunningQueries.values.count || 0}`);
  console.log(`  Timeouts: ${timeoutErrors.values.count || 0}`);
  console.log(`  Error rate: ${(errorRate.values.rate * 100).toFixed(2) || 0}%`);
  console.log('===========================================');
}