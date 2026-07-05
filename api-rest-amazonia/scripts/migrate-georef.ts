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
        ALTER TABLE proyectos
            ADD COLUMN IF NOT EXISTS lat               DECIMAL(10,7),
            ADD COLUMN IF NOT EXISTS lng               DECIMAL(10,7),
            ADD COLUMN IF NOT EXISTS department        VARCHAR(100),
            ADD COLUMN IF NOT EXISTS municipality      VARCHAR(150),
            ADD COLUMN IF NOT EXISTS georef_resolved_at TIMESTAMP,
            ADD COLUMN IF NOT EXISTS georef_failed     BOOLEAN NOT NULL DEFAULT false;
    `);
    console.log('Columnas de georreferenciación en proyectos: OK');

    await ds.query(`
        CREATE INDEX IF NOT EXISTS idx_proyectos_lat_lng
            ON proyectos (lat, lng)
            WHERE lat IS NOT NULL AND lng IS NOT NULL;
    `);
    console.log('Índice idx_proyectos_lat_lng: OK');

    await ds.query(`
        CREATE INDEX IF NOT EXISTS idx_proyectos_department
            ON proyectos (department)
            WHERE department IS NOT NULL;
    `);
    console.log('Índice idx_proyectos_department: OK');

    await ds.destroy();
    console.log('Migración georef completada exitosamente.');
}

main().catch((err) => {
    console.error('ERROR en migración georef:', err.message);
    process.exit(1);
});
