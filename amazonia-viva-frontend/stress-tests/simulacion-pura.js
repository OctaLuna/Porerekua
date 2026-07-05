/**
 * POREREKUA - SIMULACIÓN PURA DE CARGA (SIN SUPABASE)
 * 
 * Este script realiza cálculos matemáticos teóricos basados en:
 * - 1000 proyectos en la base de datos
 * - 100 usuarios activos por día
 * - 40 usuarios simultáneos en hora pico
 * - Estructura UI actual de la aplicación
 * 
 * Ejecución: node stress-tests/simulacion-pura.js
 */

console.log('='.repeat(100));
console.log('🧮 POREREKUA - SIMULACIÓN PURA DE CARGA (SIN CONEXIÓN A SUPABASE)');
console.log('='.repeat(100));
console.log(`📅 Fecha: ${new Date().toISOString()}`);
console.log('='.repeat(100));

// ============================================================================
// PARÁMETROS DE SIMULACIÓN
// ============================================================================

const PARAMS = {
  // Base de datos simulada - CONSIDERANDO TODOS LOS ATRIBUTOS REALES
  database: {
    projects: 1000,
    foundations: 100,
    investigations: 50,
    
    // Tamaño REAL de cada proyecto con TODOS sus atributos
    // id, name, description, imageUrl, location (lat/lng), tags (array), foundationId, created_at, updated_at
    avgProjectSizeKB: 8.5, // JSON completo con todos los campos
    
    // Fundación: id, name, description, logoUrl, created_at, updated_at
    avgFoundationSizeKB: 3.5,
    
    // Investigación: id, title, authors (array), summary, imageUrl, pdfUrl, created_at
    avgInvestigationSizeKB: 5.0,
    
    // Registro: id, organization_name, personal_name, email, description, reason, type, created_at
    avgRegistrationSizeKB: 2.0,
  },
  
  // Límites REALES de Supabase Free Tier
  supabaseFreeLimits: {
    databaseSizeMB: 500,
    bandwidthGBMonth: 2,
    apiRequestsMonth: 'unlimited', // Pero con límites de rate
    concurrentConnections: 60,
    monthlyActiveUsers: 50000,
    fileStorageGB: 1,
  },
  
  // Tráfico de usuarios
  traffic: {
    dailyActiveUsers: 100,
    peakConcurrentUsers: 40,
    avgSessionDurationMinutes: 12,
    pagesPerSession: 4.5,
    searchesPerSession: 3,
    mapInteractionsPerSession: 6,
    registrationRate: 0.08, // 8% se registran
  },
  
  // Comportamiento por página
  pageBehavior: {
    HomePage: {
      visitsPercent: 0.30,
      apiCalls: 0,
      avgTimeSeconds: 15,
      bounceRate: 0.20,
    },
    DataPage: {
      visitsPercent: 0.25,
      apiCalls: 2, // projects + foundations
      avgTimeSeconds: 45,
      searchesPerVisit: 2,
      scrollsPerVisit: 5,
    },
    GeoreferencingPage: {
      visitsPercent: 0.20,
      apiCalls: 1, // projects con ubicación
      avgTimeSeconds: 60,
      mapMovesPerVisit: 8,
      markerClicksPerVisit: 3,
    },
    InvestigacionesPage: {
      visitsPercent: 0.10,
      apiCalls: 1, // investigations
      avgTimeSeconds: 30,
      pdfDownloadsPerVisit: 0.5,
    },
    RegistrationPage: {
      visitsPercent: 0.05,
      apiCalls: 1, // POST registration
      avgTimeSeconds: 90,
      conversionRate: 0.60,
    },
    NosotrosPage: {
      visitsPercent: 0.05,
      apiCalls: 0,
      avgTimeSeconds: 25,
    },
    DashboardPage: {
      visitsPercent: 0.05,
      apiCalls: 3, // projects + foundations + stats
      avgTimeSeconds: 120,
    },
  },
};

