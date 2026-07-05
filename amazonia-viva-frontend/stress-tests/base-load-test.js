/**
 * Porerekua - Prueba de Carga Base
 * 
 * Objetivo: Validar funcionamiento con plan Free de Supabase (100 usuarios)
 * Escenario: 10 usuarios concurrentes durante 15 minutos
 * 
 * Ejecución: k6 run stress-tests/base-load-test.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// ============================================================================
// MÉTRICAS PERSONALIZADAS
// ============================================================================

const errorRate = new Rate('errors');
const dbQueryTime = new Trend('db_query_time');
const frontendLoadTime = new Trend('frontend_load_time');
const searchQueryTime = new Trend('search_query_time');

// ============================================================================
// CONFIGURACIÓN DE PRUEBA
// ============================================================================

export const options = {
  scenarios: {
    // Escenario principal: ramp up gradual
    load_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 5 },    // Ramp up a 5 usuarios
        { duration: '5m', target: 5 },    // Mantener 5 usuarios
        { duration: '2m', target: 10 },   // Ramp up a 10 usuarios
        { duration: '5m', target: 10 },   // Mantener 10 usuarios
        { duration: '1m', target: 0 },    // Ramp down
      ],
      exec: 'loadTest',
    },
  },
  
  // Umbrales de rendimiento (thresholds)
  thresholds: {
    http_req_duration: ['p(95)<1000'],    // 95% de requests < 1 segundo
    http_req_failed: ['rate<0.05'],       // Error rate < 5%
    errors: ['rate<0.1'],                 // Errores personalizados < 10%
    db_query_time: ['p(95)<800'],         // Consultas DB < 800ms
    frontend_load_time: ['p(95)<1500'],   // Carga frontend < 1.5s
    search_query_time: ['p(95)<500'],     // Búsquedas < 500ms
  },
  
  // Configuración de red
  noConnectionReuse: false,
  insecureSkipTLSVerify: false,
};

// ============================================================================
// CONFIGURACIÓN DE ENTORNO
// ============================================================================

// URLs - Reemplazar con valores reales
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const SUPABASE_URL = __ENV.SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = __ENV.SUPABASE_ANON_KEY || 'your-anon-key';

// Headers para autenticación en Supabase
const headers = {
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation',
};

// Términos de búsqueda comunes para pruebas
const SEARCH_TERMS = [
  'reforestación',
  'comunidad', 
  'conservación',
  'biodiversidad',
  'agua',
  'amazonía',
];

// ============================================================================
// FUNCIONES AUXILIARES
// ============================================================================

/**
 * Simula el comportamiento de un usuario anónimo
 */
function anonymousUserBehavior() {
  const actions = [];
  
  // 50% probabilidad: Ver página de datos
  if (Math.random() < 0.5) {
    actions.push('view_data_page');
    if (Math.random() < 0.4) actions.push('search_projects');
  }
  
  // 30% probabilidad: Ver mapa
  if (Math.random() < 0.3) {
    actions.push('view_map_page');
  }
  
  // 15% probabilidad: Ver investigaciones
  if (Math.random() < 0.15) {
    actions.push('view_investigations');
  }
  
  // 5% probabilidad: Registrar organización
  if (Math.random() < 0.05) {
    actions.push('register_organization');
  }
  
  return actions;
}

/**
 * Realiza una búsqueda aleatoria de proyectos
 */
function performRandomSearch() {
  const term = SEARCH_TERMS[Math.floor(Math.random() * SEARCH_TERMS.length)];
  
  const startTime = Date.now();
  const res = http.get(
    `${SUPABASE_URL}/rest/v1/projects?select=id,name,description,tags&name=ilike.*${term}*&limit=10`,
    { headers }
  );
  const duration = Date.now() - startTime;
  
  searchQueryTime.add(duration);
  
  check(res, {
    'search completed': (r) => r.status === 200,
    'search results valid': (r) => {
      try {
        const results = r.json();
        return Array.isArray(results);
      } catch {
        return false;
      }
    },
  });
  
  errorRate.add(res.status !== 200);
  
  return res;
}

/**
 * Registra una nueva organización (simulación)
 */
function registerOrganization() {
  const vuId = __VU;
  const timestamp = Date.now();
  
  const registrationData = {
    organization_name: `Org Test ${vuId}-${timestamp}`,
    personal_name: `Usuario Prueba ${vuId}`,
    email: `test${vuId}-${timestamp}@porerekua-test.com`,
    description: 'Organización de prueba para stress testing - Porerekua',
    reason: 'Participar en proyectos de conservación de la Amazonía',
    type: Math.random() < 0.5 ? 'organizacion' : 'empresa',
  };
  
  const res = http.post(
    `${SUPABASE_URL}/rest/v1/registrations`,
    JSON.stringify(registrationData),
    { headers }
  );
  
  check(res, {
    'registration created': (r) => r.status === 201,
  });
  
  errorRate.add(res.status !== 201);
  
  return res;
}

