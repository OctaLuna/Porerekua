-- ============================================================
-- Migración: columnas de georreferenciación en proyectos
-- Autor: equipo Kaa Iya  ·  Fecha: 2026-06-13
-- Reversible: SÍ (ver bloque DOWN)
-- Dependencias: tabla proyectos (01_schema.sql)
-- Equivalente declarativo de scripts/migrate-georef.ts
-- ============================================================

BEGIN;

ALTER TABLE proyectos
    ADD COLUMN IF NOT EXISTS lat                DECIMAL(10,7),
    ADD COLUMN IF NOT EXISTS lng                DECIMAL(10,7),
    ADD COLUMN IF NOT EXISTS department         VARCHAR(100),
    ADD COLUMN IF NOT EXISTS municipality       VARCHAR(150),
    ADD COLUMN IF NOT EXISTS georef_resolved_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS georef_failed      BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_proyectos_lat_lng
    ON proyectos (lat, lng)
    WHERE lat IS NOT NULL AND lng IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_proyectos_department
    ON proyectos (department)
    WHERE department IS NOT NULL;

COMMIT;

-- DOWN (manual):
-- DROP INDEX IF EXISTS idx_proyectos_department;
-- DROP INDEX IF EXISTS idx_proyectos_lat_lng;
-- ALTER TABLE proyectos
--   DROP COLUMN IF EXISTS lat, DROP COLUMN IF EXISTS lng,
--   DROP COLUMN IF EXISTS department, DROP COLUMN IF EXISTS municipality,
--   DROP COLUMN IF EXISTS georef_resolved_at, DROP COLUMN IF EXISTS georef_failed;