// ============================================================================
// CÁLCULOS DE OPERACIONES POR SESIÓN
// ============================================================================

console.log('\n📐 1. CÁLCULO DE OPERACIONES POR SESIÓN DE USUARIO\n');

function calculateOperationsPerSession() {
  let totalApiCalls = 0;
  let totalActions = 0;
  let totalDataTransferKB = 0;
  
  const operations = {};
  
  Object.entries(PARAMS.pageBehavior).forEach(([page, config]) => {
    const visitsPerSession = PARAMS.traffic.pagesPerSession * config.visitsPercent;
    const apiCallsFromPage = visitsPerSession * config.apiCalls;
    
    operations[page] = {
      visitsPerSession: visitsPerSession,
      apiCallsPerSession: apiCallsFromPage,
      timeSpentSeconds: visitsPerSession * config.avgTimeSeconds,
    };
    
    totalApiCalls += apiCallsFromPage;
    totalActions += visitsPerSession;
    
    // Calcular transferencia de datos por página
    if (page === 'DataPage') {
      totalDataTransferKB += visitsPerSession * (
        PARAMS.database.projects * PARAMS.database.avgProjectSizeKB / 1000 + // Solo carga parcial
        PARAMS.database.foundations * PARAMS.database.avgFoundationSizeKB / 1000
      );
    } else if (page === 'GeoreferencingPage') {
      totalDataTransferKB += visitsPerSession * (
        PARAMS.database.projects * PARAMS.database.avgProjectSizeKB / 1000 // Solo proyectos con ubicación
      );
    } else if (page === 'InvestigacionesPage') {
      totalDataTransferKB += visitsPerSession * (
        PARAMS.database.investigations * PARAMS.database.avgInvestigationSizeKB / 1000
      );
    }
  });
  
  // Acciones adicionales
  const searchesPerSession = PARAMS.traffic.searchesPerSession;
  const mapInteractionsPerSession = PARAMS.traffic.mapInteractionsPerSession;
  const registrationsPerSession = PARAMS.traffic.registrationRate;
  
  totalActions += searchesPerSession + mapInteractionsPerSession;
  totalApiCalls += searchesPerSession; // Cada búsqueda es una llamada API
  
  // Transferencia por búsquedas (resultados más pequeños)
  totalDataTransferKB += searchesPerSession * 0.5; // 0.5KB por resultado de búsqueda
  
  // Transferencia por registros
  totalDataTransferKB += registrationsPerSession * 0.2; // 0.2KB por registro
  
  console.log('📊 OPERACIONES POR SESIÓN PROMEDIO:');
  console.log('─'.repeat(50));
  console.log(`  Páginas visitadas: ${PARAMS.traffic.pagesPerSession.toFixed(1)}`);
  console.log(`  Búsquedas realizadas: ${searchesPerSession}`);
  console.log(`  Interacciones con mapa: ${mapInteractionsPerSession}`);
  console.log(`  Registros completados: ${registrationsPerSession.toFixed(2)}`);
  console.log(`  Tiempo total en app: ${(PARAMS.traffic.avgSessionDurationMinutes).toFixed(0)} minutos`);
  console.log('─'.repeat(50));
  console.log(`  📞 Llamadas API totales: ${totalApiCalls.toFixed(2)}`);
  console.log(`  🎯 Acciones totales: ${totalActions.toFixed(2)}`);
  console.log(`  💾 Datos transferidos: ${totalDataTransferKB.toFixed(2)} KB`);
  console.log('');
  
  console.log('📄 DESGLOSE POR PÁGINA:');
  console.log('─'.repeat(50));
  Object.entries(operations).forEach(([page, ops]) => {
    console.log(`  ${page}:`);
    console.log(`    Visitas/sesión: ${ops.visitsPerSession.toFixed(2)}`);
    console.log(`    API calls/sesión: ${ops.apiCallsPerSession.toFixed(2)}`);
    console.log(`    Tiempo/sesión: ${ops.timeSpentSeconds.toFixed(0)}s`);
  });
  console.log('');
  
  return {
    totalApiCalls,
    totalActions,
    totalDataTransferKB,
    operations,
    searchesPerSession,
    mapInteractionsPerSession,
    registrationsPerSession,
  };
}

