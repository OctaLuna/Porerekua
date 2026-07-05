# Kaa Iya — API REST (Backend NestJS)

Backend de la plataforma **Kaa Iya** ("Espíritu del Bosque"), para visibilizar y gestionar
iniciativas sostenibles de la Amazonía boliviana. Desarrollado en la UCB "San Pablo" para la
Cátedra Nazaria Ignacia "Querida Amazonía".

## Stack

| Capa | Tecnología |
|------|-----------|
| Framework | NestJS 11 · TypeScript 5 · Node 18–22 |
| Base de datos | PostgreSQL 14+ (Supabase) vía TypeORM 0.3 (`synchronize: false`) |
| Auth | JWT + Passport · bcrypt (cost 12) |
| Validación | class-validator + ValidationPipe estricto (whitelist) |
| Seguridad | helmet · @nestjs/throttler (rate limiting) · CORS configurable |
| Docs | Swagger/OpenAPI 3 (`/api/documentation`) |
| Georreferenciación | cliente HTTP del microservicio `georef-service` |

## Inicio rápido

```bash
git clone <repo>
cd api-rest-amazonia
cp .env.example .env        # editar valores (ver tabla abajo)
npm install
npm run start:dev           # hot-reload en http://localhost:3333
```

- API: `http://localhost:3333/api`
- Swagger UI: `http://localhost:3333/api/documentation` (habilitado en todos los entornos, incluido producción)
- Health: `http://localhost:3333/api/health`

> El microservicio **GeoRef** debe estar corriendo (`http://127.0.0.1:8001`) para que los
> proyectos con coordenadas resuelvan departamento/municipio. Si está caído, el registro
> sigue funcionando (degradación elegante: `georefFailed=true`). Ver `../georef-service/README.md`.

## Variables de entorno

| Variable | Obligatoria | Default | Descripción |
|---|---|---|---|
| `NODE_ENV` | no | `development` | `development` \| `production` \| `test` \| `debug` |
| `PORT` | no | `3333` | Puerto HTTP (en PaaS lo inyecta la plataforma) |
| `DOMAIN_FRONTEND` | sí | — | Origen(es) CORS. `*` deshabilita credenciales; lista separada por comas para permitir credenciales |
| `DB_TYPE` | sí | `postgres` | Motor de BD |
| `DB_HOST` | sí | — | Host PostgreSQL/Supabase (SSL automático si contiene `supabase`) |
| `DB_PORT` | sí | `5432` | Puerto BD |
| `DB_USER` | sí | — | Usuario BD |
| `DB_NAME` | sí | — | Nombre de la BD |
| `DB_PASSWORD` | sí | — | Contraseña BD |
| `DB_LOGS` | no | `false` | Logs de queries TypeORM |
| `ACTIVE_JWT` | no | `true` | `false` desactiva JWT en development (siempre activo en production) |
| `JWT_SECRET` | sí | — | Secreto de firma JWT (generar: `openssl rand -base64 64`) |
| `JWT_TIME_EXPIRE` | no | `24h` | Vigencia del token |
| `GEOREF_URL` | sí | `http://127.0.0.1:8001` | URL del microservicio GeoRef |
| `GEOREF_TIMEOUT_MS` | no | `5000` | Timeout por request a GeoRef |
| `UPLOADS_PATH` | no | `./uploads` | Directorio de imágenes subidas |
| `UPLOADS_BASE_URL` | no | — | Base URL pública de `/uploads` |
| `SEED_SUPERADMIN_EMAIL` / `SEED_SUPERADMIN_PASSWORD` | no | — | Credenciales para `npm run seed:superadmin` |

## Estructura del proyecto

```
src/
├── main.ts                  # Bootstrap: helmet, CORS, ValidationPipe estricto, Swagger, prefix /api
├── app.module.ts            # Módulo raíz (throttler global + todos los módulos)
├── app/formularios/         # Punto de entrada público: registro transaccional de empresas/orgs
├── infrastructure/
│   ├── config/              # Configuración por ambiente con validación Joi (MyConfigService)
│   └── database/            # TypeORM (SSL Supabase, pool max 5)
├── modules/
│   ├── auth/                # JWT, usuarios, roles, solicitudes de acceso, guards
│   ├── catalogos/           # 12 catálogos maestros (patrón esPropio)
│   ├── gestion-empresarial/ # Empresas + pivots
│   ├── gestion-organizacional/
│   ├── gestion-proyectos/   # Proyectos (bifurcación conservación/desarrollo) + pivots
│   ├── gestion-conservacion/
│   ├── gestion-comunidades/
│   ├── ubicaciones-geograficas/  # Departamentos, municipios, comunidades indígenas
│   ├── dashboard/           # KPIs y listados (vistas materializadas + caché)
│   ├── georef/              # Cliente del microservicio GeoRef
│   └── health/              # Liveness / readiness probes
└── shared/                  # DTOs, enums, excepciones, utils, validación, swagger
```

