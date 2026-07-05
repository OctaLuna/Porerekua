-- ============================================================================
-- CONFIGURACIÓN DE SUPABASE PARA MONITOREO DE RENDIMIENTO
-- ============================================================================
-- Ejecuta este script en el SQL Editor de Supabase para crear las tablas
-- necesarias para almacenar métricas de rendimiento y Web Vitals.
-- ============================================================================

-- ============================================================================
-- 1. TABLA DE MÉTRICAS DE RENDIMIENTO
-- ============================================================================

CREATE TABLE IF NOT EXISTS performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  component_name TEXT NOT NULL,
  render_time NUMERIC NOT NULL,
  memory_usage NUMERIC,
  is_slow BOOLEAN DEFAULT false,
  user_agent TEXT,
  url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para consultas eficientes
CREATE INDEX IF NOT EXISTS idx_performance_metrics_created_at 
  ON performance_metrics(created_at);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_component 
  ON performance_metrics(component_name);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_slow 
  ON performance_metrics(is_slow) WHERE is_slow = true;

-- ============================================================================
-- 2. TABLA DE WEB VITALS
-- ============================================================================

CREATE TABLE IF NOT EXISTS web_vitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  rating TEXT CHECK (rating IN ('good', 'needs-improvement', 'poor')),
  user_agent TEXT,
  url TEXT,
  connection_effective_type TEXT,
  connection_rtt NUMERIC,
  connection_downlink NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para Web Vitals
CREATE INDEX IF NOT EXISTS idx_web_vitals_created_at 
  ON web_vitals(created_at);
CREATE INDEX IF NOT EXISTS idx_web_vitals_metric_name 
  ON web_vitals(metric_name);
CREATE INDEX IF NOT EXISTS idx_web_vitals_rating 
  ON web_vitals(rating);

-- ============================================================================
-- 3. TABLA DE CONSULTAS LENTAS
-- ============================================================================

CREATE TABLE IF NOT EXISTS slow_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query_key TEXT NOT NULL,
  duration NUMERIC NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para consultas lentas
CREATE INDEX IF NOT EXISTS idx_slow_queries_created_at 
  ON slow_queries(created_at);
CREATE INDEX IF NOT EXISTS idx_slow_queries_duration 
  ON slow_queries(duration DESC);

-- ============================================================================
-- 4. VISTAS PARA ANÁLISIS
-- ============================================================================

-- Vista: Resumen de Web Vitals por hora
CREATE OR REPLACE VIEW web_vitals_hourly AS
SELECT 
  DATE_TRUNC('hour', created_at) AS hour,
  metric_name,
  rating,
  COUNT(*) AS count,
  AVG(metric_value) AS avg_value,
  MIN(metric_value) AS min_value,
  MAX(metric_value) AS max_value,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY metric_value) AS p95_value
FROM web_vitals
GROUP BY DATE_TRUNC('hour', created_at), metric_name, rating
ORDER BY hour DESC, metric_name;

-- Vista: Componentes más lentos
CREATE OR REPLACE VIEW slow_components AS
SELECT 
  component_name,
  COUNT(*) AS total_renders,
  AVG(render_time) AS avg_render_time,
  MAX(render_time) AS max_render_time,
  COUNT(*) FILTER (WHERE is_slow) AS slow_renders,
  ROUND(
    COUNT(*) FILTER (WHERE is_slow) * 100.0 / COUNT(*), 
    2
  ) AS slow_percentage
FROM performance_metrics
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY component_name
HAVING COUNT(*) > 10
ORDER BY avg_render_time DESC;

-- Vista: Resumen diario de Web Vitals
CREATE OR REPLACE VIEW web_vitals_daily_summary AS
SELECT 
  DATE_TRUNC('day', created_at) AS day,
  metric_name,
  COUNT(*) AS total_measurements,
  ROUND(AVG(metric_value), 2) AS avg_value,
  ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY metric_value), 2) AS median_value,
  ROUND(PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY metric_value), 2) AS p95_value,
  ROUND(
    COUNT(*) FILTER (WHERE rating = 'good') * 100.0 / COUNT(*), 
    2
  ) AS good_percentage,
  ROUND(
    COUNT(*) FILTER (WHERE rating = 'needs-improvement') * 100.0 / COUNT(*), 
    2
  ) AS needs_improvement_percentage,
  ROUND(
    COUNT(*) FILTER (WHERE rating = 'poor') * 100.0 / COUNT(*), 
    2
  ) AS poor_percentage
FROM web_vitals
GROUP BY DATE_TRUNC('day', created_at), metric_name
ORDER BY day DESC, metric_name;

-- ============================================================================
-- 5. FUNCIONES PARA ALERTAS
-- ============================================================================

