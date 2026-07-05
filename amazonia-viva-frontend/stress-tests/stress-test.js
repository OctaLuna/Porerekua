/**
 * Porerekua - Prueba de Estrés
 * 
 * Objetivo: Evaluar límites del plan Free de Supabase y necesidad de upgrade
 * Escenario: 50 usuarios concurrentes durante 22 minutos
 * 
 * Ejecución: k6 run stress-tests/stress-test.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// ============================================================================
// MÉTRICAS PERSONALIZADAS
// ============================================================================

const errorRate = new Rate('errors');
const dbQueryTime = new Trend('db_query_time');
const frontendLoadTime = new Trend('frontend_load_time');
const searchQueryTime = new Trend('search_query_time');
const registrationSuccess = new Rate('registration_success');
const criticalErrors = new Counter('critical_errors');

// ============================================================================
// CONFIGURACIÓN DE PRUEBA
// ============================================================================

export const options = {
  scenarios: {
    // Escenario de estrés: carga pesada sostenida
    stress_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '3m', target: 20 },   // Ramp up a 20 usuarios
        { duration: '5m', target: 20 },   // Mantener 20 usuarios
        { duration: '2m', target: 50 },   // Ramp up a 50 usuarios
        { duration: '10m', target: 50 },  // Estrés por 10 minutos
        { duration: '2m', target: 0 },    // Ramp down
      ],
      exec: 'stressTest',
    },
  },
  
  // Umbrales de rendimiento más permisivos para estrés
  thresholds: {
    http_req_duration: ['p(95)<2000'],    // 95% de requests < 2 segundos
    http_req_failed: ['rate<0.1'],        // Error rate < 10%
    errors: ['rate<0.15'],                // Errores personalizados < 15%
    db_query_time: ['p(95)<1500'],        // Consultas DB < 1.5s
    frontend_load_time: ['p(95)<3000'],   // Carga frontend < 3s
    search_query_time: ['p(95)<1000'],    // Búsquedas < 1s
    registration_success: ['rate>0.8'],   // 80% de registros exitosos
  },
  
  // Configuración de red para carga pesada
  noConnectionReuse: false,
  insecureSkipTLSVerify: false,
  maxRedirects: 5,
};

// ============================================================================
// CONFIGURACIÓN DE ENTORNO
// ============================================================================

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const SUPABASE_URL = __ENV.SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = __ENV.SUPABASE_ANON_KEY || 'your-anon-key';

const headers = {
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation',
};

const SEARCH_TERMS = [
  'reforestación', 'comunidad', 'conservación', 'biodiversidad',
  'agua', 'amazonía', 'indígena', 'sostenible', 'ecosistema',
  'reforestación', 'comunidad', 'conservación',
];

// ============================================================================
// COMPORTAMIENTO DE USUARIO REALISTA
// ============================================================================

/**
 * Simula comportamiento realista de usuario bajo estrés
 */
function realisticUserBehavior() {
  const actions = [];
  const rand = Math.random();
  
  // Distribución de acciones bajo carga pesada
  if (rand < 0.35) {
    // 35%: Ver proyectos con búsqueda
    actions.push('view_projects');
    if (Math.random() < 0.5) actions.push('search_projects');
  } else if (rand < 0.60) {
    // 25%: Ver mapa interactivo
    actions.push('view_map');
    if (Math.random() < 0.6) actions.push('interact_map');
  } else if (rand < 0.80) {
    // 20%: Ver fundaciones
    actions.push('view_foundations');
  } else if (rand < 0.92) {
    // 12%: Registrarse
    actions.push('register');
  } else {
    // 8%: Ver investigaciones
    actions.push('view_investigations');
  }
  
  return actions;
}

/**
 * Simula interacción intensiva con el mapa
 */
function intensiveMapInteraction() {
  // Múltiples consultas para simular movimiento de mapa
  const interactions = [];
  
  // Consultar proyectos por región (simulando pan/zoom)
  for (let i = 0; i < 3; i++) {
    const lat = -13 + (Math.random() * 4); // Latitud aleatoria en Bolivia
    const lng = -67 + (Math.random() * 4); // Longitud aleatoria
    const radius = 0.5 + Math.random() * 1; // Radio de búsqueda
    
    interactions.push({
      lat: lat.toFixed(4),
      lng: lng.toFixed(4),
      radius: radius.toFixed(2)
    });
  }
  
  return interactions;
}

// ============================================================================
// FUNCIONES DE PRUEBA
// ============================================================================

function viewProjects() {
  const startTime = Date.now();
  const res = http.get(
    `${SUPABASE_URL}/rest/v1/projects?select=id,name,description,image_url,location,tags,foundation_id&order=created_at.desc&limit=20`,
    { headers }
  );
  dbQueryTime.add(Date.now() - startTime);
  
  check(res, {
    'projects loaded': (r) => r.status === 200,
    'has data': (r) => {
      try {
        return r.json().length > 0;
      } catch {
        return false;
      }
    },
  });
  
  errorRate.add(res.status !== 200);
  sleep(2 + Math.random() * 3);
}

function searchProjects() {
  const term = SEARCH_TERMS[Math.floor(Math.random() * SEARCH_TERMS.length)];
  
  const startTime = Date.now();
  const res = http.get(
    `${SUPABASE_URL}/rest/v1/projects?select=id,name,description,tags&name=ilike.*${term}*&order=name.asc&limit=15`,
    { headers }
  );
  searchQueryTime.add(Date.now() - startTime);
  
  check(res, {
    'search completed': (r) => r.status === 200,
    'valid results': (r) => {
      try {
        const data = r.json();
        return Array.isArray(data);
      } catch {
        return false;
      }
    },
  });
  
  errorRate.add(res.status !== 200);
  sleep(1 + Math.random() * 2);
}

