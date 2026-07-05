-- ==========================================================
-- analytics-v2.sql — Expansión del dashboard amazónico
-- Ejecutar DESPUÉS de analytics.sql y analytics-proyectos.sql.
-- ==========================================================
-- Cambios:
--   1. DROP + RECREATE mv_dashboard_resumen_global (8 campos nuevos)
--   2. CREATE mv_dashboard_por_tipo (nueva)
--   3. CREATE mv_empresas_detalle (nueva)
--   4. UPDATE refresh_dashboard_views() con las 3 nuevas vistas
-- ==========================================================


-- ----------------------------------------------------------
-- 1. EXPANDIR mv_dashboard_resumen_global
--    PostgreSQL no tiene CREATE OR REPLACE MATERIALIZED VIEW.
--    Se elimina la existente y se recrea con los campos nuevos.
-- ----------------------------------------------------------

DROP MATERIALIZED VIEW IF EXISTS mv_dashboard_resumen_global CASCADE;

CREATE MATERIALIZED VIEW mv_dashboard_resumen_global AS
SELECT
  1                                                                              AS id,

  -- Totales de entidades
  (SELECT COUNT(*)::int FROM empresas)                                           AS total_empresas,
  (SELECT COUNT(*)::int FROM organizaciones)                                     AS total_organizaciones,
  (SELECT COUNT(*)::int FROM proyectos)                                          AS total_proyectos,

  -- Proyectos por área
  (SELECT COUNT(*)::int FROM proyectos WHERE id_area = 1)                        AS proyectos_conservacion,
  (SELECT COUNT(*)::int FROM proyectos WHERE id_area = 2)                        AS proyectos_desarrollo,

  -- Estado de proyectos
  (SELECT COUNT(*)::int FROM proyectos WHERE anio_fin IS NULL)                   AS proyectos_activos,
  (SELECT COUNT(*)::int FROM proyectos WHERE anio_fin IS NOT NULL)               AS proyectos_finalizados,

  -- Participación en proyectos
  (SELECT COUNT(DISTINCT id_empresa)::int    FROM proyectos_empresas)            AS empresas_con_proyectos,
  (SELECT COUNT(DISTINCT id_organizacion)::int FROM proyectos_organizaciones)    AS organizaciones_con_proyectos,

  -- Alcance geográfico
  (SELECT COUNT(*)::int FROM departamentos WHERE amazonico = TRUE)               AS departamentos_amazonicos,
  (SELECT COUNT(DISTINCT id_municipio)::int FROM localidades_proyectos)          AS municipios_cubiertos,
  (SELECT COUNT(DISTINCT id_comunidad)::int
   FROM localidades_proyectos WHERE id_comunidad IS NOT NULL)                   AS comunidades_indigenas_beneficiadas,

  -- Desglose organizaciones
  (SELECT COUNT(*)::int FROM organizaciones WHERE es_nacional = TRUE)            AS organizaciones_nacionales,
  (SELECT COUNT(*)::int FROM organizaciones WHERE es_nacional = FALSE)           AS organizaciones_internacionales,

  -- Cobertura ODS
  (SELECT COUNT(DISTINCT id_ods)::int FROM ods_empresas)                         AS total_ods_cubiertos,

  -- Rango temporal
  COALESCE(
    LEAST(
      (SELECT MIN(anio_inicio_apoyo)   FROM empresas),
      (SELECT MIN(anio_inicio_trabajo) FROM organizaciones),
      (SELECT MIN(anio_inicio)         FROM proyectos)
    ), EXTRACT(YEAR FROM CURRENT_DATE)::int
  )                                                                              AS anio_inicio_mas_antiguo,
  COALESCE(
    GREATEST(
      (SELECT MAX(anio_inicio_apoyo)   FROM empresas),
      (SELECT MAX(anio_inicio_trabajo) FROM organizaciones),
      (SELECT MAX(anio_inicio)         FROM proyectos)
    ), EXTRACT(YEAR FROM CURRENT_DATE)::int
  )                                                                              AS anio_inicio_mas_reciente,

  NOW()                                                                          AS ultima_actualizacion
WITH DATA;

CREATE UNIQUE INDEX idx_mv_resumen_global_id ON mv_dashboard_resumen_global (id);


-- ----------------------------------------------------------
-- 2. NUEVA VISTA: mv_dashboard_por_tipo
--    Una fila por combinación (área, tipo de proyecto) real.
-- ----------------------------------------------------------

CREATE MATERIALIZED VIEW mv_dashboard_por_tipo AS
SELECT
  p.id_area,
  a.nombre                                                                        AS area,
  p.id_tipo,
  tp.nombre                                                                       AS tipo_proyecto,
  COUNT(DISTINCT p.id_proyecto)::int                                              AS total_proyectos,
  COUNT(DISTINCT p.id_proyecto) FILTER (WHERE p.anio_fin IS NULL)::int           AS proyectos_activos,
  COUNT(DISTINCT p.id_proyecto) FILTER (WHERE p.anio_fin IS NOT NULL)::int       AS proyectos_finalizados,
  COUNT(DISTINCT pe.id_empresa)::int                                              AS empresas_participantes,
  COUNT(DISTINCT po.id_organizacion)::int                                         AS organizaciones_participantes,
  COUNT(DISTINCT mu.id_departamento)::int                                         AS departamentos_cubiertos