const sessionOps = calculateOperationsPerSession();

// ============================================================================
// PROYECCIÓN DIARIA (100 USUARIOS)
// ============================================================================

console.log('📅 2. PROYECCIÓN DE CARGA DIARIA (100 USUARIOS)\n');

function calculateDailyLoad() {
  const dailyUsers = PARAMS.traffic.dailyActiveUsers;
  
  const dailyStats = {
    totalSessions: dailyUsers,
    totalApiCalls: sessionOps.totalApiCalls * dailyUsers,
    totalActions: sessionOps.totalActions * dailyUsers,
    totalDataTransferKB: sessionOps.totalDataTransferKB * dailyUsers,
    totalDataTransferMB: (sessionOps.totalDataTransferKB * dailyUsers) / 1024,
    totalSearchQueries: sessionOps.searchesPerSession * dailyUsers,
    totalMapInteractions: sessionOps.mapInteractionsPerSession * dailyUsers,
    totalRegistrations: sessionOps.registrationsPerSession * dailyUsers,
    totalSessionMinutes: PARAMS.traffic.avgSessionDurationMinutes * dailyUsers,
    totalSessionHours: (PARAMS.traffic.avgSessionDurationMinutes * dailyUsers) / 60,
  };
  
  console.log('📊 ESTADÍSTICAS DIARIAS:');
  console.log('─'.repeat(50));
  console.log(`  Usuarios activos: ${dailyUsers}`);
  console.log(`  Sesiones totales: ${dailyStats.totalSessions}`);
  console.log(`  Tiempo total de uso: ${dailyStats.totalSessionHours.toFixed(1)} horas`);
  console.log('─'.repeat(50));
  console.log(`  📞 Llamadas API: ${dailyStats.totalApiCalls.toFixed(0)}`);
  console.log(`  🎯 Acciones de usuario: ${dailyStats.totalActions.toFixed(0)}`);
  console.log(`  🔍 Búsquedas: ${dailyStats.totalSearchQueries.toFixed(0)}`);
  console.log(`  🗺️  Interacciones mapa: ${dailyStats.totalMapInteractions.toFixed(0)}`);
  console.log(`  📝 Registros: ${dailyStats.totalRegistrations.toFixed(1)}`);
  console.log('─'.repeat(50));
  console.log(`  💾 Datos transferidos: ${dailyStats.totalDataTransferMB.toFixed(2)} MB`);
  console.log(`     (${dailyStats.totalDataTransferKB.toFixed(0)} KB)`);
  console.log('');
  
  // Distribución de llamadas API por tipo
  console.log('📞 DISTRIBUCIÓN DE LLAMADAS API POR DÍA:');
  console.log('─'.repeat(50));
  const apiDistribution = {
    'GET /projects (DataPage)': (dailyUsers * 0.25 * 2).toFixed(0), // 25% van a DataPage
    'GET /projects (Georeferencing)': (dailyUsers * 0.20 * 1).toFixed(0), // 20% van a Georeferencing
    'GET /foundations': (dailyUsers * 0.25 * 1).toFixed(0),
    'GET /investigations': (dailyUsers * 0.10 * 1).toFixed(0),
    'POST /registrations': dailyStats.totalRegistrations.toFixed(0),
    'Búsquedas (filter projects)': dailyStats.totalSearchQueries.toFixed(0),
  };
  
  Object.entries(apiDistribution).forEach(([type, count]) => {
    console.log(`  ${type}: ${count}`);
  });
  console.log(`  ──`);
  console.log(`  Total: ${dailyStats.totalApiCalls.toFixed(0)}`);
  console.log('');
  
  return dailyStats;
}

const dailyStats = calculateDailyLoad();

