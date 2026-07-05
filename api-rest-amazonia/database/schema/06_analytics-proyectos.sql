-- ==========================================================
-- analytics-proyectos.sql — Vista detallada de proyectos
-- Ejecutar DESPUÉS de analytics.sql.
-- ==========================================================
-- Crea mv_proyectos_detalle con todos los datos de cada
-- proyecto denormalizados en JSON arrays, incluyendo la
-- bifurcación por área:
--   id_area = 1 (Conservación)  → especies_animales + practicas_agricolas
--   id_area = 2 (Desarrollo)    → areas_desarrollo
--
-- También actualiza refresh_dashboard_views() para incluir
-- la nueva vista en el ciclo de refresco automático.
-- ==========================================================


-- ----------------------------------------------------------
-- MATERIALIZED VIEW: mv_proyectos_detalle
-- ----------------------------------------------------------

CREATE MATERIALIZED VIEW mv_proyectos_detalle AS
SELECT
  p.id_proyecto,
  p.nombre,
  p.descripcion,
  p.anio_inicio,
  p.anio_fin,
  (p.anio_fin IS NULL)                                                       AS activo,

  -- Área de trabajo (1=Conservación, 2=Desarrollo)
  a.id_area,
  a.nombre                                                                   AS area,

  -- Tipo de proyecto
  tp.id_tipo,
  tp.nombre                                                                  AS tipo_proyecto,

  -- Actores institucionales participantes (conteos)
  (SELECT COUNT(DISTINCT pe.id_empresa)::int
   FROM proyectos_empresas pe
   WHERE pe.id_proyecto = p.id_proyecto)                                    AS total_empresas_participantes,

  (SELECT COUNT(DISTINCT po.id_organizacion)::int
   FROM proyectos_organizaciones po
   WHERE po.id_proyecto = p.id_proyecto)                                    AS total_organizaciones_participantes,

  -- Geografía: departamentos únicos donde opera el proyecto (DISTINCT por subquery)
  COALESCE(
    (SELECT json_agg(row_to_json(sub))
     FROM (
       SELECT DISTINCT d.id_departamento AS id, d.nombre, d.amazonico
       FROM   localidades_proyectos lp
       JOIN   municipios mu    ON lp.id_municipio     = mu.id_municipio
       JOIN   departamentos d  ON mu.id_departamento  = d.id_departamento
       WHERE  lp.id_proyecto = p.id_proyecto
     ) sub),
    '[]'::json
  )                                                                          AS departamentos,

  -- Geografía: municipios donde opera el proyecto
  COALESCE(
    (SELECT json_agg(jsonb_build_object('id', mu.id_municipio, 'nombre', mu.nombre))
     FROM   localidades_proyectos lp
     JOIN   municipios mu ON lp.id_municipio = mu.id_municipio
     WHERE  lp.id_proyecto = p.id_proyecto),
    '[]'::json
  )                                                                          AS municipios,

  -- Geografía: comunidades indígenas directamente vinculadas al proyecto
  COALESCE(
    (SELECT json_agg(jsonb_build_object('id', ci.id_comunidad, 'nombre', ci.nombre))
     FROM   localidades_proyectos lp
     JOIN   comunidades_indigenas ci ON lp.id_comunidad = ci.id_comunidad
     WHERE  lp.id_proyecto = p.id_proyecto
     AND    lp.id_comunidad IS NOT NULL),
    '[]'::json
  )                                                                          AS comunidades_indigenas,

  -- Tipos de ayuda social aportada al proyecto
  COALESCE(
    (SELECT json_agg(jsonb_build_object('id', ay.id_ayuda, 'nombre', ay.nombre))
     FROM   ayudas_proyectos ayp
     JOIN   ayudas ay ON ayp.id_ayuda = ay.id_ayuda
     WHERE  ayp.id_proyecto = p.id_proyecto),
    '[]'::json
  )                                                                          AS tipos_ayuda,

  -- Actores locales / municipales involucrados
  COALESCE(
    (SELECT json_agg(jsonb_build_object('id', am.id_actor, 'nombre', am.nombre))
     FROM   actores_proyectos actp
     JOIN   actores_municipales am ON actp.id_actor = am.id_actor
     WHERE  actp.id_proyecto = p.id_proyecto),
    '[]'::json
  )                                                                          AS actores_locales,

  -- ÁREA 1 — CONSERVACIÓN: especies animales protegidas
  -- NULL para proyectos de desarrollo (id_area = 2)
  CASE WHEN p.id_area = 1 THEN
    COALESCE(
      (SELECT json_agg(jsonb_build_object('id', ea.id_especie, 'nombre', ea.nombre))
       FROM   conservacion_animales ca
       JOIN   especies_animales ea ON ca.id_especie = ea.id_especie
       WHERE  ca.id_proyecto = p.id_proyecto),
      '[]'::json
    )
  ELSE NULL END                                                              AS especies_animales,

  -- ÁREA 1 — CONSERVACIÓN: prácticas agrícolas aplicadas
  -- NULL para proyectos de desarrollo (id_area = 2)
  CASE WHEN p.id_area = 1 THEN
    COALESCE(
      (SELECT json_agg(jsonb_build_object('id', pra.id_practica, 'nombre', pra.nombre))
       FROM   conservacion_agricolas cag
       JOIN   practicas_agricolas pra ON cag.id_practica = pra.id_practica
       WHERE  cag.id_proyecto = p.id_proyecto),
      '[]'::json
    )
  ELSE NULL END                                                              AS practicas_agricolas,

  -- ÁREA 2 — DESARROLLO: áreas de desarrollo de comunidades indígenas
  -- NULL para proyectos de conservación (id_area = 1)
  CASE WHEN p.id_area = 2 THEN
    COALESCE(
      (SELECT json_agg(jsonb_build_object('id', ad.id_area, 'nombre', ad.nombre))
       FROM   comunidades_indigenas_areas cia
       JOIN   areas_desarrollo ad ON cia.id_area = ad.id_area
       WHERE  cia.id_proyecto = p.id_proyecto),
      '[]'::json
    )
  ELSE NULL END                                                              AS areas_desarrollo

