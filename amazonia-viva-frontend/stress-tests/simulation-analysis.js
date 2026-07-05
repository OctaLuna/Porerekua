/**
 * Porerekua - Simulación y Análisis de Carga Esperada
 * 
 * Este script analiza la estructura actual de la aplicación (UI y datos mock)
 * y proyecta el comportamiento esperado cuando se conecte a Supabase.
 * 
 * Ejecución: node stress-tests/simulation-analysis.js
 */

// ============================================================================
// CONFIGURACIÓN DE SIMULACIÓN
// ============================================================================

const SIMULATION_CONFIG = {
  // Datos actuales (mock)
  currentData: {
    projects: 10,
    foundations: 3,
    investigations: 2,
  },
  
  // Proyección realista (cuando esté en producción)
  projectedData: {
    projects: 150,
    foundations: 25,
    investigations: 20,
    users_monthly: 100, // Plan Free Supabase
  },
  
  // Comportamiento de usuario simulado
  userBehavior: {
    avg_session_duration_minutes: 10,
    page_views_per_session: 4,
    search_queries_per_session: 3,
    map_interactions_per_session: 5,
    registration_conversion_rate: 0.05, // 5% se registran
  },
  
  // Configuración de Supabase Free Tier
  supabaseLimits: {
    database_size_mb: 500,
    bandwidth_gb_month: 2,
    api_requests: 'unlimited',
    concurrent_connections: 60,
    monthly_active_users: 50000,
  }
};

// ============================================================================
// ANÁLISIS DE ESTRUCTURA UI
// ============================================================================

/**
 * Analiza las páginas y componentes de la aplicación
 */
function analyzeAppStructure() {
  console.log('🔍 ANALIZANDO ESTRUCTURA DE LA APLICACIÓN\n');
  
  const pages = {
    HomePage: {
      path: '/',
      components: ['Header', 'Hero', 'Navigation', 'Footer'],
      apiCalls: 0,
      estimatedLoadTime: '500ms',
      complexity: 'Baja',
    },
    DataPage: {
      path: '/datos',
      components: ['Header', 'SearchBar', 'TiltCard (10+)', 'HorizontalScroller', 'Footer'],
      apiCalls: 2, // projects + foundations
      estimatedLoadTime: '1200ms',
      complexity: 'Media',
      notes: 'Tarjetas 3D con efectos de tilt y glare, scroll horizontal'
    },
    GeoreferencingPage: {
      path: '/georeferencia',
      components: ['Header', 'MapLibre GL', 'Markers', 'Popup', 'SearchBar'],
      apiCalls: 1, // projects con ubicación
      estimatedLoadTime: '2000ms',
      complexity: 'Alta',
      notes: 'Mapa interactivo con múltiples marcadores, WebGL'
    },
    InvestigacionesPage: {
      path: '/investigaciones',
      components: ['Header', 'CardList', 'Footer'],
      apiCalls: 1, // investigations
      estimatedLoadTime: '800ms',
      complexity: 'Baja',
    },
    RegistrationPage: {
      path: '/registro',
      components: ['Header', 'Form', 'Footer'],
      apiCalls: 1, // POST registration
      estimatedLoadTime: '600ms',
      complexity: 'Media',
      notes: 'Formulario con validación, POST a Supabase'
    },
    NosotrosPage: {
      path: '/nosotros',
      components: ['Header', 'Content', 'Footer'],
      apiCalls: 0,
      estimatedLoadTime: '400ms',
      complexity: 'Baja',
    },
    DashboardPage: {
      path: '/dashboard',
      components: ['Header', 'AdminPanel', 'Charts', 'Footer'],
      apiCalls: 3, // projects + foundations + stats
      estimatedLoadTime: '1500ms',
      complexity: 'Media',
    }
  };
  
  console.log('📄 PÁGINAS Y COMPONENTES:');
  Object.entries(pages).forEach(([name, page]) => {
    console.log(`\n  ${name} (${page.path})`);
    console.log(`    Componentes: ${page.components.join(', ')}`);
    console.log(`    API Calls: ${page.apiCalls}`);
    console.log(`    Load Time Est: ${page.estimatedLoadTime}`);
    console.log(`    Complejidad: ${page.complexity}`);
    if (page.notes) console.log(`    Notas: ${page.notes}`);
  });
  
  return pages;
}