// ============================================================================
// PROYECCIÓN MENSUAL (30 DÍAS)
// ============================================================================

console.log('📅 3. PROYECCIÓN DE CARGA MENSUAL (30 DÍAS)\n');

function calculateMonthlyLoad() {
  const days = 30;
  
  const monthlyStats = {
    totalUsers: PARAMS.traffic.dailyActiveUsers * days,
    totalSessions: dailyStats.totalSessions * days,
    totalApiCalls: dailyStats.totalApiCalls * days,
    totalActions: dailyStats.totalActions * days,
    totalDataTransferMB: dailyStats.totalDataTransferMB * days,
    totalDataTransferGB: (dailyStats.totalDataTransferMB * days) / 1024,
    totalSearchQueries: dailyStats.totalSearchQueries * days,
    totalMapInteractions: dailyStats.totalMapInteractions * days,
    totalRegistrations: dailyStats.totalRegistrations * days,
  };
  
  console.log('📊 ESTADÍSTICAS MENSUALES:');
  console.log('─'.repeat(50));
  console.log(`  Usuarios activos mensuales: ${monthlyStats.totalUsers}`);
  console.log(`  Sesiones totales: ${monthlyStats.totalSessions}`);
  console.log(`  Tiempo total de uso: ${(monthlyStats.totalSessions * PARAMS.traffic.avgSessionDurationMinutes / 60).toFixed(0)} horas`);
  console.log('─'.repeat(50));
  console.log(`  📞 Llamadas API: ${monthlyStats.totalApiCalls.toFixed(0)}`);
  console.log(`  🎯 Acciones de usuario: ${monthlyStats.totalActions.toFixed(0)}`);
  console.log(`  🔍 Búsquedas: ${monthlyStats.totalSearchQueries.toFixed(0)}`);
  console.log(`  🗺️  Interacciones mapa: ${monthlyStats.totalMapInteractions.toFixed(0)}`);
  console.log(`  📝 Registros: ${monthlyStats.totalRegistrations.toFixed(0)}`);
  console.log('─'.repeat(50));
  console.log(`  💾 Datos transferidos: ${monthlyStats.totalDataTransferGB.toFixed(2)} GB`);
  console.log(`     (${monthlyStats.totalDataTransferMB.toFixed(0)} MB)`);
  console.log('');
  
  return monthlyStats;
}

const monthlyStats = calculateMonthlyLoad();

// ============================================================================
// HORA PICO (40 USUARIOS SIMULTÁNEOS)
// ============================================================================

console.log('⚡ 4. ANÁLISIS DE HORA PICO (40 USUARIOS SIMULTÁNEOS)\n');

