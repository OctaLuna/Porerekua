-- ============================================================
-- Migración: módulo de publicaciones (blog profesional)
-- Autor: equipo Kaa Iya  ·  Fecha: 2026-06-29
-- Reversible: SÍ (ver bloque DOWN)
-- Dependencias: tabla usuarios (20260612-1100_add_auth_tables.sql)
-- Equivalente declarativo de scripts/migrate-publicaciones.ts
-- ============================================================

BEGIN;

CREATE TABLE IF NOT EXISTS publicaciones (
    id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    autor_id              INTEGER     NOT NULL REFERENCES usuarios(id_usuario),
    titulo                VARCHAR(500) NOT NULL,
    slug                  VARCHAR(600) UNIQUE NOT NULL,
    contenido             JSONB       NOT NULL DEFAULT '[]',
    estado                VARCHAR(20) NOT NULL DEFAULT 'borrador'
                              CHECK (estado IN ('borrador', 'publicado')),
    fecha_creacion        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    fecha_ultima_edicion  TIMESTAMPTZ,
    fecha_publicacion     TIMESTAMPTZ,
    editado_por           INTEGER     REFERENCES usuarios(id_usuario)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_publicaciones_slug
    ON publicaciones (slug);

CREATE INDEX IF NOT EXISTS idx_publicaciones_autor
    ON publicaciones (autor_id);

CREATE INDEX IF NOT EXISTS idx_publicaciones_estado
    ON publicaciones (estado);

CREATE TABLE IF NOT EXISTS publicacion_imagenes (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    id_publicacion  UUID        NOT NULL REFERENCES publicaciones(id) ON DELETE CASCADE,
    url             TEXT        NOT NULL,
    path            TEXT        NOT NULL,
    descripcion     TEXT,
    orden           INTEGER     NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pub_imagenes_publicacion
    ON publicacion_imagenes (id_publicacion);

COMMIT;

-- DOWN (manual):
-- DROP INDEX IF EXISTS idx_pub_imagenes_publicacion;
-- DROP TABLE IF EXISTS publicacion_imagenes;
-- DROP INDEX IF EXISTS idx_publicaciones_estado;
-- DROP INDEX IF EXISTS idx_publicaciones_autor;
-- DROP INDEX IF EXISTS idx_publicaciones_slug;
-- DROP TABLE IF EXISTS publicaciones;