// ============================================================================
// SIMULACIÓN DE COMPORTAMIENTO DE USUARIO
// ============================================================================

/**
 * Simula el comportamiento de usuarios en la aplicación
 */
function simulateUserBehavior(numUsers, durationMinutes) {
  console.log(`\n\n🎭 SIMULANDO ${numUsers} USUARIOS POR ${durationMinutes} MINUTOS\n`);
  
  // Distribución de páginas más visitadas (basado en UX típico)
  const pageDistribution = {
    HomePage: 0.30,        // 30% empieza en home
    DataPage: 0.25,        // 25% va a datos
    GeoreferencingPage: 0.20, // 20% va al mapa
    InvestigacionesPage: 0.10, // 10% investigaciones
    RegistrationPage: 0.05,    // 5% se registra
    NosotrosPage: 0.05,        // 5% nosotros
    DashboardPage: 0.05,       // 5% dashboard
  };
  
  // Acciones por página
  const actionsByPage = {
    HomePage: ['view_hero', 'click_navigation'],
    DataPage: ['view_projects', 'view_foundations', 'search', 'scroll_horizontal', 'open_details'],
    GeoreferencingPage: ['view_map', 'pan_map', 'zoom_map', 'click_marker', 'search'],
    InvestigacionesPage: ['view_list', 'open_pdf'],
    RegistrationPage: ['fill_form', 'submit_form'],
    NosotrosPage: ['read_content'],
    DashboardPage: ['view_stats', 'manage_projects'],
  };
  
  // Simular sesiones
  const sessions = [];
  const totalApiCalls = { projects: 0, foundations: 0, investigations: 0, registrations: 0 };
  const totalActions = {};
  
  for (let i = 0; i < numUsers; i++) {
    const session = {
      userId: i + 1,
      pages: [],
      actions: [],
      apiCalls: {},
      duration: Math.floor(Math.random() * 15) + 5, // 5-20 minutos
    };
    
    // Determinar páginas visitadas
    const numPages = Math.floor(Math.random() * 4) + 2; // 2-5 páginas por sesión
    let currentPage = 'HomePage';
    
    for (let j = 0; j < numPages; j++) {
      session.pages.push(currentPage);
      
      // Acciones en esta página
      const pageActions = actionsByPage[currentPage] || [];
      const numActions = Math.floor(Math.random() * 3) + 1;
      
      for (let k = 0; k < numActions; k++) {
        const action = pageActions[Math.floor(Math.random() * pageActions.length)];
        session.actions.push(action);
        
        // Contabilizar acciones
        totalActions[action] = (totalActions[action] || 0) + 1;
      }
      
      // Contabilizar llamadas API
      if (currentPage === 'DataPage') {
        totalApiCalls.projects++;
        totalApiCalls.foundations++;
      } else if (currentPage === 'GeoreferencingPage') {
        totalApiCalls.projects++;
      } else if (currentPage === 'InvestigacionesPage') {
        totalApiCalls.investigations++;
      } else if (currentPage === 'RegistrationPage') {
        totalApiCalls.registrations++;
      }
      
      // Mover a siguiente página (aleatorio basado en distribución)
      const rand = Math.random();
      let cumulative = 0;
      for (const [page, prob] of Object.entries(pageDistribution)) {
        cumulative += prob;
        if (rand < cumulative) {
          currentPage = page;
          break;
        }
      }
    }
    
    sessions.push(session);
  }
  
  // Calcular totales
  const totalSessionDuration = sessions.reduce((sum, s) => sum + s.duration, 0);
  const avgSessionDuration = totalSessionDuration / numUsers;
  const totalActionsCount = Object.values(totalActions).reduce((a, b) => a + b, 0);
  const totalApiCallsCount = Object.values(totalApiCalls).reduce((a, b) => a + b, 0);
  
  console.log('📊 RESULTADOS DE SIMULACIÓN:');
  console.log(`  Sesiones simuladas: ${numUsers}`);
  console.log(`  Duración promedio sesión: ${avgSessionDuration.toFixed(1)} minutos`);
  console.log(`  Total acciones: ${totalActionsCount}`);
  console.log(`  Total llamadas API: ${totalApiCallsCount}`);
  
  console.log('\n📞 LLAMADAS A API PROYECTADAS:');
  console.log(`  GET /projects: ${totalApiCalls.projects}`);
  console.log(`  GET /foundations: ${totalApiCalls.foundations}`);
  console.log(`  GET /investigations: ${totalApiCalls.investigations}`);
  console.log(`  POST /registrations: ${totalApiCalls.registrations}`);
  
  console.log('\n🎯 ACCIONES MÁS COMUNES:');
  Object.entries(totalActions)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([action, count]) => {
      console.log(`  ${action}: ${count} (${((count / totalActionsCount) * 100).toFixed(1)}%)`);
    });
  
  return {
    sessions,
    totalApiCalls,
    totalActions,
    avgSessionDuration,
  };
}