function calculatePeakHourLoad() {
  const peakUsers = PARAMS.traffic.peakConcurrentUsers;
  const peakDurationMinutes = 60;
  
  // Calcular sesiones durante la hora pico
  const sessionsDuringPeak = peakUsers * (peakDurationMinutes / PARAMS.traffic.avgSessionDurationMinutes);
  
  const peakStats = {
    concurrentUsers: peakUsers,
    sessionsInPeakHour: sessionsDuringPeak,
    apiCallsPerMinute: (sessionsDuringPeak * sessionOps.totalApiCalls) / peakDurationMinutes,
    apiCallsPerSecond: ((sessionsDuringPeak * sessionOps.totalApiCalls) / peakDurationMinutes) / 60,
    actionsPerMinute: (sessionsDuringPeak * sessionOps.totalActions) / peakDurationMinutes,
    dataTransferPerMinuteKB: (sessionsDuringPeak * sessionOps.totalDataTransferKB) / peakDurationMinutes,
    dataTransferPerSecondKB: ((sessionsDuringPeak * sessionOps.totalDataTransferKB) / peakDurationMinutes) / 60,
  };
  
  console.log('📊 MÉTRICAS DE HORA PICO:');
  console.log('─'.repeat(50));
  console.log(`  Usuarios simultáneos: ${peakUsers}`);
  console.log(`  Duración de hora pico: ${peakDurationMinutes} minutos`);
  console.log(`  Sesiones durante hora pico: ${peakStats.sessionsInPeakHour.toFixed(1)}`);
  console.log('─'.repeat(50));
  console.log(`  📞 Llamadas API/minuto: ${peakStats.apiCallsPerMinute.toFixed(1)}`);
  console.log(`  📞 Llamadas API/segundo: ${peakStats.apiCallsPerSecond.toFixed(2)}`);
  console.log(`  🎯 Acciones/minuto: ${peakStats.actionsPerMinute.toFixed(1)}`);
  console.log('─'.repeat(50));
  console.log(`  💾 Datos/minuto: ${peakStats.dataTransferPerMinuteKB.toFixed(2)} KB`);
  console.log(`  💾 Datos/segundo: ${peakStats.dataTransferPerSecondKB.toFixed(2)} KB`);
  console.log('');
  
  // Calcular requerimientos de conexiones simultáneas
  console.log('🔗 REQUERIMIENTOS DE CONEXIONES SIMULTÁNEAS:');
  console.log('─'.repeat(50));
  const avgConnectionsPerUser = 2; // Pool de conexiones típico
  const totalConcurrentConnections = peakUsers * avgConnectionsPerUser;
  console.log(`  Conexiones por usuario: ${avgConnectionsPerUser}`);
  console.log(`  Total conexiones simultáneas: ${totalConcurrentConnections}`);
  console.log(`  Margen de seguridad (20%): ${Math.ceil(totalConcurrentConnections * 1.2)}`);
  console.log('');
  
  return peakStats;
}

const peakStats = calculatePeakHourLoad();

// ============================================================================
// ANÁLISIS DE RECURSOS NECESARIOS
// ============================================================================

console.log('💻 5. ESTIMACIÓN DE RECURSOS DE SERVIDOR\n');

function estimateServerResources() {
  // CPU estimation (basado en operaciones por segundo)
  const avgCpuPerRequest = 0.05; // 5% de CPU por request (estimado conservador)
  const peakCpuNeeded = peakStats.apiCallsPerSecond * avgCpuPerRequest * 100;
  
  // Memory estimation
  const baseMemoryMB = 512; // Memoria base del sistema
  const memoryPerConnection = 2; // MB por conexión
  const memoryForConnections = peakStats.concurrentUsers * 2 * memoryPerConnection;
  const memoryForCache = 256; // Cache de datos frecuentes
  const totalMemoryMB = baseMemoryMB + memoryForConnections + memoryForCache;
  
  // Storage estimation
  const databaseSizeGB = (PARAMS.database.projects * PARAMS.database.avgProjectSizeKB + 
                         PARAMS.database.foundations * PARAMS.database.avgFoundationSizeKB +
                         PARAMS.database.investigations * PARAMS.database.avgInvestigationSizeKB) / (1024 * 1024);
  const logsAndSystemGB = 2;
  const growthPerMonthGB = monthlyStats.totalDataTransferGB * 0.1; // 10% de crecimiento mensual
  const totalStorageGB = databaseSizeGB + logsAndSystemGB + (growthPerMonthGB * 6); // 6 meses de crecimiento
  
  console.log('📊 RECURSOS DE SERVIDOR ESTIMADOS:');
  console.log('─'.repeat(50));
  console.log('🖥️  CPU:');
  console.log(`   Requests/segundo pico: ${peakStats.apiCallsPerSecond.toFixed(2)}`);
  console.log(`   CPU necesaria (pico): ${peakCpuNeeded.toFixed(1)}%`);
  console.log(`   CPUs recomendados: ${Math.ceil(peakCpuNeeded / 80)}`); // 80% max por CPU
  console.log('');
  console.log('💾 MEMORIA RAM:');
  console.log(`   Memoria base: ${baseMemoryMB} MB`);
  console.log(`   Memoria para conexiones: ${memoryForConnections} MB`);
  console.log(`   Memoria para cache: ${memoryForCache} MB`);
  console.log(`   Total recomendado: ${Math.ceil(totalMemoryMB / 512) * 512} MB`); // Redondear a 512MB
  console.log('');
  console.log('🗄️  ALMACENAMIENTO:');
  console.log(`   Base de datos: ${databaseSizeGB.toFixed(2)} GB`);
  console.log(`   Logs y sistema: ${logsAndSystemGB} GB`);
  console.log(`   Crecimiento 6 meses: ${(growthPerMonthGB * 6).toFixed(2)} GB`);
  console.log(`   Total recomendado: ${Math.ceil(totalStorageGB)} GB`);
  console.log('');
  
  // Network bandwidth
  const avgBandwidthMbps = (peakStats.dataTransferPerSecondKB * 8) / 1000; // Convertir KB/s a Mbps
  const peakBandwidthMbps = avgBandwidthMbps * 3; // Picos de 3x el promedio
  
  console.log('🌐 ANCHO DE BANDA:');
  console.log(`   Promedio: ${avgBandwidthMbps.toFixed(2)} Mbps`);
  console.log(`   Picos: ${peakBandwidthMbps.toFixed(2)} Mbps`);
  console.log(`   Recomendado: ${Math.ceil(peakBandwidthMbps * 1.5)} Mbps`); // 50% margen
  console.log('');
  
  return {
    cpuCores: Math.ceil(peakCpuNeeded / 80),
    memoryMB: Math.ceil(totalMemoryMB / 512) * 512,
    storageGB: Math.ceil(totalStorageGB),
    bandwidthMbps: Math.ceil(peakBandwidthMbps * 1.5),
  };
}

