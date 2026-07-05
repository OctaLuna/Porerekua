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
        CREATE TABLE IF NOT EXISTS logs_auditoria (
            id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
            tipo        VARCHAR(20) NOT NULL CHECK (tipo IN ('aplicacion', 'seguridad')),
            severidad   VARCHAR(10) NOT NULL CHECK (severidad IN ('info', 'warn', 'error', 'critico')),
            usuario_id  INTEGER     REFERENCES usuarios(id_usuario),
            accion      VARCHAR(200) NOT NULL,
            detalle     JSONB,
            ip_origen   VARCHAR(45),
            created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `);
    console.log('Tabla logs_auditoria: OK');

    await ds.query(`CREATE INDEX IF NOT EXISTS idx_logs_tipo ON logs_auditoria (tipo)`);
    await ds.query(`CREATE INDEX IF NOT EXISTS idx_logs_severidad ON logs_auditoria (severidad)`);
    await ds.query(`CREATE INDEX IF NOT EXISTS idx_logs_usuario ON logs_auditoria (usuario_id)`);
    await ds.query(`CREATE INDEX IF NOT EXISTS idx_logs_created_at ON logs_auditoria (created_at)`);
    console.log('Índices logs_auditoria: OK');

    await ds.destroy();
    console.log('Migración de logs de auditoría completada exitosamente.');
    console.log('Retención mínima: 2 años (ISO 27001:2022 control 8.15 — informe.md UCB).');
}

main().catch((err) => {
    console.error('ERROR en migración logs:', err.message);
    process.exit(1);
});