// ============================================================================
// PROYECCIÓN DE CARGA EN SUPABASE
// ============================================================================

/**
 * Proyecta la carga esperada en Supabase
 */
function projectSupabaseLoad(simulationData) {
  console.log('\n\n🗄️ PROYECCIÓN DE CARGA EN SUPABASE\n');
  
  const { totalApiCalls, avgSessionDuration } = simulationData;
  
  // Suposiciones basadas en plan Free (100 usuarios activos mensuales)
  const monthlyActiveUsers = 100;
  const sessionsPerUserPerMonth = 4; // 1 por semana
  const totalMonthlySessions = monthlyActiveUsers * sessionsPerUserPerMonth;
  
  // Multiplicar llamadas de simulación por factor mensual
  const monthlyMultiplier = totalMonthlySessions / 50; // simulation usó 50 users
  
  const monthlyApiCalls = {
    projects: Math.round(totalApiCalls.projects * monthlyMultiplier),
    foundations: Math.round(totalApiCalls.foundations * monthlyMultiplier),
    investigations: Math.round(totalApiCalls.investigations * monthlyMultiplier),
    registrations: Math.round(totalApiCalls.registrations * monthlyMultiplier),
  };
  
  const totalMonthlyApiCalls = Object.values(monthlyApiCalls).reduce((a, b) => a + b, 0);
  
  // Estimación de tamaño de datos
  const avgProjectSizeKB = 2; // JSON promedio por proyecto
  const avgFoundationSizeKB = 1;
  const avgInvestigationSizeKB = 1.5;
  const avgRegistrationSizeKB = 0.5;
  
  const dailyDataTransferKB = (
    (monthlyApiCalls.projects * avgProjectSizeKB) +
    (monthlyApiCalls.foundations * avgFoundationSizeKB) +
    (monthlyApiCalls.investigations * avgInvestigationSizeKB) +
    (monthlyApiCalls.registrations * avgRegistrationSizeKB)
  ) / 30;
  
  const monthlyDataTransferGB = (dailyDataTransferKB * 30) / (1024 * 1024);
  
  // Conexiones concurrentes estimadas
  const peakConcurrentUsers = Math.round(monthlyActiveUsers * 0.1); // 10% en hora pico
  const avgConcurrentConnections = peakConcurrentUsers * 2; // 2 conexiones por usuario (pooling)
  
  console.log('📈 MÉTRICAS MENSUALES PROYECTADAS:');
  console.log(`  Usuarios activos mensuales: ${monthlyActiveUsers}`);
  console.log(`  Sesiones totales mensuales: ${totalMonthlySessions}`);
  console.log(`  Duración promedio sesión: ${avgSessionDuration.toFixed(1)} minutos`);
  
  console.log('\n📞 LLAMADAS API MENSUALES:');
  console.log(`  GET /projects: ${monthlyApiCalls.projects.toLocaleString()}`);
  console.log(`  GET /foundations: ${monthlyApiCalls.foundations.toLocaleString()}`);
  console.log(`  GET /investigations: ${monthlyApiCalls.investigations.toLocaleString()}`);
  console.log(`  POST /registrations: ${monthlyApiCalls.registrations.toLocaleString()}`);
  console.log(`  Total: ${totalMonthlyApiCalls.toLocaleString()}`);
  
  console.log('\n💾 TRANSFERENCIA DE DATOS:');
  console.log(`  Promedio diario: ${dailyDataTransferKB.toFixed(2)} KB`);
  console.log(`  Promedio mensual: ${monthlyDataTransferGB.toFixed(4)} GB`);
  console.log(`  Límite Supabase Free: ${SIMULATION_CONFIG.supabaseLimits.bandwidth_gb_month} GB`);
  console.log(`  Uso del límite: ${((monthlyDataTransferGB / SIMULATION_CONFIG.supabaseLimits.bandwidth_gb_month) * 100).toFixed(2)}%`);
  
  console.log('\n🔗 CONEXIONES CONCURRENTES:');
  console.log(`  Usuarios pico simultáneos: ${peakConcurrentUsers}`);
  console.log(`  Conexiones estimadas: ${avgConcurrentConnections}`);
  console.log(`  Límite Supabase Free: ${SIMULATION_CONFIG.supabaseLimits.concurrent_connections}`);
  console.log(`  Uso del límite: ${((avgConcurrentConnections / SIMULATION_CONFIG.supabaseLimits.concurrent_connections) * 100).toFixed(2)}%`);
  
  // Evaluación de límites
  console.log('\n⚠️ EVALUACIÓN DE LÍMITES SUPABASE FREE:');
  
  const checks = [
    {
      name: 'Database Size',
      current: 0, // No hemos guardado datos aún
      limit: SIMULATION_CONFIG.supabaseLimits.database_size_mb,
      unit: 'MB',
      warning: false,
    },
    {
      name: 'Bandwidth',
      current: monthlyDataTransferGB,
      limit: SIMULATION_CONFIG.supabaseLimits.bandwidth_gb_month,
      unit: 'GB',
      warning: (monthlyDataTransferGB / SIMULATION_CONFIG.supabaseLimits.bandwidth_gb_month) > 0.7,
    },
    {
      name: 'Concurrent Connections',
      current: avgConcurrentConnections,
      limit: SIMULATION_CONFIG.supabaseLimits.concurrent_connections,
      unit: 'conn',
      warning: (avgConcurrentConnections / SIMULATION_CONFIG.supabaseLimits.concurrent_connections) > 0.7,
    },
    {
      name: 'Monthly Active Users',
      current: monthlyActiveUsers,
      limit: SIMULATION_CONFIG.supabaseLimits.monthly_active_users,
      unit: 'users',
      warning: (monthlyActiveUsers / SIMULATION_CONFIG.supabaseLimits.monthly_active_users) > 0.7,
    },
  ];
  
  checks.forEach(check => {
    const percentage = ((check.current / check.limit) * 100).toFixed(1);
    const status = check.warning ? '⚠️  PRECAUCIÓN' : '✅ OK';
    console.log(`  ${status} ${check.name}: ${check.current.toFixed(2)} / ${check.limit} ${check.unit} (${percentage}%)`);
  });
  
  return {
    monthlyApiCalls,
    totalMonthlyApiCalls,
    monthlyDataTransferGB,
    avgConcurrentConnections,
    checks,
  };
}

