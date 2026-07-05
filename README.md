# Kaa Iya — Plataforma de Iniciativas Sostenibles Amazónicas

Sistema de información geoespacial sobre iniciativas sostenibles en la Amazonía boliviana.
Desarrollado para la **Universidad Católica Boliviana "San Pablo"** — Cátedra Nazaria Ignacia "Querida Amazonía".

---

## Arquitectura

```
                         Internet
                            │
                       ┌────▼────┐
                       │  Nginx  │  :443 HTTPS
                       └────┬────┘
              ┌─────────────┼─────────────┐
              │             │             │
         /tiles/*      /uploads/       /api/*
              │             │             │
     ┌────────▼────────┐    │    ┌───────▼───────┐
     │  PMTiles static  │    │    │  NestJS 11    │
     │  (MapLibre GL)   │    │    │  :3000        │
     └─────────────────┘    │    └───────┬───────┘
                             │           │ http (internal)
                             │    ┌──────▼──────┐
                             │    │  GeoRef     │
                             │    │  FastAPI    │
                             │    │  :8001      │
                             │    └──────┬──────┘
                             │           │
                             │    ┌──────▼──────┐
                             │    │ GeoPandas   │
                             │    │ bolivia.geo │
                             │    │ json (RAM)  │
                             │    └─────────────┘
                             │
                    ┌────────▼────────┐
                    │  PostgreSQL 14+ │
                    └─────────────────┘
```

---

## Repositorio

```
./
├── api-rest-amazonia/        NestJS 11 backend REST
├── georef-service/           FastAPI microservice (Point-in-Polygon)
├── nginx/
│   └── kaaiya.conf           Nginx site config
├── pm2.ecosystem.config.js   PM2 process management
├── docs/
│   ├── analysis-report.md    Análisis del codebase existente
│   ├── audit-report.md       Reporte de auditoría post-implementación
│   └── kaaiya-georef-integration-guide.md  Guía de arquitectura
└── .gitignore
```

---

## Quick Start — Desarrollo Local

### 1. Backend NestJS

```bash
cd api-rest-amazonia
cp .env.example .env
# Editar .env con credenciales de BD local

npm install
npm run migrate:auth
npm run migrate:images
npm run migrate:georef
npm run seed:superadmin
npm run start:dev
# → http://localhost:3333/api
# → http://localhost:3333/api/documentation (Swagger)
```

### 2. Microservicio GeoRef

```bash
cd georef-service
cp .env.example .env

# Crear entorno virtual e instalar dependencias
python -m venv venv
venv/Scripts/activate        # Windows
# source venv/bin/activate   # Linux/macOS
pip install -r requirements.txt

# Descargar datos geoespaciales de GADM (~30 MB)
bash scripts/download_data.sh
# o: make data

# Levantar en desarrollo
uvicorn app.main:app --host 127.0.0.1 --port 8001 --reload
# o: make dev

# Verificar:
curl http://127.0.0.1:8001/geo/health
curl -X POST http://127.0.0.1:8001/geo/pip \
     -H "Content-Type: application/json" \
     -d '{"lat": -17.7833, "lng": -63.1821}'
```

### 3. Tests del microservicio

```bash
cd georef-service
pytest tests/ -v
```

---

## Producción con PM2

```bash
# Build del backend
cd api-rest-amazonia && npm run build && cd ..

# Instalar GeoRef en modo producción
cd georef-service && make install && make data && cd ..

# Levantar ambos servicios
pm2 start pm2.ecosystem.config.js --env production
pm2 save
pm2 startup   # Configura inicio automático con el sistema

# Verificar estado
pm2 status
pm2 logs amazonia-api
pm2 logs georef-service
```

---

## Variables de Entorno

### `api-rest-amazonia/.env`

| Variable | Ejemplo | Descripción |
|----------|---------|-------------|
| `NODE_ENV` | `production` | Entorno (development/production/test/debug) |
| `PORT` | `3000` | Puerto del backend |
| `DB_HOST` | `localhost` | Host PostgreSQL |
| `DB_PORT` | `5432` | Puerto PostgreSQL |
| `DB_USER` | `postgres` | Usuario BD |
| `DB_PASSWORD` | `...` | Contraseña BD |
| `DB_NAME` | `amazonia_db` | Nombre BD |
| `JWT_SECRET` | `...` | Secreto JWT (mín. 32 chars) |
| `JWT_TIME_EXPIRE` | `24h` | Expiración del token |
| `UPLOADS_PATH` | `./uploads` | Directorio de imágenes |
| `UPLOADS_BASE_URL` | `https://kaaiya.ucb.edu.bo/uploads` | URL base imágenes |
| `GEOREF_URL` | `http://127.0.0.1:8001` | URL del microservicio GeoRef |
| `GEOREF_TIMEOUT_MS` | `5000` | Timeout para llamadas a GeoRef |

### `georef-service/.env`

| Variable | Ejemplo | Descripción |
|----------|---------|-------------|
| `ENVIRONMENT` | `production` | Entorno |
| `HOST` | `127.0.0.1` | Bind address (NUNCA 0.0.0.0 en prod) |
| `PORT` | `8001` | Puerto del microservicio |
| `GEOJSON_PATH` | `data/bolivia.geojson` | Ruta al archivo GeoJSON |
| `ALLOWED_ORIGINS` | `["http://127.0.0.1:3000"]` | CORS origins permitidos |

---

## API Reference

### Backend NestJS (`/api/`)

- `POST /api/formularios/empresas` — Registrar empresa + proyectos
- `POST /api/formularios/organizaciones` — Registrar organización + proyectos
- `GET /api/proyectos/map` — Proyectos con lat/lng para mapa
- `GET /api/proyectos` — Listado paginado con filtros
- `GET /api/dashboard/resumen` — KPIs globales
- `GET /api/dashboard/por-region` — KPIs por departamento
- `GET /api/auth/login` — Autenticación JWT
- Swagger completo en `/api/documentation` (en desarrollo)

### Microservicio GeoRef (`http://127.0.0.1:8001`)

- `POST /geo/pip` — Point-in-Polygon: coordenadas → departamento/municipio
- `GET /geo/health` — Estado del servicio

---

## Degradación Elegante

Si el microservicio GeoRef está caído, el backend NestJS sigue funcionando:
- Los proyectos se crean con `department=null`, `municipality=null`
- El campo `georef_failed=true` marca el registro para reintentar en el futuro
- Ningún endpoint del backend devuelve error 500 por culpa de GeoRef
