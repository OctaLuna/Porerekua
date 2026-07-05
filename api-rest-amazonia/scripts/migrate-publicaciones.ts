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
        )
    `);
    console.log('Tabla publicaciones: OK');

    await ds.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS idx_publicaciones_slug
            ON publicaciones (slug)
    `);
    await ds.query(`
        CREATE INDEX IF NOT EXISTS idx_publicaciones_autor
            ON publicaciones (autor_id)
    `);
    await ds.query(`
        CREATE INDEX IF NOT EXISTS idx_publicaciones_estado
            ON publicaciones (estado)
    `);
    console.log('Índices de publicaciones: OK');

    await ds.query(`
        CREATE TABLE IF NOT EXISTS publicacion_imagenes (
            id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
            id_publicacion  UUID        NOT NULL REFERENCES publicaciones(id) ON DELETE CASCADE,
            url             TEXT        NOT NULL,
            path            TEXT        NOT NULL,
            descripcion     TEXT,
            orden           INTEGER     NOT NULL DEFAULT 0,
            created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `);
    console.log('Tabla publicacion_imagenes: OK');

    await ds.query(`
        CREATE INDEX IF NOT EXISTS idx_pub_imagenes_publicacion
            ON publicacion_imagenes (id_publicacion)
    `);
    console.log('Índice publicacion_imagenes: OK');

    await ds.destroy();
    console.log('Migración de publicaciones completada exitosamente.');
}

main().catch((err) => {
    console.error('ERROR en migración publicaciones:', err.message);
    process.exit(1);
});