// ============================================================================
// RECOMENDACIONES
// ============================================================================

/**
 * Genera recomendaciones basadas en el análisis
 */
function generateRecommendations(projectionData) {
  console.log('\n\n💡 RECOMENDACIONES\n');
  
  const recommendations = [];
  
  // Verificar límites
  projectionData.checks.forEach(check => {
    if (check.warning) {
      recommendations.push({
        priority: 'ALTA',
        category: 'Infraestructura',
        issue: `${check.name}接近限制 (${((check.current / check.limit) * 100).toFixed(1)}%)`,
        action: `Considerar upgrade a Plan Pro ($25/mes) o implementar optimizaciones`,
      });
    }
  });
  
  // Recomendaciones basadas en uso de API
  if (projectionData.totalMonthlyApiCalls > 100000) {
    recommendations.push({
      priority: 'MEDIA',
      category: 'Performance',
      issue: 'Alto volumen de llamadas API',
      action: 'Implementar caching con React Query (staleTime: 5min) para reducir consultas en 60-80%',
    });
  }
  
  // Recomendaciones de optimización
  recommendations.push({
    priority: 'MEDIA',
    category: 'Frontend',
    issue: 'MapLibre GL puede ser pesado con muchos marcadores',
    action: 'Implementar clustering de marcadores y lazy loading de mapa',
  });
  
  recommendations.push({
    priority: 'MEDIA',
    category: 'Frontend',
    issue: 'TiltCard con efectos 3D consume recursos',
    action: 'Optimizar animaciones con will-change y reducir en dispositivos móviles',
  });
  
  recommendations.push({
    priority: 'BAJA',
    category: 'Imágenes',
    issue: 'Imágenes de proyectos/fundaciones',
    action: 'Usar CDN (CloudFront/Cloudflare) para imágenes, reducir carga en Supabase storage',
  });
  
  recommendations.push({
    priority: 'ALTA',
    category: 'Monitoreo',
    issue: 'Necesario monitoreo continuo',
    action: 'Implementar hooks de performance y Web Vitals para detectar problemas temprano',
  });
  
  console.log('📋 LISTA DE RECOMENDACIONES:\n');
  recommendations.forEach((rec, i) => {
    const priorityIcon = rec.priority === 'ALTA' ? '🔴' : rec.priority === 'MEDIA' ? '🟡' : '🟢';
    console.log(`${i + 1}. ${priorityIcon} [${rec.priority}] ${rec.category}`);
    console.log(`   Problema: ${rec.issue}`);
    console.log(`   Acción: ${rec.action}\n`);
  });
  
  // Resumen de costos proyectados
  console.log('💰 PROYECCIÓN DE COSTOS:\n');
  console.log('  Escenario Actual (100 usuarios/mes):');
  console.log('    Supabase Free: $0/mes');
  console.log('    CDN (opcional): $0-10/mes');
  console.log('    Total: $0-10/mes\n');
  
  console.log('  Escenario Crecimiento (500 usuarios/mes):');
  console.log('    Supabase Pro: $25/mes');
  console.log('    Add-ons: $2-5/mes');
  console.log('    CDN: $10-20/mes');
  console.log('    Total: $37-50/mes\n');
  
  console.log('  Escenario Alto (1000 usuarios/mes):');
  console.log('    Supabase Pro: $25/mes');
  console.log('    Database adicional: $2/mes');
  console.log('    Storage adicional: $2/mes');
  console.log('    Bandwidth adicional: $5/mes');
  console.log('    CDN: $20-30/mes');
  console.log('    Total: $54-64/mes\n');
  
  return recommendations;
}

