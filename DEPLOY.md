# Despliegue — Plataforma Kaa Iya (Render / Railway)

Guía para desplegar los **dos servicios** del backend de Kaa Iya en una PaaS. Pensada para
que el equipo de frontend (y quien opere la infraestructura) pueda levantar el sistema sin
acceso a un servidor propio.

> **Repos separados:** `api-rest-amazonia/` (backend NestJS) y `georef-service/` (microservicio
> FastAPI) se despliegan como **dos servicios independientes**. La base de datos es **Supabase**
> (externa, ya provisionada).

---

## 1. Arquitectura en la nube

```
                 Internet
                    │
        ┌───────────▼────────────┐         (red privada / interna del proveedor)
        │  Backend NestJS         │  ───────────────►  ┌──────────────────────┐
        │  (Web Service público)  │   GEOREF_URL       │  GeoRef FastAPI       │
        │  /api  ·  /api/health   │                    │  (Private Service)    │
        └───────────┬────────────┘                     │  /geo/pip /geo/health │
                    │                                   └──────────────────────┘
                    ▼
          Supabase (PostgreSQL)
```

- **Backend** = servicio web **público** (lo consume el frontend).
- **GeoRef** = servicio **privado/interno** (solo lo llama el backend). No exponer a internet.
- **Supabase** = base de datos gestionada; aplicar el esquema desde `api-rest-amazonia/database/`.

---

## 2. Preparación común (antes de desplegar)

1. **Base de datos (Supabase):** aplicar el esquema y migraciones — ver
   [`api-rest-amazonia/database/README.md`](api-rest-amazonia/database/README.md).
2. **JWT secret:** generar uno fuerte → `openssl rand -base64 64`.
3. **GeoJSON de GeoRef:** no está versionado; se descarga en el build (ver más abajo).
4. **CORS:** definir el dominio del frontend para `DOMAIN_FRONTEND` (no usar `*` en producción
   si se necesitan credenciales).

---

## 3. Render

### 3.1 Backend (Web Service)

| Campo | Valor |
|---|---|
| Root Directory | `api-rest-amazonia` |
| Environment | Node |
| Build Command | `npm ci && npm run build` |
| Start Command | `npm run start:prod` |
| Health Check Path | `/api/health` |

Variables de entorno (Render → Environment):

```
NODE_ENV=production
# PORT lo inyecta Render automáticamente (no fijar)
DOMAIN_FRONTEND=https://tu-frontend.example
DB_TYPE=postgres
DB_HOST=<host-supabase>.pooler.supabase.com
DB_PORT=5432
DB_USER=<usuario-supabase>
DB_NAME=postgres
DB_PASSWORD=<password-supabase>
DB_LOGS=false
ACTIVE_JWT=true
JWT_SECRET=<openssl rand -base64 64>
JWT_TIME_EXPIRE=24h
GEOREF_URL=http://georef-service:8001    # URL interna del servicio privado GeoRef
GEOREF_TIMEOUT_MS=5000
UPLOADS_PATH=./uploads
UPLOADS_BASE_URL=https://<tu-backend>.onrender.com/uploads
```

> El backend lee `process.env.PORT`; Render lo inyecta. No declarar `PORT` manualmente.

### 3.2 GeoRef (Private Service)

| Campo | Valor |
|---|---|
| Root Directory | `georef-service` |
| Environment | Python 3 |
| Build Command | `pip install -r requirements.txt && bash scripts/download_data.sh` |
| Start Command | `gunicorn app.main:app -k uvicorn.workers.UvicornWorker -b 0.0.0.0:$PORT` |

> Importante: en PaaS Gunicorn debe escuchar en `0.0.0.0:$PORT` (no en `127.0.0.1:8001`
> como en local). Por eso el Start Command sobrescribe el `bind`. Como *Private Service*,
> Render le asigna un hostname interno (p. ej. `georef-service:PORT`) que se usa en `GEOREF_URL`
> del backend.

Variables de entorno:

```
ENVIRONMENT=production
GEOJSON_PATH=data/bolivia.geojson
ALLOWED_ORIGINS=["http://backend-internal"]   # solo el backend; CORS es irrelevante server-to-server
```

### 3.3 Blueprint opcional (`render.yaml` en la raíz)

```yaml
services:
  - type: web
    name: kaaiya-backend
    runtime: node
    rootDir: api-rest-amazonia
    buildCommand: npm ci && npm run build
    startCommand: npm run start:prod
    healthCheckPath: /api/health
    envVars:
      - key: NODE_ENV
        value: production
      - key: GEOREF_URL
        value: http://kaaiya-georef:8001
      # ...resto de variables (marcar las sensibles como sync:false)
  - type: pserv          # private service
    name: kaaiya-georef
    runtime: python
    rootDir: georef-service
    buildCommand: pip install -r requirements.txt && bash scripts/download_data.sh
    startCommand: gunicorn app.main:app -k uvicorn.workers.UvicornWorker -b 0.0.0.0:$PORT
    envVars:
      - key: ENVIRONMENT
        value: production
```

