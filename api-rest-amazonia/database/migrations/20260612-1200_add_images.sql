-- migrate-images.sql
-- Adds image support to proyectos, empresas, organizaciones
-- and creates the proyecto_imagenes gallery table.
-- Run once against the database before deploying.

ALTER TABLE proyectos
  ADD COLUMN IF NOT EXISTS imagen_principal_url  TEXT,
  ADD COLUMN IF NOT EXISTS imagen_principal_path TEXT;

ALTER TABLE empresas
  ADD COLUMN IF NOT EXISTS logo_url  TEXT,
  ADD COLUMN IF NOT EXISTS logo_path TEXT;

ALTER TABLE organizaciones
  ADD COLUMN IF NOT EXISTS logo_url  TEXT,
  ADD COLUMN IF NOT EXISTS logo_path TEXT;

CREATE TABLE IF NOT EXISTS proyecto_imagenes (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  id_proyecto INTEGER     NOT NULL REFERENCES proyectos(id_proyecto) ON DELETE CASCADE,
  url         TEXT        NOT NULL,
  path        TEXT        NOT NULL,
  descripcion TEXT,
  orden       INTEGER     DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_proyecto_imagenes_proyecto ON proyecto_imagenes(id_proyecto);