// ============================================================================
// FUNCIONES DE PRUEBA PRINCIPALES
// ============================================================================

/**
 * Función principal para prueba de carga
 */
export function loadTest() {
  // 1. Cargar página principal
  const homeStart = Date.now();
  let res = http.get(`${BASE_URL}/`);
  frontendLoadTime.add(Date.now() - homeStart);
  
  check(res, { 'home page loaded': (r) => r.status === 200 });
  errorRate.add(res.status !== 200);
  sleep(2);
  
  // 2. Ejecutar comportamiento de usuario
  const actions = anonymousUserBehavior();
  
  for (const action of actions) {
    switch (action) {
      case 'view_data_page':
        // Cargar página de datos
        const dataStart = Date.now();
        res = http.get(`${BASE_URL}/datos`);
        frontendLoadTime.add(Date.now() - dataStart);
        
        check(res, { 'data page loaded': (r) => r.status === 200 });
        errorRate.add(res.status !== 200);
        sleep(2);
        
        // Cargar proyectos desde Supabase
        const projectsStart = Date.now();
        res = http.get(`${SUPABASE_URL}/rest/v1/projects?select=id,name,description,image_url,location,tags,foundation_id`, { headers });
        dbQueryTime.add(Date.now() - projectsStart);
        
        check(res, { 'projects fetched': (r) => r.status === 200 });
        errorRate.add(res.status !== 200);
        sleep(1);
        
        // Cargar fundaciones
        const foundationsStart = Date.now();
        res = http.get(`${SUPABASE_URL}/rest/v1/foundations?select=id,name,description,logo_url`, { headers });
        dbQueryTime.add(Date.now() - foundationsStart);
        
        check(res, { 'foundations fetched': (r) => r.status === 200 });
        errorRate.add(res.status !== 200);
        sleep(1);
        break;
        
      case 'search_projects':
        performRandomSearch();
        sleep(2);
        break;
        
      case 'view_map_page':
        // Cargar página de georeferencia
        const mapStart = Date.now();
        res = http.get(`${BASE_URL}/georeferencia`);
        frontendLoadTime.add(Date.now() - mapStart);
        
        check(res, { 'map page loaded': (r) => r.status === 200 });
        errorRate.add(res.status !== 200);
        sleep(2);
        
        // Cargar proyectos con ubicación para el mapa
        const geoStart = Date.now();
        res = http.get(
          `${SUPABASE_URL}/rest/v1/projects?select=id,name,description,location&not=location.is.null&limit=50`,
          { headers }
        );
        dbQueryTime.add(Date.now() - geoStart);
        
        check(res, { 'geo projects fetched': (r) => r.status === 200 });
        errorRate.add(res.status !== 200);
        sleep(3);
        break;
        
      case 'view_investigations':
        // Cargar investigaciones
        const invStart = Date.now();
        res = http.get(`${SUPABASE_URL}/rest/v1/investigations?select=id,title,authors,summary,image_url`, { headers });
        dbQueryTime.add(Date.now() - invStart);
        
        check(res, { 'investigations fetched': (r) => r.status === 200 });
        errorRate.add(res.status !== 200);
        sleep(2);
        break;
        
      case 'register_organization':
        registerOrganization();
        sleep(2);
        break;
    }
  }
  
  // Pausa entre ciclos de actividad
  sleep(3);
}

/**
 * Función de setup - se ejecuta una vez al inicio
 */
export function setup() {
  console.log('===========================================');
  console.log('Porerekua - Prueba de Carga Base');
  console.log('===========================================');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Supabase URL: ${SUPABASE_URL}`);
  console.log('===========================================');
  
  // Verificar conectividad
  const healthCheck = http.get(`${BASE_URL}/`);
  if (healthCheck.status !== 200) {
    throw new Error(`Frontend no disponible: ${healthCheck.status}`);
  }
  
  const supabaseCheck = http.get(`${SUPABASE_URL}/rest/v1/projects?limit=1`, { headers });
  if (supabaseCheck.status !== 200) {
    throw new Error(`Supabase no disponible: ${supabaseCheck.status}`);
  }
  
  console.log('✓ Conectividad verificada');
  console.log('===========================================');
  
  return { startTime: Date.now() };
}

/**
 * Función de teardown - se ejecuta una vez al finalizar
 */
export function teardown(data) {
  const duration = (Date.now() - data.startTime) / 1000;
  console.log('===========================================');
  console.log('Prueba de carga completada');
  console.log(`Duración: ${duration.toFixed(2)} segundos`);
  console.log('===========================================');
}