const serverResources = estimateServerResources();

// ============================================================================
// RESUMEN EJECUTIVO
// ============================================================================

console.log('📋 6. RESUMEN EJECUTIVO\n');
console.log('═'.repeat(50));
console.log('🎯 ESCENARIO SIMULADO:');
console.log('─'.repeat(50));
console.log(`  • Base de datos: ${PARAMS.database.projects} proyectos, ${PARAMS.database.foundations} fundaciones`);
console.log(`  • Usuarios diarios: ${PARAMS.traffic.dailyActiveUsers}`);
console.log(`  • Usuarios simultáneos pico: ${PARAMS.traffic.peakConcurrentUsers}`);
console.log(`  • Sesiones por día: ${dailyStats.totalSessions}`);
console.log('');
console.log('📊 MÉTRICAS CLAVE:');
console.log('─'.repeat(50));
console.log(`  • Llamadas API/día: ${dailyStats.totalApiCalls.toFixed(0)}`);
console.log(`  • Llamadas API/mes: ${monthlyStats.totalApiCalls.toFixed(0)}`);
console.log(`  • Datos transferidos/día: ${dailyStats.totalDataTransferMB.toFixed(2)} MB`);
console.log(`  • Datos transferidos/mes: ${monthlyStats.totalDataTransferGB.toFixed(2)} GB`);
console.log(`  • Requests/segundo (pico): ${peakStats.apiCallsPerSecond.toFixed(2)}`);
console.log('');
console.log('💻 RECURSOS RECOMENDADOS:');
console.log('─'.repeat(50));
console.log(`  • CPU: ${serverResources.cpuCores} núcleo(s)`);
console.log(`  • RAM: ${serverResources.memoryMB} MB`);
console.log(`  • Almacenamiento: ${serverResources.storageGB} GB`);
console.log(`  • Ancho de banda: ${serverResources.bandwidthMbps} Mbps`);
console.log('═'.repeat(50));
console.log('');

// ============================================================================
// COMPARACIÓN CON LÍMITES DE SUPABASE FREE TIER
// ============================================================================

console.log('🆚 7. COMPARACIÓN CON LÍMITES DE SUPABASE FREE TIER\n');

