# Guía de Arquitectura e Integración — Plataforma Kaa Iya
## Microservicio GeoRef + Backend NestJS + Frontend React

**Versión:** 1.0.0  
**Rol:** Arquitecto de Software Full-Stack / DevOps Senior  
**Proyecto:** Kaa Iya — UCB "San Pablo"  
**Stack:** NestJS 11 · FastAPI · React 19 · PostgreSQL 16 · Nginx · PM2

---

## Índice

1. [Análisis de Viabilidad y Decisiones de Arquitectura](#1-análisis-de-viabilidad-y-decisiones-de-arquitectura)
2. [Estructura de Repositorio](#2-estructura-de-repositorio)
3. [Microservicio GeoRef — FastAPI](#3-microservicio-georef--fastapi)
4. [Integración en Backend NestJS](#4-integración-en-backend-nestjs)
5. [Contrato de API entre componentes](#5-contrato-de-api-entre-componentes)
6. [Configuración Nginx — Proxy Inverso](#6-configuración-nginx--proxy-inverso)
7. [Gestión de Procesos con PM2](#7-gestión-de-procesos-con-pm2)
8. [Variables de Entorno y Seguridad](#8-variables-de-entorno-y-seguridad)
9. [Flujo de Datos Completo](#9-flujo-de-datos-completo)
10. [Checklist de Despliegue en Servidor UCB](#10-checklist-de-despliegue-en-servidor-ucb)

---

## 1. Análisis de Viabilidad y Decisiones de Arquitectura

### 1.1 Evaluación del enfoque anterior

El enfoque generado previamente era funcional pero presentaba varias oportunidades de mejora desde una perspectiva de producción:

| Aspecto | Enfoque anterior | Enfoque mejorado (este documento) |
|---|---|---|
| Estructura de carpetas | Sin separación clara | Monorepo con límites bien definidos |
| Configuración | Variables hardcodeadas | `.env` por entorno + validación con Pydantic Settings |
| GeoJSON data | Descarga manual sin instrucciones claras | Script automatizado + source oficial GADM |
| CORS en GeoRef | `allow_origins=["*"]` en producción | Lista blanca controlada via env |
| Integración NestJS | Módulo básico sin Circuit Breaker | Módulo con fallback, logging estructurado y health check |
| PM2 | Comando inline sin ecosistema | `ecosystem.config.js` versionable |
| Nginx | No contemplado para GeoRef | Configuración completa con routing a los 3 servicios |
| Logging | Sin logging estructurado | Logging unificado en ambos servicios |

### 1.2 Decisiones de Arquitectura (ADR)

**ADR-001: FastAPI + Gunicorn con `--preload` sobre alternativas (Flask, Django)**
El informe especifica explícitamente FastAPI + Gunicorn. Esta decisión es correcta y se mantiene. El flag `--preload` es mandatorio: sin él, cada worker de Gunicorn cargaría los 120 MB del `bolivia.geojson` de forma independiente, multiplicando el consumo de RAM de forma inviable en la configuración mínima del servidor.

**ADR-002: El Frontend NO llama directamente al microservicio GeoRef**
El frontend consume únicamente el backend NestJS. El backend es el que llama a GeoRef internamente. Esto garantiza que el microservicio no esté expuesto públicamente, permite centralizar autenticación, y mantiene un contrato de API único para el frontend.

**ADR-003: PMTiles servidos por Nginx, no por el microservicio**
El archivo `bolivia.pmtiles` (237.6 MB) se sirve como archivo estático directamente desde Nginx con soporte de `Range Requests`. Esto elimina carga innecesaria del proceso FastAPI y permite que Nginx use su page cache para optimizar las lecturas desde SSD.

**ADR-004: Estructura de monorepo sin herramientas de monorepo complejas**
Para un equipo de tamaño académico se utiliza una estructura de monorepo simple (una sola raíz Git, carpetas por servicio) sin overhead de Nx/Turborepo. Cada subcarpeta tiene su propio package manager y entorno independiente.

---

## 2. Estructura de Repositorio

```
kaaiya/                              ← raíz del repositorio Git
│
├── .gitignore                       ← raíz: ignora node_modules, venv, .env, dist
├── README.md                        ← documentación general del proyecto
│
├── amazonia-api/                    ← Backend NestJS (ya existe)
│   ├── src/
│   │   ├── georef/                  ← módulo nuevo (tú lo agregas)
│   │   │   ├── georef.module.ts
│   │   │   ├── georef.service.ts
│   │   │   ├── georef.dto.ts
│   │   │   └── georef.health.ts
│   │   └── ...resto de módulos existentes
│   ├── .env                         ← NO versionado
│   ├── .env.example                 ← SÍ versionado (plantilla)
│   └── package.json
│
├── georef-service/                  ← Microservicio nuevo (tú lo creas)
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                  ← entry point FastAPI
│   │   ├── config.py                ← settings con Pydantic
│   │   ├── routers/
│   │   │   └── geo.py               ← endpoints de georreferenciación
│   │   ├── services/
│   │   │   └── geo_service.py       ← lógica de negocio (PiP)
│   │   └── models/
│   │       └── schemas.py           ← modelos Pydantic (request/response)
│   ├── data/
│   │   ├── bolivia.geojson          ← NO versionado (archivo grande)
│   │   ├── bolivia.pmtiles          ← NO versionado (archivo grande)
│   │   └── .gitkeep                 ← mantiene la carpeta en git
│   ├── tests/
│   │   └── test_geo.py
│   ├── .env                         ← NO versionado
│   ├── .env.example                 ← SÍ versionado
│   ├── requirements.txt
│   ├── gunicorn.conf.py             ← configuración de Gunicorn versionable
│   └── Makefile                     ← comandos de desarrollo simplificados
│
├── frontend/                        ← Frontend React (equipo de frontend)
│   ├── src/
│   ├── .env.example
│   └── package.json
│
└── nginx/                           ← configuración de Nginx versionable
    ├── nginx.conf
    └── sites-available/
        └── kaaiya.conf
```

**Regla de Git para archivos grandes:**

Agrega esto al `.gitignore` de la raíz y al de `georef-service/`:

```gitignore
# Datos geoespaciales (archivos grandes, se obtienen con script)
georef-service/data/*.geojson
georef-service/data/*.pmtiles
georef-service/data/*.parquet

# Entornos
.env
venv/
__pycache__/
*.pyc

# Build artifacts
dist/
node_modules/
```

---

## 3. Microservicio GeoRef — FastAPI

### 3.1 Obtener los datos geoespaciales de Bolivia

Ejecuta este script **una sola vez** para descargar y preparar los datos. No se versiona el archivo, sí el script.

```bash
# georef-service/scripts/download_data.sh
#!/usr/bin/env bash
set -euo pipefail

DATA_DIR="$(dirname "$0")/../data"
mkdir -p "$DATA_DIR"

echo "→ Descargando límites administrativos de Bolivia (GADM nivel 2)..."
# Fuente oficial: GADM - Global Administrative Areas
curl -L "https://geodata.ucdavis.edu/gadm/gadm4.1/json/gadm41_BOL_2.json" \
     -o "$DATA_DIR/bolivia.geojson"

echo "→ Verificando integridad del archivo..."
python3 -c "
import json, sys
with open('$DATA_DIR/bolivia.geojson') as f:
    data = json.load(f)
features = len(data.get('features', []))
print(f'   ✓ GeoJSON válido: {features} features cargadas')
if features == 0:
    sys.exit(1)
"

echo "✓ Datos descargados correctamente en $DATA_DIR/"
```

```bash
chmod +x georef-service/scripts/download_data.sh
./georef-service/scripts/download_data.sh
```

> **Nota sobre PMTiles:** El archivo `bolivia.pmtiles` para servir teselas vectoriales se obtiene de forma separada (Protomaps u OpenMapTiles). Por ahora el microservicio GeoRef solo necesita `bolivia.geojson`. El `.pmtiles` lo sirve Nginx directamente (ver Sección 6).

### 3.2 Entorno virtual y dependencias

```bash
cd georef-service

# Crear entorno virtual con Python 3.11+ (recomendado sobre 3.10)
python3.11 -m venv venv
source venv/bin/activate

pip install --upgrade pip

pip install \
    fastapi==0.115.0 \
    uvicorn[standard]==0.30.6 \
    gunicorn==22.0.0 \
    geopandas==1.0.1 \
    shapely==2.0.6 \
    pydantic-settings==2.4.0 \
    python-dotenv==1.0.1

pip freeze > requirements.txt
```

### 3.3 Configuración con Pydantic Settings

```python
# georef-service/app/config.py
"""
Gestión centralizada de configuración.
Pydantic Settings valida automáticamente el .env al iniciar.
Falla rápido si falta una variable obligatoria.
"""
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # Servidor
    host: str = "127.0.0.1"     # Por defecto solo escucha localmente (seguridad)
    port: int = 8001
    environment: str = "development"

    # Datos
    geojson_path: str = "data/bolivia.geojson"

    # Seguridad: lista de orígenes que pueden llamar a este servicio
    # En producción: solo el backend NestJS (127.0.0.1)
    allowed_origins: List[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]

    # Logging
    log_level: str = "info"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
```

```ini
# georef-service/.env.example  (versionar esto, NO el .env real)
HOST=127.0.0.1
PORT=8001
ENVIRONMENT=development
GEOJSON_PATH=data/bolivia.geojson
ALLOWED_ORIGINS=["http://localhost:3000"]
LOG_LEVEL=info
```

### 3.4 Schemas Pydantic (contrato de datos)

```python
# georef-service/app/models/schemas.py
from pydantic import BaseModel, Field, field_validator
from typing import Optional


class CoordinatesRequest(BaseModel):
    lat: float = Field(..., ge=-90, le=90, description="Latitud WGS84")
    lng: float = Field(..., ge=-180, le=180, description="Longitud WGS84")

    @field_validator("lat")
    @classmethod
    def lat_must_be_bolivia_range(cls, v: float) -> float:
        # Bolivia: lat entre -23 y -9 aproximadamente
        if not (-23.0 <= v <= -9.0):
            raise ValueError(f"Latitud {v} está fuera del rango de Bolivia (-23 a -9)")
        return v

    @field_validator("lng")
    @classmethod
    def lng_must_be_bolivia_range(cls, v: float) -> float:
        # Bolivia: lng entre -70 y -57 aproximadamente
        if not (-70.0 <= v <= -57.0):
            raise ValueError(f"Longitud {v} está fuera del rango de Bolivia (-70 a -57)")
        return v


class RegionResponse(BaseModel):
    found: bool
    lat: float
    lng: float
    department: Optional[str] = None    # Nivel 1 (ej: "Santa Cruz")
    municipality: Optional[str] = None  # Nivel 2 (ej: "San Ignacio")
    country: str = "Bolivia"


class HealthResponse(BaseModel):
    status: str
    environment: str
    features_loaded: int
    geojson_path: str
```

### 3.5 Servicio de georreferenciación (lógica de negocio)

```python
# georef-service/app/services/geo_service.py
"""
La instancia de GeoDataFrame se carga UNA SOLA VEZ al importar este módulo.
Gunicorn con --preload garantiza que esta carga ocurra en el proceso padre
y que la memoria sea compartida (copy-on-write) entre todos los workers.
"""
import logging
from pathlib import Path

import geopandas as gpd
from shapely.geometry import Point

from app.config import settings
from app.models.schemas import CoordinatesRequest, RegionResponse

logger = logging.getLogger(__name__)


def _load_geodataframe() -> gpd.GeoDataFrame:
    """Carga y valida el GeoDataFrame al inicio. Falla rápido si hay error."""
    path = Path(settings.geojson_path)

    if not path.exists():
        raise FileNotFoundError(
            f"Archivo GeoJSON no encontrado: {path.resolve()}\n"
            f"Ejecuta: ./scripts/download_data.sh"
        )

    logger.info(f"Cargando GeoDataFrame desde {path}...")
    gdf = gpd.read_file(path)

    # Asegurar sistema de referencia WGS84 (EPSG:4326)
    if gdf.crs is None or gdf.crs.to_epsg() != 4326:
        gdf = gdf.to_crs(epsg=4326)

    # Validar geometrías inválidas y corregirlas
    invalid_count = (~gdf.is_valid).sum()
    if invalid_count > 0:
        logger.warning(f"Corrigiendo {invalid_count} geometrías inválidas con buffer(0)...")
        gdf["geometry"] = gdf.geometry.buffer(0)

    logger.info(f"GeoDataFrame cargado: {len(gdf)} features, CRS: {gdf.crs}")
    return gdf


# Carga global: ocurre al importar el módulo (una sola vez con --preload)
_gdf: gpd.GeoDataFrame = _load_geodataframe()
_features_count: int = len(_gdf)


def point_in_polygon(request: CoordinatesRequest) -> RegionResponse:
    """
    Determina el departamento y municipio para unas coordenadas dadas.
    Retorna RegionResponse con found=False si el punto está fuera de Bolivia.
    """
    point = Point(request.lng, request.lat)  # Shapely: (lon, lat)

    matches = _gdf[_gdf.geometry.contains(point)]

    if matches.empty:
        return RegionResponse(found=False, lat=request.lat, lng=request.lng)

    row = matches.iloc[0]

    # GADM nivel 2: NAME_1 = departamento, NAME_2 = municipio
    department = str(row.get("NAME_1", "")) or None
    municipality = str(row.get("NAME_2", "")) or None

    return RegionResponse(
        found=True,
        lat=request.lat,
        lng=request.lng,
        department=department,
        municipality=municipality,
    )


def get_features_count() -> int:
    return _features_count
```

### 3.6 Router de endpoints

```python
# georef-service/app/routers/geo.py
from fastapi import APIRouter, HTTPException, status

from app.models.schemas import CoordinatesRequest, RegionResponse, HealthResponse
from app.services import geo_service
from app.config import settings

router = APIRouter(prefix="/geo", tags=["Georreferenciación"])


@router.post(
    "/pip",
    response_model=RegionResponse,
    summary="Point-in-Polygon",
    description="Determina el departamento y municipio para coordenadas WGS84.",
)
def point_in_polygon(request: CoordinatesRequest) -> RegionResponse:
    try:
        return geo_service.point_in_polygon(request)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error procesando coordenadas: {str(e)}",
        )


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Health Check",
    description="Verifica que el servicio y los datos están disponibles.",
)
def health_check() -> HealthResponse:
    return HealthResponse(
        status="ok",
        environment=settings.environment,
        features_loaded=geo_service.get_features_count(),
        geojson_path=settings.geojson_path,
    )
```

### 3.7 Entry point principal

```python
# georef-service/app/main.py
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import geo

# Configurar logging estructurado
logging.basicConfig(
    level=settings.log_level.upper(),
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)

app = FastAPI(
    title="GeoRef Service — Kaa Iya",
    description="Microservicio de georreferenciación para la plataforma Kaa Iya (UCB).",
    version="1.0.0",
    # En producción, deshabilitar la UI de docs si no se necesita externamente
    docs_url="/docs" if settings.environment != "production" else None,
    redoc_url=None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,   # controlado por .env, NO hardcodeado
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

app.include_router(geo.router)
```

### 3.8 Configuración de Gunicorn (versionable)

```python
# georef-service/gunicorn.conf.py
"""
Configuración de Gunicorn como archivo Python (mejor que flags de línea de comandos).
Se versiona junto al código.
"""
import multiprocessing

# Workers: (2 × núcleos) + 1 es la fórmula estándar para tareas CPU-bound
# Para el servidor UCB con 4 núcleos mínimo: 9 workers
# Ajustar según RAM disponible (cada worker ocupa ~150 MB extra sobre el --preload)
workers = multiprocessing.cpu_count() * 2 + 1

# Worker class: UvicornWorker para compatibilidad ASGI con FastAPI
worker_class = "uvicorn.workers.UvicornWorker"

# Bind: escuchar solo en loopback (Nginx hace el proxy público)
bind = "127.0.0.1:8001"

# CRÍTICO: preload carga el GeoDataFrame una sola vez en el proceso padre.
# Los workers heredan la memoria (copy-on-write). Sin esto, cada worker
# cargaría los 120 MB de bolivia.geojson por separado.
preload_app = True

# Timeouts
timeout = 30          # Tiempo máximo de una request
keepalive = 5         # Keepalive para conexiones persistentes
graceful_timeout = 30 # Tiempo para que los workers terminen requests en curso

# Logging
accesslog = "-"       # stdout (PM2 captura los logs)
errorlog = "-"        # stdout
loglevel = "info"
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s %(D)s'
```

### 3.9 Makefile para desarrollo

```makefile
# georef-service/Makefile
.PHONY: install dev prod test lint data

install:
	python3.11 -m venv venv
	./venv/bin/pip install --upgrade pip
	./venv/bin/pip install -r requirements.txt

data:
	./scripts/download_data.sh

dev:
	./venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8001 --reload

prod:
	./venv/bin/gunicorn app.main:app -c gunicorn.conf.py

test:
	./venv/bin/pytest tests/ -v --tb=short

lint:
	./venv/bin/ruff check app/ tests/
```

---

## 4. Integración en Backend NestJS

El backend es el **único** que habla con GeoRef. El frontend no lo llama directamente.

### 4.1 Instalar dependencia

```bash
cd amazonia-api
npm install @nestjs/axios axios
```

### 4.2 Estructura del módulo Georef en NestJS

```
src/georef/
├── georef.module.ts      ← declaración del módulo
├── georef.service.ts     ← lógica de comunicación con el microservicio
├── georef.dto.ts         ← tipos TypeScript (espejo del schema Python)
└── georef.health.ts      ← indicador de health para el módulo
```

### 4.3 DTOs (contrato TypeScript)

```typescript
// src/georef/georef.dto.ts
export interface GeoRefRequest {
  lat: number;
  lng: number;
}

export interface GeoRefResponse {
  found: boolean;
  lat: number;
  lng: number;
  department: string | null;
  municipality: string | null;
  country: string;
}

export interface GeoRefHealthResponse {
  status: string;
  environment: string;
  features_loaded: number;
  geojson_path: string;
}
```

### 4.4 Servicio de integración

```typescript
// src/georef/georef.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom, TimeoutError } from 'rxjs';
import { timeout, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { GeoRefRequest, GeoRefResponse, GeoRefHealthResponse } from './georef.dto';

@Injectable()
export class GeorefService {
  private readonly logger = new Logger(GeorefService.name);
  private readonly baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>('GEOREF_URL', 'http://127.0.0.1:8001');
  }

  /**
   * Determina departamento y municipio para unas coordenadas.
   * Si el microservicio no responde, retorna null (degradación elegante).
   * El backend NO falla si GeoRef falla.
   */
  async resolveCoordinates(request: GeoRefRequest): Promise<GeoRefResponse | null> {
    try {
      const response = await firstValueFrom(
        this.httpService
          .post<GeoRefResponse>(`${this.baseUrl}/geo/pip`, request)
          .pipe(
            timeout(5000), // 5 segundos máximo
            catchError((err) => {
              if (err instanceof TimeoutError) {
                this.logger.warn(`GeoRef timeout para coords (${request.lat}, ${request.lng})`);
              } else {
                this.logger.error(`GeoRef error: ${err.message}`);
              }
              return of(null);
            }),
          ),
      );
      return response?.data ?? null;
    } catch (err) {
      this.logger.error(`GeoRef llamada fallida: ${err.message}`);
      return null; // degradación elegante: el proyecto se guarda sin región
    }
  }

  /**
   * Health check del microservicio.
   * Úsalo en tu endpoint /health del backend principal.
   */
  async checkHealth(): Promise<GeoRefHealthResponse | null> {
    try {
      const response = await firstValueFrom(
        this.httpService
          .get<GeoRefHealthResponse>(`${this.baseUrl}/geo/health`)
          .pipe(timeout(3000)),
      );
      return response.data;
    } catch {
      return null;
    }
  }
}
```

### 4.5 Módulo NestJS

```typescript
// src/georef/georef.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GeorefService } from './georef.service';

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        timeout: configService.get<number>('GEOREF_TIMEOUT_MS', 5000),
        maxRedirects: 0, // No queremos redirecciones a servicios internos
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [GeorefService],
  exports: [GeorefService], // exportar para usar en otros módulos
})
export class GeorefModule {}
```

### 4.6 Ejemplo de uso en el módulo de Proyectos

```typescript
// src/projects/projects.module.ts
import { Module } from '@nestjs/common';
import { GeorefModule } from '../georef/georef.module';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';

@Module({
  imports: [GeorefModule],
  providers: [ProjectsService],
  controllers: [ProjectsController],
})
export class ProjectsModule {}
```

```typescript
// src/projects/projects.service.ts (fragmento relevante)
import { Injectable } from '@nestjs/common';
import { GeorefService } from '../georef/georef.service';
import { CreateProjectDto } from './dto/create-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private readonly georefService: GeorefService) {}

  async create(dto: CreateProjectDto) {
    // Enriquecer el proyecto con datos de región (si GeoRef está disponible)
    let region = null;
    if (dto.lat && dto.lng) {
      region = await this.georefService.resolveCoordinates({
        lat: dto.lat,
        lng: dto.lng,
      });
    }

    // Guardar en base de datos con o sin región
    return this.projectsRepository.save({
      ...dto,
      department: region?.department ?? null,
      municipality: region?.municipality ?? null,
    });
  }
}
```

### 4.7 Variable de entorno en NestJS

```ini
# amazonia-api/.env.example
# URL interna del microservicio GeoRef (nunca expuesta al exterior)
GEOREF_URL=http://127.0.0.1:8001
GEOREF_TIMEOUT_MS=5000
```

---

## 5. Contrato de API entre componentes

Este es el contrato que define la comunicación entre los tres servicios. El equipo de frontend y el de backend deben acordarlo antes de implementar.

### Endpoint 1: Point-in-Polygon

```
POST http://127.0.0.1:8001/geo/pip
(Llamado internamente por NestJS, nunca por el frontend)

Request Body:
{
  "lat": -17.7833,
  "lng": -63.1821
}

Response 200 — punto dentro de Bolivia:
{
  "found": true,
  "lat": -17.7833,
  "lng": -63.1821,
  "department": "Santa Cruz",
  "municipality": "Santa Cruz de la Sierra",
  "country": "Bolivia"
}

Response 200 — punto fuera de Bolivia:
{
  "found": false,
  "lat": 40.7128,
  "lng": -74.0060,
  "department": null,
  "municipality": null,
  "country": "Bolivia"
}

Response 422 — coordenadas inválidas:
{
  "detail": [{ "msg": "Latitud 40.7 está fuera del rango de Bolivia" }]
}
```

### Endpoint 2: Health Check

```
GET http://127.0.0.1:8001/geo/health

Response 200:
{
  "status": "ok",
  "environment": "production",
  "features_loaded": 339,
  "geojson_path": "data/bolivia.geojson"
}
```

---

## 6. Configuración Nginx — Proxy Inverso

Nginx es el único punto de entrada público. Enruta el tráfico a los servicios internos y sirve los archivos estáticos.

```nginx
# nginx/sites-available/kaaiya.conf

# Redirección HTTP → HTTPS
server {
    listen 80;
    server_name kaaiya.ucb.edu.bo;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name kaaiya.ucb.edu.bo;

    # SSL — Certbot gestionará estos archivos
    ssl_certificate     /etc/letsencrypt/live/kaaiya.ucb.edu.bo/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/kaaiya.ucb.edu.bo/privkey.pem;
    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;

    # Headers de seguridad
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header Referrer-Policy strict-origin-when-cross-origin always;

    # ─────────────────────────────────────────────
    # 1. Frontend — SPA React (archivos estáticos)
    # ─────────────────────────────────────────────
    root /var/www/kaaiya/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;  # SPA routing
    }

    # ─────────────────────────────────────────────
    # 2. Backend — NestJS API
    # ─────────────────────────────────────────────
    location /api/ {
        proxy_pass         http://127.0.0.1:3000/;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 30s;
    }

    # ─────────────────────────────────────────────
    # 3. Teselas PMTiles (archivos estáticos, SSD)
    #    El microservicio GeoRef NO sirve esto.
    #    Nginx lo sirve directamente con Range Requests.
    # ─────────────────────────────────────────────
    location /tiles/ {
        alias /var/www/kaaiya/tiles/;

        # Range requests: OBLIGATORIO para PMTiles
        add_header Accept-Ranges bytes;

        # Cache agresivo: los tiles no cambian frecuentemente
        expires 30d;
        add_header Cache-Control "public, immutable";

        # Solo se permiten archivos .pmtiles
        location ~* \.pmtiles$ {
            add_header Access-Control-Allow-Origin "*";
            add_header Access-Control-Allow-Methods "GET, OPTIONS";
            add_header Access-Control-Allow-Headers "Range";
        }
    }

    # ─────────────────────────────────────────────
    # NOTA DE SEGURIDAD:
    # El microservicio GeoRef (puerto 8001) NO tiene
    # ningún location aquí. Es estrictamente interno.
    # Solo NestJS puede llamarlo vía loopback.
    # ─────────────────────────────────────────────
}
```

---

## 7. Gestión de Procesos con PM2

### 7.1 Ecosistema PM2 (archivo versionable)

```javascript
// pm2.ecosystem.config.js  (en la raíz del proyecto)
module.exports = {
  apps: [
    // ── Backend NestJS ──────────────────────────
    {
      name: 'amazonia-api',
      cwd: './amazonia-api',
      script: 'dist/main.js',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      // Reinicio automático si el proceso consume más de 512 MB
      max_memory_restart: '512M',
      // Logging
      out_file: '/var/log/pm2/amazonia-api.out.log',
      error_file: '/var/log/pm2/amazonia-api.error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      // Reintentos ante fallos
      restart_delay: 3000,
      max_restarts: 10,
    },

    // ── Microservicio GeoRef ─────────────────────
    {
      name: 'georef-service',
      cwd: './georef-service',
      // PM2 ejecuta Gunicorn que a su vez gestiona sus propios workers
      script: './venv/bin/gunicorn',
      args: 'app.main:app -c gunicorn.conf.py',
      interpreter: 'none',    // Gunicorn es el intérprete, no Python directamente
      watch: false,
      env_production: {
        ENVIRONMENT: 'production',
      },
      // GeoRef consume hasta 2 GB; reiniciar si supera ese límite
      max_memory_restart: '2200M',
      out_file: '/var/log/pm2/georef-service.out.log',
      error_file: '/var/log/pm2/georef-service.error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      restart_delay: 5000,    // Esperar 5s antes de reiniciar (--preload tarda)
      max_restarts: 5,
    },
  ],
};
```

### 7.2 Comandos de operación

```bash
# Iniciar todos los servicios en producción
pm2 start pm2.ecosystem.config.js --env production

# Ver estado
pm2 status

# Ver logs en tiempo real
pm2 logs amazonia-api
pm2 logs georef-service

# Reiniciar sin downtime (NestJS)
pm2 reload amazonia-api

# Reiniciar GeoRef (necesario si cambia el GeoJSON)
pm2 restart georef-service

# Guardar configuración para arranque automático con el servidor
pm2 save
pm2 startup   # sigue las instrucciones que imprime este comando
```

---

## 8. Variables de Entorno y Seguridad

### Regla de oro: ningún secreto en el código fuente

```
amazonia-api/.env           ← nunca en Git
amazonia-api/.env.example   ← sí en Git (valores de ejemplo, sin secretos reales)
georef-service/.env         ← nunca en Git
georef-service/.env.example ← sí en Git
```

### amazonia-api/.env.example

```ini
# Runtime
NODE_ENV=production
PORT=3000

# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=kaaiya_user
DB_PASSWORD=CAMBIAR_EN_PRODUCCION
DB_DATABASE=kaaiya_db

# Autenticación JWT
JWT_SECRET=CAMBIAR_EN_PRODUCCION_minimo_32_caracteres
JWT_EXPIRES_IN=7d

# Microservicio GeoRef (interno, no expuesto)
GEOREF_URL=http://127.0.0.1:8001
GEOREF_TIMEOUT_MS=5000
```

### georef-service/.env.example

```ini
HOST=127.0.0.1
PORT=8001
ENVIRONMENT=production
GEOJSON_PATH=data/bolivia.geojson
# Solo el loopback del servidor puede llamar a GeoRef
ALLOWED_ORIGINS=["http://127.0.0.1:3000"]
LOG_LEVEL=info
```

---

## 9. Flujo de Datos Completo

```
┌─────────────────────────────────────────────────────────────────────┐
│                         INTERNET                                     │
└─────────────────────────────┬───────────────────────────────────────┘
                              │ HTTPS :443
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      NGINX (proxy inverso)                           │
│                                                                      │
│  /           → sirve frontend/dist/  (SPA React - archivos estát.)  │
│  /api/*      → proxy → NestJS :3000                                  │
│  /tiles/*    → sirve tiles/bolivia.pmtiles  (Range Requests)         │
│                                                                      │
│  Puerto 8001 → NO EXPUESTO (GeoRef solo interno)                     │
└──────────┬──────────────────────────────┬───────────────────────────┘
           │                              │
           ▼                              ▼
┌──────────────────┐            ┌─────────────────────────────────────┐
│  Frontend React  │            │      Backend NestJS :3000            │
│                  │            │                                      │
│  MapLibre GL     │            │  • Módulo Proyectos                  │
│  usa pmtiles://  │            │  • Módulo Actores                    │
│  protocol para   │            │  • GeorefModule (nuevo)              │
│  leer tiles de   │            │    └─ georef.service.ts              │
│  Nginx           │            │        └─ POST /geo/pip              │
│                  │            │            (solo si hay coords)      │
└──────────────────┘            └───────────────┬─────────────────────┘
                                                │ HTTP interno :8001
                                                ▼
                                ┌───────────────────────────────────┐
                                │   Microservicio GeoRef :8001      │
                                │   FastAPI + Gunicorn --preload    │
                                │                                   │
                                │   bolivia.geojson (120 MB RAM)    │
                                │   compartida entre workers        │
                                │                                   │
                                │   GET  /geo/health                │
                                │   POST /geo/pip  → { dept, muni } │
                                └───────────────────────────────────┘
```

### Flujo típico: un actor registra un proyecto con ubicación

```
1. Frontend → POST /api/projects  { lat: -17.78, lng: -63.18, ...datos }
2. NestJS (ProjectsService.create) → llama GeorefService.resolveCoordinates()
3. GeorefService → POST http://127.0.0.1:8001/geo/pip { lat, lng }
4. GeoRef → retorna { found: true, department: "Santa Cruz", municipality: "..." }
5. NestJS → guarda proyecto en PostgreSQL con department y municipality
6. NestJS → retorna el proyecto creado al frontend
7. Frontend → muestra el proyecto en el mapa (MapLibre GL lee tiles de Nginx)
```

---

## 10. Checklist de Despliegue en Servidor UCB

Ejecuta estos pasos en orden en el servidor de producción.

### Fase 1: Preparar el servidor

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar dependencias del sistema
sudo apt install -y python3.11 python3.11-venv python3.11-dev \
     build-essential libgeos-dev libgdal-dev gdal-bin \
     nginx certbot python3-certbot-nginx \
     git curl

# Instalar Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar PM2 globalmente
sudo npm install -g pm2

# Crear directorio de logs para PM2
sudo mkdir -p /var/log/pm2
sudo chown $USER:$USER /var/log/pm2
```

### Fase 2: Clonar y configurar

```bash
# Clonar repositorio
git clone <URL_DEL_REPO> /var/www/kaaiya
cd /var/www/kaaiya

# ── Backend NestJS ──
cd amazonia-api
cp .env.example .env
nano .env   # editar con los valores reales de producción
npm install
npm run build

# ── Microservicio GeoRef ──
cd ../georef-service
cp .env.example .env
nano .env   # editar con valores de producción
make install
make data   # descarga bolivia.geojson (requiere internet)

# ── Tiles ──
mkdir -p /var/www/kaaiya/tiles
# Copiar bolivia.pmtiles a /var/www/kaaiya/tiles/
# (transferir desde tu máquina de desarrollo con scp o rsync)
```

### Fase 3: Configurar Nginx

```bash
sudo cp nginx/sites-available/kaaiya.conf /etc/nginx/sites-available/kaaiya.conf
sudo ln -s /etc/nginx/sites-available/kaaiya.conf /etc/nginx/sites-enabled/

# Verificar sintaxis
sudo nginx -t

# Obtener certificado SSL
sudo certbot --nginx -d kaaiya.ucb.edu.bo

# Recargar Nginx
sudo systemctl reload nginx
```

### Fase 4: Iniciar procesos

```bash
cd /var/www/kaaiya

# Iniciar todos los servicios
pm2 start pm2.ecosystem.config.js --env production

# Verificar que todo está corriendo
pm2 status

# Persistir para que arranquen con el servidor
pm2 save
pm2 startup   # ejecutar el comando que imprime
```

### Fase 5: Verificar la integración

```bash
# ① GeoRef está corriendo y datos cargados
curl http://127.0.0.1:8001/geo/health

# ② NestJS puede hablar con GeoRef
curl -X POST http://127.0.0.1:3000/api/georef/test \
     -H "Content-Type: application/json" \
     -d '{"lat": -17.7833, "lng": -63.1821}'

# ③ Nginx sirve correctamente (desde afuera)
curl https://kaaiya.ucb.edu.bo/api/health
```

---

## Tests mínimos del microservicio

```python
# georef-service/tests/test_geo.py
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health():
    response = client.get("/geo/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["features_loaded"] > 0


def test_pip_santa_cruz():
    """Coordenadas del centro de Santa Cruz de la Sierra."""
    response = client.post("/geo/pip", json={"lat": -17.7833, "lng": -63.1821})
    assert response.status_code == 200
    data = response.json()
    assert data["found"] is True
    assert "Santa Cruz" in data["department"]


def test_pip_outside_bolivia():
    """Coordenadas de Buenos Aires — fuera de Bolivia."""
    response = client.post("/geo/pip", json={"lat": -34.6037, "lng": -58.3816})
    # Pydantic rechaza esto por el validador de rango
    assert response.status_code == 422


def test_pip_returns_null_gracefully():
    """Punto en agua — fuera de polígonos pero dentro del rango de Bolivia."""
    # Este caso depende de los datos exactos del GeoJSON
    response = client.post("/geo/pip", json={"lat": -20.0, "lng": -68.0})
    assert response.status_code == 200
    # No lanza excepción, retorna found: false o un departamento
    data = response.json()
    assert "found" in data
```

---

*Este documento es la fuente de verdad técnica para la integración del microservicio GeoRef en la plataforma Kaa Iya. Versión 1.0.0 — Junio 2026.*
