-- ==========================================================
-- analytics.sql — Capa analítica para el dashboard Kaa Iya
-- Ejecutar DESPUÉS de schema.sql en entornos nuevos.
-- ==========================================================
-- NOTA: REFRESH MATERIALIZED VIEW CONCURRENTLY no puede
-- ejecutarse dentro de una transacción. Los triggers usan
-- REFRESH sin CONCURRENTLY (bloqueo <5 ms en este volumen).
-- Los UNIQUE INDEX están presentes para que refrescos externos
-- (cron, endpoint de admin) puedan usar CONCURRENTLY.
-- ==========================================================


-- ----------------------------------------------------------
-- MATERIALIZED VIEWS
-- ----------------------------------------------------------

-- [analytics > mv_dashboard_resumen_global] ----------------
-- Una sola fila con todos los KPIs globales del sistema.

CREATE MATERIALIZED VIEW mv_dashboard_resumen_global AS
SELECT
  1                                                                              AS id,
  (SELECT COUNT(*)::int FROM empresas)                                           AS total_empresas,
  (SELECT COUNT(*)::int FROM organizaciones)                                     AS total_organizaciones,
  (SELECT COUNT(*)::int FROM proyectos)                                          AS total_proyectos,
  (SELECT COUNT(*)::int FROM proyectos WHERE id_area = 1)                        AS proyectos_conservacion,
  (SELECT COUNT(*)::int FROM proyectos WHERE id_area = 2)                        AS proyectos_desarrollo,
  (SELECT COUNT(*)::int FROM proyectos WHERE anio_fin IS NULL)                   AS proyectos_activos,
  (SELECT COUNT(DISTINCT id_empresa)::int    FROM proyectos_empresas)            AS empresas_con_proyectos,
  (SELECT COUNT(DISTINCT id_organizacion)::int FROM proyectos_organizaciones)    AS organizaciones_con_proyectos,
  (SELECT COUNT(*)::int FROM departamentos WHERE amazonico = TRUE)               AS departamentos_amazonicos,
  NOW()                                                                          AS ultima_actualizacion
WITH DATA;

CREATE UNIQUE INDEX idx_mv_resumen_global_id
  ON mv_dashboard_resumen_global (id);

-- [/analytics > mv_dashboard_resumen_global]


-- [analytics > mv_dashboard_por_region] --------------------
-- Una fila por departamento con métricas agregadas.
-- Empresas: vía departamentos_empresas (M:N)
-- Organizaciones: vía organizaciones.id_departamento (FK directo)
-- Proyectos: vía localidades_proyectos → municipios → departamentos

CREATE MATERIALIZED VIEW mv_dashboard_por_region AS
SELECT
  d.id_departamento,
  d.nombre                                                                       AS departamento,
  d.amazonico,
  COUNT(DISTINCT de.id_empresa)::int                                             AS total_empresas,
  COUNT(DISTINCT o.id_organizacion)::int                                         AS total_organizaciones,
  COUNT(DISTINCT p_dep.id_proyecto)::int                                         AS total_proyectos,
  COUNT(DISTINCT CASE WHEN p.id_area = 1 THEN p.id_proyecto END)::int           AS proyectos_conservacion,
  COUNT(DISTINCT CASE WHEN p.id_area = 2 THEN p.id_proyecto END)::int           AS proyectos_desarrollo
FROM departamentos d
LEFT JOIN departamentos_empresas de
       ON d.id_departamento = de.id_departamento
LEFT JOIN organizaciones o
       ON d.id_departamento = o.id_departamento
LEFT JOIN (
  SELECT lp.id_proyecto, mu.id_departamento
  FROM   localidades_proyectos lp
  JOIN   municipios mu ON lp.id_municipio = mu.id_municipio
) p_dep ON d.id_departamento = p_dep.id_departamento
LEFT JOIN proyectos p
       ON p_dep.id_proyecto = p.id_proyecto
GROUP BY d.id_departamento, d.nombre, d.amazonico
ORDER BY d.nombre
WITH DATA;

CREATE UNIQUE INDEX idx_mv_region_id_dep
  ON mv_dashboard_por_region (id_departamento);
CREATE INDEX idx_mv_region_amazonico
  ON mv_dashboard_por_region (amazonico);

-- [/analytics > mv_dashboard_por_region]


-- [analytics > mv_dashboard_timeline] ---------------------
-- Una fila por año con conteo de nuevos registros.
-- Usa los campos de año entero de cada entidad:
--   empresas.anio_inicio_apoyo
--   organizaciones.anio_inicio_trabajo
--   proyectos.anio_inicio
-- generate_series cubre desde el año más antiguo hasta hoy.

CREATE MATERIALIZED VIEW mv_dashboard_timeline AS
WITH year_range AS (
  SELECT
    COALESCE(
      LEAST(
        (SELECT MIN(anio_inicio_apoyo)   FROM empresas),
        (SELECT MIN(anio_inicio_trabajo) FROM organizaciones),
        (SELECT MIN(anio_inicio)         FROM proyectos)
      ),
      EXTRACT(YEAR FROM CURRENT_DATE)::int
    ) AS min_anio,
    EXTRACT(YEAR FROM CURRENT_DATE)::int AS max_anio
),
years AS (
  SELECT generate_series(min_anio, max_anio) AS anio
  FROM   year_range
),
emp AS (
  SELECT anio_inicio_apoyo   AS anio, COUNT(*)::int AS n
  FROM   empresas GROUP BY 1
),
org AS (
  SELECT anio_inicio_trabajo AS anio, COUNT(*)::int AS n
  FROM   organizaciones GROUP BY 1
),
proy AS (
  SELECT anio_inicio          AS anio, COUNT(*)::int AS n
  FROM   proyectos GROUP BY 1
)
SELECT
  y.anio,
  COALESCE(emp.n,  0) AS nuevas_empresas,
  COALESCE(org.n,  0) AS nuevas_organizaciones,
  COALESCE(proy.n, 0) AS nuevos_proyectos
FROM years y
LEFT JOIN emp  ON y.anio = emp.anio
LEFT JOIN org  ON y.anio = org.anio
LEFT JOIN proy ON y.anio = proy.anio
ORDER BY y.anio
WITH DATA;

CREATE UNIQUE INDEX idx_mv_timeline_anio
  ON mv_dashboard_timeline (anio);

-- [/analytics > mv_dashboard_timeline]


-- ----------------------------------------------------------
-- FUNCIÓN Y TRIGGERS DE REFRESCO AUTOMÁTICO
-- ----------------------------------------------------------

CREATE OR REPLACE FUNCTION refresh_dashboard_views()
RETURNS TRIGGER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW mv_dashboard_resumen_global;
  REFRESH MATERIALIZED VIEW mv_dashboard_por_region;
  REFRESH MATERIALIZED VIEW mv_dashboard_timeline;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_dashboard_refresh_empresas
AFTER INSERT OR UPDATE OR DELETE ON empresas
FOR EACH STATEMENT EXECUTE FUNCTION refresh_dashboard_views();

CREATE TRIGGER trg_dashboard_refresh_organizaciones
AFTER INSERT OR UPDATE OR DELETE ON organizaciones
FOR EACH STATEMENT EXECUTE FUNCTION refresh_dashboard_views();

CREATE TRIGGER trg_dashboard_refresh_proyectos
AFTER INSERT OR UPDATE OR DELETE ON proyectos
FOR EACH STATEMENT EXECUTE FUNCTION refresh_dashboard_views();