-- Función: Verificar métricas críticas
CREATE OR REPLACE FUNCTION check_performance_alerts()
RETURNS TABLE (
  alert_type TEXT,
  severity TEXT,
  message TEXT,
  details JSONB
) AS $$
BEGIN
  -- Alerta: Consultas lentas recientes
  IF EXISTS (
    SELECT 1 FROM slow_queries 
    WHERE created_at > NOW() - INTERVAL '5 minutes'
    AND duration > 5000
  ) THEN
    RETURN QUERY
    SELECT 
      'slow_queries'::TEXT AS alert_type,
      'warning'::TEXT AS severity,
      'Consultas lentas detectadas (> 5s)'::TEXT AS message,
      jsonb_build_object(
        'count', (SELECT COUNT(*) FROM slow_queries WHERE created_at > NOW() - INTERVAL '5 minutes' AND duration > 5000),
        'max_duration', (SELECT MAX(duration) FROM slow_queries WHERE created_at > NOW() - INTERVAL '5 minutes' AND duration > 5000)
      ) AS details;
  END IF;

  -- Alerta: Web Vitals pobres
  IF EXISTS (
    SELECT 1 FROM web_vitals
    WHERE created_at > NOW() - INTERVAL '10 minutes'
    AND rating = 'poor'
  ) THEN
    RETURN QUERY
    SELECT 
      'poor_web_vitals'::TEXT AS alert_type,
      'warning'::TEXT AS severity,
      'Web Vitals pobres detectados'::TEXT AS message,
      jsonb_build_object(
        'count', (SELECT COUNT(*) FROM web_vitals WHERE created_at > NOW() - INTERVAL '10 minutes' AND rating = 'poor'),
        'metrics', (SELECT jsonb_agg(DISTINCT metric_name) FROM web_vitals WHERE created_at > NOW() - INTERVAL '10 minutes' AND rating = 'poor')
      ) AS details;
  END IF;

  -- Alerta: Alto porcentaje de renders lentos
  IF EXISTS (
    SELECT 1 FROM performance_metrics
    WHERE created_at > NOW() - INTERVAL '10 minutes'
    AND is_slow = true
    HAVING COUNT(*) * 100.0 / (SELECT COUNT(*) FROM performance_metrics WHERE created_at > NOW() - INTERVAL '10 minutes') > 20
  ) THEN
    RETURN QUERY
    SELECT 
      'slow_renders'::TEXT AS alert_type,
      'warning'::TEXT AS severity,
      'Alto porcentaje de renders lentos (> 20%)'::TEXT AS message,
      jsonb_build_object(
        'slow_count', (SELECT COUNT(*) FROM performance_metrics WHERE created_at > NOW() - INTERVAL '10 minutes' AND is_slow = true),
        'total_count', (SELECT COUNT(*) FROM performance_metrics WHERE created_at > NOW() - INTERVAL '10 minutes'),
        'percentage', (
          SELECT COUNT(*) * 100.0 / (SELECT COUNT(*) FROM performance_metrics WHERE created_at > NOW() - INTERVAL '10 minutes')
          FROM performance_metrics 
          WHERE created_at > NOW() - INTERVAL '10 minutes' AND is_slow = true
        )
      ) AS details;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 6. POLÍTICAS DE SEGURIDAD (RLS)
-- ============================================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE web_vitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE slow_queries ENABLE ROW LEVEL SECURITY;

-- Políticas para permitir inserción anónima (necesario para métricas del frontend)
CREATE POLICY "Allow anonymous insert on performance_metrics" 
  ON performance_metrics FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow anonymous insert on web_vitals" 
  ON web_vitals FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow anonymous insert on slow_queries" 
  ON slow_queries FOR INSERT 
  WITH CHECK (true);

-- Políticas para lectura (solo usuarios autenticados pueden ver métricas)
CREATE POLICY "Allow authenticated read on performance_metrics" 
  ON performance_metrics FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Allow authenticated read on web_vitals" 
  ON web_vitals FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Allow authenticated read on slow_queries" 
  ON slow_queries FOR SELECT 
  TO authenticated 
  USING (true);

-- ============================================================================
-- 7. TRIGGERS PARA LIMPIEZA AUTOMÁTICA
-- ============================================================================

-- Función para limpiar datos antiguos (más de 30 días)
CREATE OR REPLACE FUNCTION cleanup_old_metrics()
RETURNS void AS $$
BEGIN
  -- Eliminar métricas de rendimiento antiguas
  DELETE FROM performance_metrics 
  WHERE created_at < NOW() - INTERVAL '30 days';
  
  -- Eliminar Web Vitals antiguos
  DELETE FROM web_vitals 
  WHERE created_at < NOW() - INTERVAL '30 days';
  
  -- Eliminar consultas lentas antiguas
  DELETE FROM slow_queries 
  WHERE created_at < NOW() - INTERVAL '30 days';
  
  RAISE NOTICE 'Limpieza de métricas antiguas completada';
END;
$$ LANGUAGE plpgsql;

-- Programar limpieza diaria (usando pg_cron si está disponible)
-- SELECT cron.schedule('cleanup-old-metrics', '0 2 * * *', 'SELECT cleanup_old_metrics()');

-- ============================================================================
-- 8. CONSULTAS DE EJEMPLO
-- ============================================================================

-- Consulta: Resumen de Web Vitals de las últimas 24 horas
-- SELECT * FROM web_vitals_daily_summary WHERE day > NOW() - INTERVAL '1 day';

-- Consulta: Componentes más lentos
-- SELECT * FROM slow_components;

-- Consulta: Ejecutar verificación de alertas
-- SELECT * FROM check_performance_alerts();

-- ============================================================================
-- FIN DEL SCRIPT
-- ============================================================================