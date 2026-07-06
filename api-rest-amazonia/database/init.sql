-- ============================================================
-- Init: construye la BD completa desde cero (schema + migraciones + seeds).
-- Independiente de Supabase: sirve contra cualquier Postgres 14+ vacío.
-- Uso: psql "$DATABASE_URL" -f init.sql   (ejecutar DESDE database/, por los \i relativos)
-- ============================================================

-- Nota: \ir (no \i) — resuelve relativo a la ubicación de ESTE script, no al
-- directorio de trabajo del proceso que lo invoca (importante para el init de Docker).

-- 1. Esquema base (tablas + catálogos + auth)
\ir schema/01_schema.sql

-- 2. Capa analítica (vistas materializadas + triggers)
\ir schema/05_analytics-dashboard.sql
\ir schema/06_analytics-proyectos.sql
\ir schema/07_analytics-v2.sql

-- 3. Migraciones (equivalentes declarativos, idempotentes)
\ir migrations/20260612-1100_add_auth_tables.sql
\ir migrations/20260612-1200_add_images.sql
\ir migrations/20260613-1400_add_georef_columns.sql
\ir migrations/20260629-1000_add_publicaciones.sql
\ir migrations/20260629-1100_add_logs_auditoria.sql

-- 4. Geografía (opcional — SOBRESCRIBE con TRUNCATE + INSERT, ver seeds/03_geography_reference.sql)
\ir seeds/03_geography_reference.sql