---

## 4. Railway

### 4.1 Backend

- Nuevo servicio → conectar repo → **Root Directory:** `api-rest-amazonia`.
- Railway detecta Node (Nixpacks). Configurar:
  - **Build:** `npm ci && npm run build`
  - **Start:** `npm run start:prod`
  - **Healthcheck Path:** `/api/health`
- Variables: las mismas que en Render (§3.1). Railway inyecta `PORT`.
- `GEOREF_URL`: usar la **Private Networking URL** del servicio GeoRef
  (`http://<georef-service>.railway.internal:<port>`).

### 4.2 GeoRef

- Nuevo servicio → **Root Directory:** `georef-service`.
- **Build:** `pip install -r requirements.txt && bash scripts/download_data.sh`
- **Start:** `gunicorn app.main:app -k uvicorn.workers.UvicornWorker -b 0.0.0.0:$PORT`
- Variables: `ENVIRONMENT=production`, `GEOJSON_PATH=data/bolivia.geojson`.
- **No** asignar dominio público; usar solo Private Networking. El backend lo referencia por
  su host interno.

> Alternativa Railway: añadir un `Procfile` en `georef-service/`:
> `web: gunicorn app.main:app -k uvicorn.workers.UvicornWorker -b 0.0.0.0:$PORT`

---

## 5. Verificación post-despliegue

```bash
# Backend público
curl https://<tu-backend>/api/health            # 200 {status:"ok"}
curl https://<tu-backend>/api/health/ready       # 200 {db:"up", georef:"up"|"down"}
curl https://<tu-backend>/api/departamentos      # 200 (lista)

# Swagger habilitado también en producción para el frontend:
#   https://<tu-backend>/api/documentation   (UI)
#   https://<tu-backend>/api/documentation-json  (spec OpenAPI)
# Integración GeoRef (indirecta): registrar un proyecto con lat/lng y verificar department.

# GeoRef NO debe ser accesible públicamente:
curl https://<intento-publico-georef>/geo/health  # debe fallar / no resolver
```

Checklist:

- [ ] `GET /api/health` → 200
- [ ] `GET /api/health/ready` → `db: "up"`
- [ ] Variables sensibles configuradas (no en el repo)
- [ ] `GEOREF_URL` apunta al host **interno** del servicio GeoRef
- [ ] GeoRef **no** tiene dominio público
- [ ] `DOMAIN_FRONTEND` = dominio real del frontend
- [ ] `JWT_SECRET` fuerte y único por entorno
- [ ] Esquema de BD aplicado en Supabase (ver `database/README.md`)

---

## 6. Para el equipo de frontend

- **Base URL** del API: `https://<tu-backend>/api`.
- **Tipos TypeScript:** generar desde el spec OpenAPI del backend:
  ```bash
  # en api-rest-amazonia
  npm run openapi:export        # genera openapi.json
  npx openapi-typescript openapi.json -o src/api/types.ts
  ```
- **Auth:** `POST /api/auth/login` → `{ accessToken }`; enviar `Authorization: Bearer <token>`.
- **Mapa:** `GET /api/proyectos/map` (público) para los marcadores MapLibre.
- **Selectores/filtros:** `GET /api/*/filtros-disponibles` y `GET /api/dashboard/filtros-disponibles`.

---

## 7. Actualizaciones y rollback

- **Deploy nuevo:** push a la rama conectada → la PaaS reconstruye automáticamente.
- **Migraciones de BD:** ejecutarlas manualmente contra Supabase **con backup previo**
  (`database/migrations/`), nunca automáticamente al arrancar.
- **Rollback:** en Render/Railway, revertir al deploy anterior desde el panel; para BD,
  restaurar el backup correspondiente.

## 8. Troubleshooting

| Síntoma | Causa / solución |
|---|---|
| Backend 503 en `/health/ready` | BD inalcanzable: revisar credenciales Supabase y SSL |
| Proyectos sin departamento | GeoRef caído o `GEOREF_URL` mal configurada (debe ser host interno) |
| `502/504` al arrancar GeoRef | Falta `bind 0.0.0.0:$PORT` en el Start Command |
| `features_loaded: 0` en GeoRef | El build no descargó `bolivia.geojson` (revisar `download_data.sh`) |
| CORS bloquea al frontend | `DOMAIN_FRONTEND` no incluye el origen del frontend |
