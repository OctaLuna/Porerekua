-- ============================================================
-- Migración: tablas de autenticación (usuarios + solicitudes_acceso)
-- Autor: equipo Kaa Iya  ·  Fecha: 2026-06-12
-- Reversible: NO (DROP TABLE manual si se requiere revertir)
-- Dependencias: schema base (01_schema.sql)
-- Equivalente declarativo de scripts/migrate-auth-tables.ts
-- ============================================================

BEGIN;

CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario        SERIAL,
    email             VARCHAR(255)    NOT NULL UNIQUE,
    password_hash     VARCHAR(255)    NOT NULL,
    nombre            VARCHAR(150)    NOT NULL,
    rol               INT             NOT NULL,
    activo            BOOLEAN         NOT NULL DEFAULT TRUE,
    fecha_expiracion  TIMESTAMP,
    created_at        TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMP       NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id_usuario)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(rol);

CREATE TABLE IF NOT EXISTS solicitudes_acceso (
    id_solicitud             SERIAL,
    nombre_solicitante       VARCHAR(150)     NOT NULL,
    email_solicitante        VARCHAR(255)     NOT NULL,
    institucion              VARCHAR(255)     NOT NULL,
    proposito                TEXT             NOT NULL,
    estado                   VARCHAR(20)      NOT NULL DEFAULT 'pendiente',
    fecha_expiracion_acceso  TIMESTAMP,
    id_revisor               INT,
    id_usuario_creado        INT,
    nota_rechazo             TEXT,
    fecha_revision           TIMESTAMP,
    created_at               TIMESTAMP        NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id_solicitud),
    FOREIGN KEY (id_revisor) REFERENCES usuarios(id_usuario)
);

CREATE INDEX IF NOT EXISTS idx_solicitudes_estado ON solicitudes_acceso(estado);
CREATE INDEX IF NOT EXISTS idx_solicitudes_email ON solicitudes_acceso(email_solicitante);

-- Iteración 2: invalidación inmediata de tokens (AUDIT-008)
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS token_valid_from TIMESTAMP;

COMMIT;

-- DOWN (manual):
-- DROP TABLE IF EXISTS solicitudes_acceso;
-- DROP TABLE IF EXISTS usuarios;