function viewMap() {
  const startTime = Date.now();
  const res = http.get(`${BASE_URL}/georeferencia`);
  frontendLoadTime.add(Date.now() - startTime);
  
  check(res, { 'map page loaded': (r) => r.status === 200 });
  errorRate.add(res.status !== 200);
  sleep(2);
}

function interactWithMap() {
  const interactions = intensiveMapInteraction();
  
  for (const interaction of interactions) {
    const startTime = Date.now();
    const res = http.get(
      `${SUPABASE_URL}/rest/v1/projects?select=id,name,location&not=location.is.null&limit=30`,
      { headers }
    );
    dbQueryTime.add(Date.now() - startTime);
    
    check(res, {
      'map data loaded': (r) => r.status === 200,
    });
    
    errorRate.add(res.status !== 200);
    sleep(0.5 + Math.random());
  }
}

function viewFoundations() {
  const startTime = Date.now();
  const res = http.get(
    `${SUPABASE_URL}/rest/v1/foundations?select=id,name,description,logo_url&order=name.asc`,
    { headers }
  );
  dbQueryTime.add(Date.now() - startTime);
  
  check(res, {
    'foundations loaded': (r) => r.status === 200,
  });
  
  errorRate.add(res.status !== 200);
  sleep(2 + Math.random() * 2);
}

function registerOrganization() {
  const vuId = __VU;
  const timestamp = Date.now();
  const iteration = __ITER;
  
  const registrationData = {
    organization_name: `StressTest Org ${vuId}-${iteration}-${timestamp}`,
    personal_name: `Stress User ${vuId}`,
    email: `stresstest+${vuId}+${iteration}+${timestamp}@porerekua-test.com`,
    description: 'Organización creada durante prueba de estrés - Porerekua Platform',
    reason: 'Participar en conservación amazónica bajo condiciones de estrés',
    type: Math.random() < 0.5 ? 'organizacion' : 'empresa',
  };
  
  const startTime = Date.now();
  const res = http.post(
    `${SUPABASE_URL}/rest/v1/registrations`,
    JSON.stringify(registrationData),
    { headers }
  );
  dbQueryTime.add(Date.now() - startTime);
  
  const success = res.status === 201;
  registrationSuccess.add(success);
  
  if (!success) {
    criticalErrors.add(1);
    console.warn(`Registration failed for VU ${vuId}: ${res.status}`);
  }
  
  check(res, {
    'registration created': (r) => r.status === 201,
  });
  
  errorRate.add(!success);
  sleep(1 + Math.random() * 2);
}

function viewInvestigations() {
  const startTime = Date.now();
  const res = http.get(
    `${SUPABASE_URL}/rest/v1/investigations?select=id,title,authors,summary,image_url,pdf_url&order=created_at.desc`,
    { headers }
  );
  dbQueryTime.add(Date.now() - startTime);
  
  check(res, {
    'investigations loaded': (r) => r.status === 200,
  });
  
  errorRate.add(res.status !== 200);
  sleep(2 + Math.random() * 2);
}

// ============================================================================
// FUNCIÓN PRINCIPAL DE PRUEBA
// ============================================================================

export function stressTest() {
  // 1. Cargar página principal
  const homeStart = Date.now();
  let res = http.get(`${BASE_URL}/`);
  frontendLoadTime.add(Date.now() - homeStart);
  
  check(res, { 'home loaded': (r) => r.status === 200 });
  errorRate.add(res.status !== 200);
  sleep(1);
  
  // 2. Ejecutar comportamiento realista
  const actions = realisticUserBehavior();
  
  for (const action of actions) {
    try {
      switch (action) {
        case 'view_projects':
          viewProjects();
          break;
          
        case 'search_projects':
          searchProjects();
          break;
          
        case 'view_map':
          viewMap();
          break;
          
        case 'interact_map':
          interactWithMap();
          break;
          
        case 'view_foundations':
          viewFoundations();
          break;
          
        case 'register':
          registerOrganization();
          break;
          
        case 'view_investigations':
          viewInvestigations();
          break;
      }
    } catch (error) {
      criticalErrors.add(1);
      console.error(`Error in action ${action} for VU ${__VU}:`, error);
    }
  }
  
  // Pausa entre ciclos
  sleep(3 + Math.random() * 5);
}

// ============================================================================
// SETUP Y TEARDOWN
// ============================================================================

export function setup() {
  console.log('===========================================');
  console.log('Porerekua - Prueba de Estrés');
  console.log('===========================================');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Supabase URL: ${SUPABASE_URL}`);
  console.log('Objetivo: 50 usuarios concurrentes');
  console.log('===========================================');
  
  // Health check
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

export function teardown(data) {
  const duration = (Date.now() - data.startTime) / 1000;
  
  console.log('===========================================');
  console.log('Prueba de estrés completada');
  console.log(`Duración: ${duration.toFixed(2)} segundos`);
  console.log('===========================================');
  console.log('Métricas clave:');
  console.log(`- Error Rate: ${errorRate.values.rate ? (errorRate.values.rate * 100).toFixed(2) : 'N/A'}%`);
  console.log(`- Registration Success: ${registrationSuccess.values.rate ? (registrationSuccess.values.rate * 100).toFixed(2) : 'N/A'}%`);
  console.log(`- Critical Errors: ${criticalErrors.values.count || 0}`);
  console.log('===========================================');
}