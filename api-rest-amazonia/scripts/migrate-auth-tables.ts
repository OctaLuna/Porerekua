import 'reflect-metadata';
import * as dotenv from 'dotenv';
dotenv.config();

import { DataSource } from 'typeorm';

async function main() {
    const ds = new DataSource({
        type: 'postgres',
        host: process.env.DB_HOST ?? 'localhost',
        port: parseInt(process.env.DB_PORT ?? '5432'),
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl: process.env.DB_HOST?.includes('supabase') ? { rejectUnauthorized: false } : undefined,
        entities: [],
        synchronize: false,
    });

    await ds.initialize();
    console.log('Conectado a la BD.');

    await ds.query(`
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
    `);
    console.log('Tabla usuarios: OK');

    await ds.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
    `);
    await ds.query(`
        CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(rol);
    `);
    console.log('Índices usuarios: OK');

    await ds.query(`
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
    `);
    console.log('Tabla solicitudes_acceso: OK');

    await ds.query(`
        CREATE INDEX IF NOT EXISTS idx_solicitudes_estado ON solicitudes_acceso(estado);
    `);
    await ds.query(`
        CREATE INDEX IF NOT EXISTS idx_solicitudes_email ON solicitudes_acceso(email_solicitante);
    `);
    console.log('Índices solicitudes_acceso: OK');

    // Columna añadida en iteración 2: token_valid_from para invalidación inmediata de tokens
    await ds.query(`
        ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS token_valid_from TIMESTAMP;
    `);
    console.log('Columna token_valid_from: OK');

    await ds.destroy();
    console.log('Migración completada exitosamente.');
}

main().catch((err) => {
    console.error('ERROR en migración:', err.message);
    process.exit(1);
});
