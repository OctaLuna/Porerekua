# Base de Datos — Kaa Iya (Backend)

Fuente de verdad **declarativa** del esquema PostgreSQL de la plataforma Kaa Iya.

## Stack
- **PostgreSQL 14+** (alojado en **Supabase**; pooler `aws-0-...pooler.supabase.com:5432`).
- ORM: **TypeORM** con `synchronize: false` (el esquema NO se auto-genera; se aplica desde aquí).
- Conexión con SSL cuando el host contiene `supabase` (ver `src/infrastructure/database/database.module.ts`).

## Estructura

```
database/
├── README.md                         ← este archivo
├── schema/
│   ├── 01_schema.sql                  ← DDL completo: tablas, catálogos (seed inline),
│   │                                    geografía, índices, FKs, tablas de auth
│   ├── 05_analytics-dashboard.sql     ← vistas materializadas KPIs + triggers de refresco
│   ├── 06_analytics-proyectos.sql     ← vista materializada de detalle de proyectos
│   └── 07_analytics-v2.sql            ← dashboard expandido + vista de empresas
├── seeds/
│   └── 03_geography_reference.sql     ← datos de geografía (9 dept / 105 mun / comunidades)
│                                        — el equipo los aplica; hace TRUNCATE+INSERT (destructivo)
├── migrations/
│   ├── 20260612-1100_add_auth_tables.sql      ← usuarios + solicitudes_acceso + token_valid_from
│   ├── 20260612-1200_add_images.sql           ← columnas de imagen + tabla proyecto_imagenes
│   └── 20260613-1400_add_georef_columns.sql   ← lat/lng/department/municipality/georef_* + índices
└── snapshots/
    └── (dumps generados con pg_dump --schema-only; ver más abajo)
```

> **Nota:** `01_schema.sql` ya incluye las tablas de auth, las columnas de imagen y la
> geografía. Las `migrations/` son **equivalentes declarativos idempotentes** (`IF NOT EXISTS`)
> de los cambios aplicados incrementalmente a una BD ya existente. Para una BD **nueva**,
> basta con `schema/` + `seeds/`. Para una BD **ya creada**, aplica solo las `migrations/`
> pendientes.

## Aplicar el esquema en una BD limpia

```bash
export DATABASE_URL="postgresql://<user>:<pass>@<host>:5432/<db>?sslmode=require"

# 1. Esquema base (tablas + catálogos + auth)
psql "$DATABASE_URL" -f schema/01_schema.sql

# 2. Capa analítica (vistas materializadas + triggers)
psql "$DATABASE_URL" -f schema/05_analytics-dashboard.sql
psql "$DATABASE_URL" -f schema/06_analytics-proyectos.sql
psql "$DATABASE_URL" -f schema/07_analytics-v2.sql

# 3. (Opcional) Geografía completa — SOBRESCRIBE las tablas geográficas
#    Hacer backup antes; ver advertencia abajo.
psql "$DATABASE_URL" -f seeds/03_geography_reference.sql
```

## Aplicar migraciones pendientes (BD existente)

Aplica solo las que falten, en orden cronológico. Son idempotentes:

```bash
psql "$DATABASE_URL" -f migrations/20260612-1100_add_auth_tables.sql
psql "$DATABASE_URL" -f migrations/20260612-1200_add_images.sql
psql "$DATABASE_URL" -f migrations/20260613-1400_add_georef_columns.sql
```

Alternativamente, los scripts TypeScript equivalentes (cargan `.env` y detectan Supabase):

```bash
npm run migrate:auth
npm run migrate:images
npm run migrate:georef
```

## Datos semilla

- **Catálogos** (áreas, ODS, tipos, apoyos, motivos, ayudas…): ya vienen como `INSERT`
  dentro de `schema/01_schema.sql`.
- **Geografía** (departamentos, municipios, comunidades indígenas): en
  `seeds/03_geography_reference.sql`.
  ⚠️ **Advertencia:** este archivo hace `TRUNCATE ... CASCADE` de las 4 tablas geográficas
  y reinserta desde el Excel oficial. **Hacer backup antes** y verificar que no haya
  proyectos referenciando municipios que cambien de ID. Generarlo de nuevo desde el Excel:
  `python scripts/generate-geography-sql.py`.
- **Superadmin** (entorno no productivo): `npm run seed:superadmin`
  (requiere `SEED_SUPERADMIN_EMAIL` / `SEED_SUPERADMIN_PASSWORD` en `.env`).

## Convenciones de migraciones

- Nombre: `YYYYMMDD-HHMM_<verbo>_<sujeto>.sql` (ej. `20260613-1400_add_georef_columns.sql`).
- Cabecera obligatoria: descripción, autor, fecha, reversible (SÍ/NO), dependencias.
- Envolver en `BEGIN; ... COMMIT;`. Incluir bloque `DOWN` comentado si es reversible.
- Usar `IF NOT EXISTS` / `ADD COLUMN IF NOT EXISTS` para idempotencia.

## Row Level Security (RLS)

Actualmente el control de acceso es **a nivel de aplicación** (JWT + Guards de NestJS), no
con RLS de Postgres: el backend se conecta con un rol con privilegios completos. Si en el
futuro se exponen tablas vía la API de Supabase (PostgREST), habilitar RLS por tabla y
declarar las políticas en `policies/rls.sql`. Hoy NO es necesario porque solo el backend
accede a la BD.

## Snapshots / backup

```bash
# Snapshot del esquema (sin datos)
pg_dump --schema-only --no-owner --no-privileges "$DATABASE_URL" \
  > snapshots/full-schema-$(date +%Y%m%d).sql

# Backup completo (datos incluidos) antes de migraciones destructivas
pg_dump "$DATABASE_URL" > backup-$(date +%Y%m%d-%H%M).sql
```

## Restore

```bash
psql "$DATABASE_URL" -f backup-YYYYMMDD-HHMM.sql
```
