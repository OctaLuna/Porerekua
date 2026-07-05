-- ============================================================
-- Migración: tabla de logs de aplicación y seguridad (auditoría)
-- Autor: equipo Kaa Iya  ·  Fecha: 2026-06-29
-- Reversible: SÍ (ver bloque DOWN)
-- Retención mínima: 2 años (ISO/IEC 27001:2022 control 8.15, informe.md UCB)
-- Purga periódica: NO automatizada — responsabilidad del DBA/cron externo
-- ============================================================

BEGIN;

CREATE TABLE IF NOT EXISTS logs_auditoria (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tipo        VARCHAR(20) NOT NULL CHECK (tipo IN ('aplicacion', 'seguridad')),
    severidad   VARCHAR(10) NOT NULL CHECK (severidad IN ('info', 'warn', 'error', 'critico')),
    usuario_id  INTEGER     REFERENCES usuarios(id_usuario),
    accion      VARCHAR(200) NOT NULL,
    detalle     JSONB,
    ip_origen   VARCHAR(45),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_logs_tipo
    ON logs_auditoria (tipo);

CREATE INDEX IF NOT EXISTS idx_logs_severidad
    ON logs_auditoria (severidad);

CREATE INDEX IF NOT EXISTS idx_logs_usuario
    ON logs_auditoria (usuario_id);

CREATE INDEX IF NOT EXISTS idx_logs_created_at
    ON logs_auditoria (created_at);

COMMIT;

-- DOWN (manual):
-- DROP INDEX IF EXISTS idx_logs_created_at;
-- DROP INDEX IF EXISTS idx_logs_usuario;
-- DROP INDEX IF EXISTS idx_logs_severidad;
-- DROP INDEX IF EXISTS idx_logs_tipo;
-- DROP TABLE IF EXISTS logs_auditoria;