// ============================================================================
// EJECUCIÓN PRINCIPAL
// ============================================================================

console.log('='.repeat(80));
console.log('POREREKUA - SIMULACIÓN Y ANÁLISIS DE CARGA ESPERADA');
console.log('='.repeat(80));
console.log(`Fecha: ${new Date().toISOString()}`);
console.log(`Datos actuales: ${SIMULATION_CONFIG.currentData.projects} proyectos, ${SIMULATION_CONFIG.currentData.foundations} fundaciones`);
console.log(`Proyección: ${SIMULATION_CONFIG.projectedData.projects} proyectos, ${SIMULATION_CONFIG.projectedData.foundations} fundaciones`);
console.log('='.repeat(80));

// 1. Analizar estructura de la aplicación
const appStructure = analyzeAppStructure();

// 2. Simular comportamiento de usuarios
const simulationData = simulateUserBehavior(50, 15); // 50 usuarios por 15 minutos

// 3. Proyectar carga en Supabase
const projectionData = projectSupabaseLoad(simulationData);

// 4. Generar recomendaciones
const recommendations = generateRecommendations(projectionData);

console.log('\n' + '='.repeat(80));
console.log('✅ ANÁLISIS COMPLETADO');
console.log('='.repeat(80));
console.log('\n📝 PRÓXIMOS PASOS:');
console.log('  1. Revisar recomendaciones de prioridad ALTA');
console.log('  2. Configurar Supabase con el script SQL proporcionado');
console.log('  3. Implementar optimizaciones sugeridas');
console.log('  4. Ejecutar pruebas de estrés reales con k6');
console.log('  5. Monitorear métricas en producción');
console.log('\n📊 Para ejecutar pruebas reales: k6 run stress-tests/base-load-test.js');
console.log('='.repeat(80));