FROM proyectos p
JOIN areas         a  ON p.id_area  = a.id_area
JOIN tipos_proyectos tp ON p.id_tipo = tp.id_tipo
LEFT JOIN proyectos_empresas       pe ON p.id_proyecto = pe.id_proyecto
LEFT JOIN proyectos_organizaciones po ON p.id_proyecto = po.id_proyecto
LEFT JOIN localidades_proyectos    lp ON p.id_proyecto = lp.id_proyecto
LEFT JOIN municipios               mu ON lp.id_municipio = mu.id_municipio
GROUP BY p.id_area, a.nombre, p.id_tipo, tp.nombre
ORDER BY p.id_area, tp.nombre
WITH DATA;

CREATE UNIQUE INDEX idx_mv_por_tipo_pk   ON mv_dashboard_por_tipo (id_area, id_tipo);
CREATE INDEX        idx_mv_por_tipo_area ON mv_dashboard_por_tipo (id_area);


-- ----------------------------------------------------------
-- 3. NUEVA VISTA: mv_empresas_detalle
--    Una fila por empresa con todos sus datos en JSON arrays.
--    Patrón idéntico a mv_proyectos_detalle.
-- ----------------------------------------------------------

CREATE MATERIALIZED VIEW mv_empresas_detalle AS
SELECT
  e.id_empresa,
  e.nombre,
  e.anio_inicio_apoyo,

  -- Forma jurídica (objeto JSON único)
  jsonb_build_object('id', fj.id_forma, 'nombre', fj.nombre)                   AS forma_juridica,

  -- Departamentos donde opera (JSON array)
  COALESCE(
    (SELECT json_agg(jsonb_build_object('id', d.id_departamento, 'nombre', d.nombre, 'amazonico', d.amazonico))
     FROM   departamentos_empresas de_pivot
     JOIN   departamentos d ON de_pivot.id_departamento = d.id_departamento
     WHERE  de_pivot.id_empresa = e.id_empresa),
    '[]'::json
  )                                                                              AS departamentos,

  -- Motivos de apoyo (JSON array)
  COALESCE(
    (SELECT json_agg(jsonb_build_object('id', m.id_motivo, 'nombre', m.nombre))
     FROM   motivos_empresas me_pivot
     JOIN   motivos m ON me_pivot.id_motivo = m.id_motivo
     WHERE  me_pivot.id_empresa = e.id_empresa),
    '[]'::json
  )                                                                              AS motivos_apoyo,

  -- Tipos de apoyo (JSON array)
  COALESCE(
    (SELECT json_agg(jsonb_build_object('id', ap.id_apoyo, 'nombre', ap.nombre))
     FROM   apoyos_empresas ae_pivot
     JOIN   apoyos ap ON ae_pivot.id_apoyo = ap.id_apoyo
     WHERE  ae_pivot.id_empresa = e.id_empresa),
    '[]'::json
  )                                                                              AS tipos_apoyo,

  -- ODS alineados (JSON array)
  COALESCE(
    (SELECT json_agg(jsonb_build_object('id', o.id_ods, 'nombre', o.nombre))
     FROM   ods_empresas oe_pivot
     JOIN   ods o ON oe_pivot.id_ods = o.id_ods
     WHERE  oe_pivot.id_empresa = e.id_empresa),
    '[]'::json
  )                                                                              AS ods_alineados,

  -- Organizaciones vinculadas (JSON array)
  COALESCE(
    (SELECT json_agg(jsonb_build_object('id', org.id_organizacion, 'nombre', org.nombre, 'es_nacional', org.es_nacional))
     FROM   organizaciones_empresas oe
     JOIN   organizaciones org ON oe.id_organizacion = org.id_organizacion
     WHERE  oe.id_empresa = e.id_empresa
     AND    oe.id_organizacion IS NOT NULL),
    '[]'::json
  )                                                                              AS organizaciones_vinculadas,

  -- Proyectos en los que participa (conteos)
  (SELECT COUNT(DISTINCT pe.id_proyecto)::int
   FROM proyectos_empresas pe
   WHERE pe.id_empresa = e.id_empresa)                                           AS total_proyectos_participantes,

  (SELECT COUNT(DISTINCT pe.id_proyecto)::int
   FROM   proyectos_empresas pe
   JOIN   proyectos p ON pe.id_proyecto = p.id_proyecto
   WHERE  pe.id_empresa = e.id_empresa AND p.anio_fin IS NULL)                  AS proyectos_activos_participantes

FROM empresas e
JOIN formas_juridicas fj ON e.id_forma_juridica = fj.id_forma
ORDER BY e.id_empresa
WITH DATA;

CREATE UNIQUE INDEX idx_mv_empresas_detalle_id   ON mv_empresas_detalle (id_empresa);
CREATE INDEX        idx_mv_empresas_detalle_anio  ON mv_empresas_detalle (anio_inicio_apoyo);


-- ----------------------------------------------------------
-- 4. ACTUALIZAR refresh_dashboard_views()
--    Agrega las tres vistas nuevas al ciclo de refresco.
--    Los triggers existentes en analytics.sql recogen el
--    cambio automáticamente (llaman por nombre de función).
-- ----------------------------------------------------------

CREATE OR REPLACE FUNCTION refresh_dashboard_views()
RETURNS TRIGGER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW mv_dashboard_resumen_global;
  REFRESH MATERIALIZED VIEW mv_dashboard_por_region;
  REFRESH MATERIALIZED VIEW mv_dashboard_timeline;
  REFRESH MATERIALIZED VIEW mv_proyectos_detalle;
  REFRESH MATERIALIZED VIEW mv_dashboard_por_tipo;
  REFRESH MATERIALIZED VIEW mv_empresas_detalle;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;