FROM proyectos p
JOIN areas         a  ON p.id_area  = a.id_area
JOIN tipos_proyectos tp ON p.id_tipo = tp.id_tipo
ORDER BY p.id_proyecto
WITH DATA;


-- ----------------------------------------------------------
-- ÍNDICES
-- ----------------------------------------------------------

CREATE UNIQUE INDEX idx_mv_proyectos_detalle_id
  ON mv_proyectos_detalle (id_proyecto);

CREATE INDEX idx_mv_proyectos_detalle_area
  ON mv_proyectos_detalle (id_area);

-- Índice de expresión para filtrar proyectos activos/finalizados
CREATE INDEX idx_mv_proyectos_detalle_activo
  ON mv_proyectos_detalle ((anio_fin IS NULL));

CREATE INDEX idx_mv_proyectos_detalle_anio
  ON mv_proyectos_detalle (anio_inicio);


-- ----------------------------------------------------------
-- ACTUALIZAR FUNCIÓN DE REFRESCO
-- Agrega mv_proyectos_detalle al ciclo automático.
-- Los triggers definidos en analytics.sql llaman a esta
-- función por nombre y recogen el cambio automáticamente.
-- ----------------------------------------------------------

CREATE OR REPLACE FUNCTION refresh_dashboard_views()
RETURNS TRIGGER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW mv_dashboard_resumen_global;
  REFRESH MATERIALIZED VIEW mv_dashboard_por_region;
  REFRESH MATERIALIZED VIEW mv_dashboard_timeline;
  REFRESH MATERIALIZED VIEW mv_proyectos_detalle;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;
