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

    await ds.query(`ALTER TABLE proyectos ADD COLUMN IF NOT EXISTS imagen_principal_url TEXT;`);
    console.log('proyectos.imagen_principal_url: OK');

    await ds.query(`ALTER TABLE proyectos ADD COLUMN IF NOT EXISTS imagen_principal_path TEXT;`);
    console.log('proyectos.imagen_principal_path: OK');

    await ds.query(`ALTER TABLE empresas ADD COLUMN IF NOT EXISTS logo_url TEXT;`);
    console.log('empresas.logo_url: OK');

    await ds.query(`ALTER TABLE empresas ADD COLUMN IF NOT EXISTS logo_path TEXT;`);
    console.log('empresas.logo_path: OK');

    await ds.query(`ALTER TABLE organizaciones ADD COLUMN IF NOT EXISTS logo_url TEXT;`);
    console.log('organizaciones.logo_url: OK');

    await ds.query(`ALTER TABLE organizaciones ADD COLUMN IF NOT EXISTS logo_path TEXT;`);
    console.log('organizaciones.logo_path: OK');

    await ds.query(`
        CREATE TABLE IF NOT EXISTS proyecto_imagenes (
            id           UUID        DEFAULT gen_random_uuid(),
            id_proyecto  INT         NOT NULL,
            url          TEXT        NOT NULL,
            path         TEXT        NOT NULL,
            descripcion  TEXT,
            orden        INT         DEFAULT 0,
            created_at   TIMESTAMPTZ DEFAULT NOW(),
            PRIMARY KEY (id),
            FOREIGN KEY (id_proyecto) REFERENCES proyectos(id_proyecto) ON DELETE CASCADE
        );
    `);
    console.log('Tabla proyecto_imagenes: OK');

    await ds.query(`
        CREATE INDEX IF NOT EXISTS idx_proyecto_imagenes_proyecto ON proyecto_imagenes(id_proyecto);
    `);
    console.log('Índice idx_proyecto_imagenes_proyecto: OK');

    await ds.destroy();
    console.log('Migración completada exitosamente.');
}

main().catch((err) => {
    console.error('ERROR en migración:', err.message);
    process.exit(1);
});
