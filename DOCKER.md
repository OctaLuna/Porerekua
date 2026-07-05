# Levantar el stack con Docker

Todo el proyecto (frontend, backend, georef y una base de datos Postgres) se levanta con **un solo comando**.
No necesitas Node, Python ni Supabase instalados localmente — solo **Docker Desktop**.

## Arquitectura

```
navegador → http://localhost        (web = Nginx + frontend compilado)
  ├ /         → SPA (React)
  ├ /api/     → api (NestJS :3333)   ← mismo origen, sin CORS
  └ /uploads/ → api (imágenes)
  api → postgres:5432   (BD local, interna)
  api → georef:8001     (microservicio, interno)
```

Solo `web` expone un puerto (`80`). `postgres` y `georef` son internos.

## Uso

```bash
# 1) (opcional) copia las variables locales
cp .env.example .env

# 2) construye y levanta todo
docker compose up --build

# Abre:
#   http://localhost
```

La **primera vez**, Postgres inicializa el esquema y los datos de geografía automáticamente
(desde `api-rest-amazonia/database/`), y el backend crea el usuario superadmin.

- **Superadmin** (login): `SEED_SUPERADMIN_EMAIL` / `SEED_SUPERADMIN_PASSWORD` del `.env`
  (por defecto `superadmin@kaaiya.test` / `SuperPass1!`).

## Comandos útiles

```bash
docker compose up -d --build      # en segundo plano
docker compose logs -f api        # ver logs del backend
docker compose ps                 # estado y healthchecks
docker compose down               # detener (conserva la BD)
docker compose down -v            # detener y BORRAR la BD (reinit limpio al volver a subir)
```

## Variables (`.env`)

| Variable | Default | Descripción |
|---|---|---|
| `POSTGRES_USER/PASSWORD/DB` | `amazonia` | Credenciales de la BD local en contenedor |
| `JWT_SECRET` | `kaa-iya-docker-secret-change-me` | Secreto de firma JWT |
| `SEED_SUPERADMIN_EMAIL/PASSWORD` | `superadmin@kaaiya.test` / `SuperPass1!` | Superadmin inicial |
| `VITE_MAPTILER_KEY` | *(vacío)* | Clave MapTiler para los mapas (opcional) |
| `WEB_PORT` | `80` | Puerto del host para el entrypoint web |

> Nota: la base de datos corre **local en un contenedor** con credenciales locales
> (`api-rest-amazonia/.env` con Supabase **no** se usa dentro de Docker). Los **datos** son una
> réplica de Supabase cargada desde un dump (ver abajo).

## Datos: réplica de Supabase

La BD local se inicializa desde un dump completo del esquema `public` de Supabase
(`api-rest-amazonia/database/snapshots/supabase-full.sql`, ignorado por git porque contiene datos
reales). Se monta como script de init, así que en cada arranque limpio (`down -v` → `up`) la BD queda
idéntica a Supabase, offline.

### Regenerar el dump (si Supabase cambió)

```bash
# 1) Volcar Supabase con pg_dump 17 (Supabase es Postgres 17)
docker run --rm postgres:17-alpine pg_dump \
  "postgresql://<DB_USER>:<DB_PASSWORD>@<DB_HOST>:5432/postgres?sslmode=require" \
  --schema=public --no-owner --no-privileges \
  > api-rest-amazonia/database/snapshots/supabase-full.sql

# 2) Hacer idempotente el CREATE SCHEMA (el init corre con ON_ERROR_STOP=1)
sed -i 's/^CREATE SCHEMA public;/CREATE SCHEMA IF NOT EXISTS public;/' \
  api-rest-amazonia/database/snapshots/supabase-full.sql

# 3) Recargar la BD local desde el dump
docker compose down -v && docker compose up -d
```
(Los valores `<DB_*>` están en `api-rest-amazonia/.env`.)
