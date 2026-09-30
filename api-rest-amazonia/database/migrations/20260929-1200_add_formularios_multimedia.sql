-- Multimedia binaria asociada a formularios públicos.
-- Autor: Porerekua
-- Fecha: 2026-09-29
-- Reversible: SÍ (ver bloque DOWN al final)
-- Dependencias: empresas, organizaciones, extensión pgcrypto (ya usada por el esquema)

BEGIN;

CREATE TABLE IF NOT EXISTS formularios_multimedia (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_empresa            INT NULL REFERENCES empresas(id_empresa) ON DELETE CASCADE,
    id_organizacion       INT NULL REFERENCES organizaciones(id_organizacion) ON DELETE CASCADE,
    nombre_original       VARCHAR(255) NOT NULL,
    tipo_mime             VARCHAR(255) NOT NULL,
    tamano_bytes          BIGINT NOT NULL DEFAULT 0 CHECK (tamano_bytes >= 0 AND tamano_bytes <= 524288000),
    checksum_sha256       CHAR(64) NULL,
    orden                 SMALLINT NOT NULL CHECK (orden >= 0),
    autoriza_publicacion  BOOLEAN NOT NULL DEFAULT FALSE,
    estado                VARCHAR(16) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'adjunto')),
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT ck_formularios_multimedia_propietario CHECK (
        (estado = 'pendiente' AND id_empresa IS NULL AND id_organizacion IS NULL)
        OR
        (estado = 'adjunto' AND (
            (id_empresa IS NOT NULL AND id_organizacion IS NULL)
            OR (id_empresa IS NULL AND id_organizacion IS NOT NULL)
        ))
    )
);

CREATE TABLE IF NOT EXISTS formularios_multimedia_fragmentos (
    id              BIGSERIAL PRIMARY KEY,
    id_multimedia   UUID NOT NULL REFERENCES formularios_multimedia(id) ON DELETE CASCADE,
    numero          INT NOT NULL CHECK (numero >= 0),
    contenido       BYTEA NOT NULL,
    CONSTRAINT uq_formularios_multimedia_fragmento_orden UNIQUE (id_multimedia, numero)
);

CREATE INDEX IF NOT EXISTS idx_formularios_multimedia_empresa
    ON formularios_multimedia(id_empresa) WHERE id_empresa IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_formularios_multimedia_organizacion
    ON formularios_multimedia(id_organizacion) WHERE id_organizacion IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_formularios_multimedia_pendientes
    ON formularios_multimedia(created_at) WHERE estado = 'pendiente';

COMMIT;

-- DOWN (ejecutar manualmente solo si se revierte la funcionalidad):
-- BEGIN;
-- DROP TABLE IF EXISTS formularios_multimedia_fragmentos;
-- DROP TABLE IF EXISTS formularios_multimedia;
-- COMMIT;