function compareWithSupabaseFree() {
  const limits = PARAMS.supabaseFreeLimits;
  
  // Calcular tamaño total de la base de datos
  const totalDBSizeKB = (
    PARAMS.database.projects * PARAMS.database.avgProjectSizeKB +
    PARAMS.database.foundations * PARAMS.database.avgFoundationSizeKB +
    PARAMS.database.investigations * PARAMS.database.avgInvestigationSizeKB
  );
  const totalDBSizeMB = totalDBSizeKB / 1024;
  
  // Calcular bandwidth mensual
  const monthlyBandwidthGB = monthlyStats.totalDataTransferGB;
  
  // Calcular conexiones simultáneas
  const peakConcurrentConnections = PARAMS.traffic.peakConcurrentUsers * 2;
  
  // Usuarios activos mensuales
  const monthlyActiveUsers = PARAMS.traffic.dailyActiveUsers * 30;
  
  console.log('📊 TAMAÑO DE BASE DE DATOS:');
  console.log('─'.repeat(50));
  console.log(`  Proyectos: ${PARAMS.database.projects} × ${PARAMS.database.avgProjectSizeKB} KB = ${(PARAMS.database.projects * PARAMS.database.avgProjectSizeKB / 1024).toFixed(2)} MB`);
  console.log(`  Fundaciones: ${PARAMS.database.foundations} × ${PARAMS.database.avgFoundationSizeKB} KB = ${(PARAMS.database.foundations * PARAMS.database.avgFoundationSizeKB / 1024).toFixed(2)} MB`);
  console.log(`  Investigaciones: ${PARAMS.database.investigations} × ${PARAMS.database.avgInvestigationSizeKB} KB = ${(PARAMS.database.investigations * PARAMS.database.avgInvestigationSizeKB / 1024).toFixed(2)} MB`);
  console.log(`  ──`);
  console.log(`  Total: ${totalDBSizeMB.toFixed(2)} MB`);
  console.log(`  Límite Supabase Free: ${limits.databaseSizeMB} MB`);
  
  const dbUsagePercent = (totalDBSizeMB / limits.databaseSizeMB) * 100;
  const dbStatus = dbUsagePercent > 80 ? '🔴 CRÍTICO' : dbUsagePercent > 60 ? '🟡 PRECAUCIÓN' : '🟢 OK';
  console.log(`  Uso: ${dbStatus} (${dbUsagePercent.toFixed(1)}%)`);
  console.log('');
  
  console.log('📊 BANDWIDTH MENSUAL:');
  console.log('─'.repeat(50));
  console.log(`  Datos transferidos/mes: ${monthlyBandwidthGB.toFixed(4)} GB`);
  console.log(`  Límite Supabase Free: ${limits.bandwidthGBMonth} GB`);
  
  const bandwidthUsagePercent = (monthlyBandwidthGB / limits.bandwidthGBMonth) * 100;
  const bandwidthStatus = bandwidthUsagePercent > 80 ? '🔴 CRÍTICO' : bandwidthUsagePercent > 60 ? '🟡 PRECAUCIÓN' : '🟢 OK';
  console.log(`  Uso: ${bandwidthStatus} (${bandwidthUsagePercent.toFixed(2)}%)`);
  console.log('');
  
  console.log('📊 CONEXIONES SIMULTÁNEAS:');
  console.log('─'.repeat(50));
  console.log(`  Conexiones pico estimadas: ${peakConcurrentConnections}`);
  console.log(`  Límite Supabase Free: ${limits.concurrentConnections}`);
  
  const connUsagePercent = (peakConcurrentConnections / limits.concurrentConnections) * 100;
  const connStatus = connUsagePercent > 80 ? '🔴 CRÍTICO' : connUsagePercent > 60 ? '🟡 PRECAUCIÓN' : '🟢 OK';
  console.log(`  Uso: ${connStatus} (${connUsagePercent.toFixed(1)}%)`);
  console.log('');
  
  console.log('📊 USUARIOS ACTIVOS MENSUALES:');
  console.log('─'.repeat(50));
  console.log(`  Usuarios activos/mes: ${monthlyActiveUsers}`);
  console.log(`  Límite Supabase Free: ${limits.monthlyActiveUsers}`);
  
  const userUsagePercent = (monthlyActiveUsers / limits.monthlyActiveUsers) * 100;
  const userStatus = userUsagePercent > 80 ? '🔴 CRÍTICO' : userUsagePercent > 60 ? '🟡 PRECAUCIÓN' : '🟢 OK';
  console.log(`  Uso: ${userStatus} (${userUsagePercent.toFixed(2)}%)`);
  console.log('');
  
  // Resumen final
  console.log('📋 RESUMEN DE COMPATIBILIDAD CON SUPABASE FREE:');
  console.log('═'.repeat(50));
  
  const allChecks = [
    { name: 'Database Size', percent: dbUsagePercent, status: dbStatus },
    { name: 'Bandwidth', percent: bandwidthUsagePercent, status: bandwidthStatus },
    { name: 'Conexiones', percent: connUsagePercent, status: connStatus },
    { name: 'Usuarios', percent: userUsagePercent, status: userStatus },
  ];
  
  let overallStatus = '🟢 COMPATIBLE';
  let recommendations = [];
  
  allChecks.forEach(check => {
    console.log(`  ${check.status} ${check.name}: ${check.percent.toFixed(1)}%`);
  });
  
  console.log('');
  console.log('═'.repeat(50));
  
  // Determinar estado general
  const hasCritical = allChecks.some(c => c.percent > 80);
  const hasWarning = allChecks.some(c => c.percent > 60 && c.percent <= 80);
  
  if (hasCritical) {
    console.log('🔴 ESTADO GENERAL: NO COMPATIBLE CON SUPABASE FREE');
    console.log('   Se requiere upgrade a Plan Pro ($25/mes)');
  } else if (hasWarning) {
    console.log('🟡 ESTADO GENERAL: COMPATIBLE CON PRECAUCIÓN');
    console.log('   Funciona pero monitorear de cerca');
  } else {
    console.log('🟢 ESTADO GENERAL: TOTALMENTE COMPATIBLE');
    console.log('   Puede usar Supabase Free sin problemas');
  }
  
  console.log('');
  console.log('💡 RECOMENDACIONES:');
  console.log('─'.repeat(50));
  
  if (dbUsagePercent > 60) {
    console.log('  • Database: Considerar limpiar datos antiguos o upgrade');
  }
  if (bandwidthUsagePercent > 60) {
    console.log('  • Bandwidth: Implementar CDN para reducir carga');
  }
  if (connUsagePercent > 60) {
    console.log('  • Conexiones: Habilitar connection pooling');
  }
  if (hasCritical || hasWarning) {
    console.log('  • Plan Pro: $25/mes + add-ons recomendados');
  }
  
  console.log('');
}

compareWithSupabaseFree();

// ============================================================================
// FIN DEL SCRIPT
// ============================================================================

console.log('✅ SIMULACIÓN COMPLETADA');
console.log('');
console.log('📝 ESTOS SON CÁLCULOS TEÓRICOS BASADOS EN:');
console.log('   1. Estructura UI actual de la aplicación');
console.log('   2. Comportamiento típico de usuarios en aplicaciones similares');
console.log('   3. Tamaño REAL de proyectos con todos sus atributos (8.5KB c/u)');
console.log('   4. Patrones de navegación web estándar');
console.log('   5. Límites oficiales de Supabase Free Tier');
console.log('');
console.log('🔍 PRÓXIMOS PASOS RECOMENDADOS:');
console.log('   1. Comparar con métricas reales cuando se conecte Supabase');
console.log('   2. Ajustar parámetros según comportamiento real');
console.log('   3. Ejecutar pruebas de estrés con k6 para validar');
console.log('   4. Monitorear continuamente y optimizar');
console.log('');
console.log('═'.repeat(50));