## Módulos principales

### Auth (`/api/auth`)
JWT con jerarquía de roles **Superadmin(1) > Admin(2) > Investigador(3)**.
- Público: `POST /auth/login`, `POST /auth/solicitar-acceso`.
- Autenticado: `GET/PUT /auth/me`, `POST /auth/change-password`, `POST /auth/logout`.
- Admin: `POST /auth/register`, `GET /auth/usuarios[/:id]`, `PATCH /auth/usuarios/:id`,
  `DELETE /auth/usuarios/:id` (Superadmin), gestión de solicitudes.
- Invalidación inmediata de tokens vía `token_valid_from` (al desactivar cuenta / cambiar password).

### Formularios (`/api/formularios`) — público
Registro transaccional completo: `POST /formularios/empresas`, `POST /formularios/organizaciones`.
Patrón `seleccionados + otros` y bifurcación por área del proyecto. La resolución GeoRef ocurre
**antes** de la transacción (no retiene conexiones).

### Catálogos (`/api/*`) — público
Datos maestros para formularios (`/forms` excluye entradas `esPropio`).

### Proyectos / Empresas / Organizaciones
Listados con filtros y paginación; respuesta dual por autenticación (`OptionalJwtAuthGuard`):
sin token → cards públicas; con token → detalle completo. `GET /proyectos/map` para MapLibre.
Subida de imágenes (logos, imagen principal, galería) con `sharp` (WebP).

### Dashboard (`/api/dashboard`) — JWT
Métricas agregadas sobre vistas materializadas de PostgreSQL, con caché en memoria por endpoint.

### GeoRef
Cliente del microservicio (no expone controller HTTP). Resuelve coordenadas WGS84 → departamento/provincia.

### Health (`/api/health`)
`GET /health` (liveness) y `GET /health/ready` (readiness: BD + GeoRef). Sin rate limit.

## Sistema de usuarios y roles

- **Superadmin (1):** todo, incluido eliminar usuarios y crear cualquier rol.
- **Admin (2):** gestiona usuarios (no Superadmin), aprueba solicitudes de investigadores.
- **Investigador (3):** acceso de lectura autenticado; se crea vía solicitud + aprobación, con
  fecha de expiración de acceso.
- Login: `POST /auth/login` → `{ accessToken }`; enviar `Authorization: Bearer <token>`.

## Scripts npm

| Script | Descripción |
|---|---|
| `npm run start:dev` | Desarrollo con hot-reload |
| `npm run build` | Compila a `dist/` |
| `npm run start:prod` | Ejecuta `dist/main` |
| `npm run lint` | ESLint con auto-fix |
| `npm test` / `npm run test:cov` | Tests / con cobertura |
| `npm run openapi:export` | Genera `openapi.json` (para tipos del frontend) |
| `npm run migrate:auth` / `:images` / `:georef` | Migraciones declarativas |
| `npm run seed:superadmin` | Crea el superadmin inicial (no productivo) |

## Base de datos

Esquema declarativo en [`database/`](database/README.md): `schema/`, `seeds/`, `migrations/`,
`snapshots/`. **No** usar `synchronize`. Ver `database/README.md` para aplicar/migrar.

## Tests

```bash
npm test            # unitarios (Jest)
npm run test:cov    # cobertura (acotada a archivos de lógica)
```
Suite core actual: cors, ValidationPipe, JwtStrategy, guards, GeorefService, ProyectosService,
FilterDepartamentos, utils, health. Plan de ampliación en `../docs/pending-issues.md`.

## Swagger / OpenAPI

- UI: `http://localhost:3333/api/documentation`
- Spec exportable: `npm run openapi:export` → `openapi.json`
- Generar cliente tipado: `npx openapi-typescript openapi.json -o types.ts`

## Despliegue

Ver la guía de despliegue a Render/Railway en la raíz del monorepo: `../DEPLOY.md`.

## Troubleshooting

| Problema | Causa probable / solución |
|---|---|
| `Cannot connect` / SSL a Supabase | `DB_HOST` debe contener `supabase` para activar SSL; verificar credenciales y pooler |
| Proyectos sin `department`/`municipality` | GeoRef caído o coords fuera de Bolivia → `georefFailed=true` (esperado) |
| `401` en endpoints de detalle | Requieren JWT; usar `Authorization: Bearer <token>` |
| `429 Too Many Requests` | Rate limit (60/min global; 5/min en `/auth/login`) |
| Swagger no carga / error de consola en dev | Recarga con caché limpia (`Ctrl+Shift+R`). En dev la CSP de helmet se desactiva para que Swagger funcione sobre http://localhost |
