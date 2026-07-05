# Análisis del Backend — Integración GeoRef
**Fecha:** 2026-06-12
**Proyecto:** Kaa Iya — Plataforma de Iniciativas Sostenibles, Amazonía Boliviana (UCB)

---

## 1. Módulos Existentes

| Módulo | Ruta | Descripción |
|--------|------|-------------|
| Auth | `src/modules/auth/` | JWT, usuarios, roles, solicitudes de acceso |
| Departamentos | `src/modules/ubicaciones-geograficas/departamentos/` | 9 departamentos bolivianos |
| Municipios | `src/modules/ubicaciones-geograficas/municipios/` | 105 municipios |
| ComunidadesIndigenas | `src/modules/ubicaciones-geograficas/comunidades-indigenas/` | 51 comunidades indígenas |
| ComunidadesMunicipios | `src/modules/ubicaciones-geograficas/comunidades-municipios/` | Relación M:M municipio↔comunidad |
| Areas | `src/modules/catalogos/areas/` | Conservación (1) / Desarrollo (2) |
| TiposProyectos | `src/modules/catalogos/tipos-proyectos/` | Tipos de proyecto |
| TiposOrganizaciones | `src/modules/catalogos/tipos-organizaciones/` | Tipos de organización |
| FormasJuridicas | `src/modules/catalogos/formas-juridicas/` | Formas jurídicas |
| ActoresMunicipales | `src/modules/catalogos/actores-municipales/` | Actores municipales |
| Apoyos | `src/modules/catalogos/apoyos/` | Tipos de apoyo |
| Motivos | `src/modules/catalogos/motivos/` | Motivos de apoyo |
| Ayudas | `src/modules/catalogos/ayudas/` | Tipos de ayuda |
| EspeciesAnimales | `src/modules/catalogos/especies-animales/` | Especies animales |
| PracticasAgricolas | `src/modules/catalogos/practicas-agricolas/` | Prácticas agrícolas |
| AreasDesarrollo | `src/modules/catalogos/areas-desarrollo/` | Áreas de desarrollo |
| Ods | `src/modules/catalogos/ods/` | ODS (17 objetivos) |
| Empresas | `src/modules/gestion-empresarial/empresas/` | Empresas/compañías |
| ApoyosEmpresas | `src/modules/gestion-empresarial/apoyos-empresas/` | Pivot empresa↔apoyo |
| MotivosEmpresas | `src/modules/gestion-empresarial/motivos-empresas/` | Pivot empresa↔motivo |
| OdsEmpresas | `src/modules/gestion-empresarial/ods-empresas/` | Pivot empresa↔ODS |
| DepartamentosEmpresas | `src/modules/gestion-empresarial/departamentos-empresas/` | Pivot empresa↔departamento |
| Organizaciones | `src/modules/gestion-organizacional/organizaciones/` | ONG, fundaciones |
| OrganizacionesEmpresas | `src/modules/gestion-organizacional/organizaciones-empresas/` | Pivot organización↔empresa |
| Proyectos | `src/modules/gestion-proyectos/proyectos/` | Proyectos (entidad central) |
| ProyectosEmpresas | `src/modules/gestion-proyectos/proyectos-empresas/` | Pivot proyecto↔empresa (con fechas) |
| ProyectosOrganizaciones | `src/modules/gestion-proyectos/proyectos-organizaciones/` | Pivot proyecto↔organización |
| LocalidadesProyectos | `src/modules/gestion-proyectos/localidades-proyectos/` | Municipio + comunidad por proyecto |
| ActoresProyectos | `src/modules/gestion-proyectos/actores-proyectos/` | Pivot proyecto↔actor |
| AyudasProyectos | `src/modules/gestion-proyectos/ayudas-proyectos/` | Pivot proyecto↔ayuda |
| ConservacionAnimales | `src/modules/gestion-conservacion/conservacion-animales/` | Especies por proyecto |
| ConservacionAgricolas | `src/modules/gestion-conservacion/conservacion-agricolas/` | Prácticas por proyecto |
| ComunidadesIndigenasAreas | `src/modules/gestion-comunidades/comunidades-indigenas-areas/` | Áreas de desarrollo por proyecto |
| Formularios | `src/app/formularios/` | Punto de entrada: registro empresa/organización (transaccional) |
| Dashboard | `src/modules/dashboard/` | KPIs y métricas agregadas (vistas materializadas PostgreSQL) |

**Total: 35 módulos**

---

## 2. Endpoints Relacionados con Ubicación/Georreferenciación

### Endpoints actuales con datos de localización (jerarquía administrativa, sin coordenadas GPS)

| Endpoint | Método | Auth | Datos de ubicación |
|----------|--------|------|-------------------|
| `GET /api/departamentos` | GET | Público | Lista 9 departamentos (campo `amazonico: boolean`) |
| `GET /api/municipios` | GET | Público | Lista municipios con filtro por `departamento` |
| `GET /api/municipios/:id/comunidades` | GET | Público | Comunidades indígenas de un municipio |
| `GET /api/comunidades-indigenas` | GET | Público | Lista comunidades indígenas |
| `POST /api/formularios/empresas` | POST | Público | Acepta `departamentos: number[]` (IDs) |
| `POST /api/formularios/organizaciones` | POST | Público | Acepta `idDepartamento: number` |
| `GET /api/proyectos` | GET | Opcional | Filtros: `departamento`, `municipio`, `comunidad` |
| `GET /api/dashboard/por-region` | GET | JWT | KPIs por departamento (ID+nombre, sin coordenadas) |

### Endpoints a CREAR por esta integración

| Endpoint | Descripción |
|----------|-------------|
| `GET /api/proyectos/map` | Proyectos con lat/lng para mapa MapLibre GL |
| `GET /api/georef/health` (interno) | Health del microservicio GeoRef |

---

## 3. Campos Actuales de Coordenadas en Entidades

**Resultado: NO EXISTEN campos lat/lng/geometry en ninguna entidad.**

El modelo de ubicación actual es puramente jerárquico por IDs administrativos:

```
Departamento (id, nombre, amazonico)
  └─ Municipio (id, nombre, id_departamento)
      └─ ComunidadIndigena (id, nombre)
          └─ ComunidadesMunicipios (id_municipio, id_comunidad)

Proyecto → LocalidadProyecto (id_proyecto, id_municipio, id_comunidad?)
```

**Tabla `proyectos`** — campos actuales:
- `id_proyecto`, `id_area`, `id_tipo`, `nombre`, `descripcion`
- `anio_inicio`, `anio_fin`
- `imagen_principal_url`, `imagen_principal_path`

**No hay**: `lat`, `lng`, `coordinates`, `location`, `geometry`, `point`, ni similar en ninguna entidad.

---

## 4. Análisis Arquitectónico

### Patrones clave encontrados

| Aspecto | Patrón |
|---------|--------|
| **Nombres de tabla** | `snake_case` plural (e.g., `localidades_proyectos`) |
| **Nombres de columna** | `snake_case` (e.g., `id_proyecto`, `anio_inicio`) |
| **Propiedades TypeScript** | `camelCase` (e.g., `idProyecto`, `anioInicio`) |
| **Excepciones** | Clases custom, NUNCA `HttpException` directo |
| **ConfigService** | Wrapper `MyConfigService` — NUNCA inyectar `ConfigService` directo |
| **Migraciones** | Scripts TypeScript manuales en `scripts/` (sin TypeORM CLI) |
| **HTTP externo** | `@nestjs/axios` NO está instalado (HttpModule no se usa en ningún módulo) |
| **Auth** | JWT + Guards por controlador, no global |
| **Rate limiting** | `ThrottlerGuard` global 60 req/60s |
| **Transacciones** | `DataSource.transaction(manager =>)` con EntityManager pasado como parámetro |
| **Swagger** | Activo en `development/test/debug`, desactivado en `production` |
| **Caché** | Map en memoria con `expiresAt`, usada en dashboard y proyectos |

### Patrón `esPropio` (catálogos custom)
Los catálogos permiten entradas definidas por el usuario con `esPropio: true`. Se usa en: TiposProyectos, FormasJuridicas, TiposOrganizaciones, ActorMunicipal, Apoyo, Motivo, EspecieAnimal, PracticaAgricola.

### Scripts de migración existentes
```json
"migrate:auth":   "ts-node ... scripts/migrate-auth-tables.ts"
"migrate:images": "ts-node ... scripts/migrate-images.ts"
"seed:superadmin": "ts-node ... scripts/seed-superadmin.ts"
```
Todos usan `ts-node -r tsconfig-paths/register scripts/...`. El script `migrate-georef.ts` seguirá este mismo patrón.

---

## 5. Gaps e Inconsistencias Encontradas

| Ítem | Descripción | Impacto |
|------|-------------|---------|
| Sin coordenadas GPS | Ninguna entidad tiene lat/lng | Bloquea mapa MapLibre GL |
| Sin `@nestjs/axios` | HttpModule no disponible para llamar a GeoRef | Requiere `npm install @nestjs/axios axios` |
| Sin health endpoint dedicado | Solo existe `GET /api/dashboard/salud` | Aceptable; se puede enriquecer |
| Sin migraciones formales TypeORM | Solo scripts manuales | Seguir el patrón existente |
| Typo en archivos | `enviroment.config.ts`, `my-fobidden.exception.ts` | Cosmético; NO corregir en este PR |
| Sin tests (.spec.ts) | 0 archivos de test | Fuera del alcance de esta integración |

---

## 6. Plan de Cambios Propuesto

### Cambios ADITIVOS (no rompen nada existente)

1. **`proyectos` tabla** — agregar 6 columnas:
   - `lat DECIMAL(10,7)` nullable
   - `lng DECIMAL(10,7)` nullable
   - `department VARCHAR(100)` nullable
   - `municipality VARCHAR(150)` nullable
   - `georef_resolved_at TIMESTAMP` nullable
   - `georef_failed BOOLEAN DEFAULT false`

2. **`proyecto.entity.ts`** — reflejar las 6 columnas nuevas

3. **DTOs** — agregar campos opcionales `lat?` y `lng?` con validators de rango Bolivia

4. **`formularios.service.ts`** — inyectar `GeorefService`, llamar después de crear proyecto

5. **Nuevo módulo** `src/modules/georef/` — HttpModule + servicio con degradación elegante

6. **Nuevo endpoint** `GET /api/proyectos/map` — antes del `:id` en el controller

7. **Nuevo microservicio** `georef-service/` — FastAPI + GeoPandas + Gunicorn

### Archivos NO modificados
- Todos los pivots, catálogos, módulos de conservación, módulo auth
- Patrón de transacciones (solo se añade la llamada GeoRef dentro de la transacción existente)
- Estructura de módulos existentes

---

## 7. Riesgos Identificados

| Riesgo | Severidad | Mitigación |
|--------|-----------|------------|
| GeoRef offline rompe el backend | CRÍTICO | `resolveCoordinates()` retorna `null` en cualquier error; nunca lanza excepción |
| Migración falla en producción | MEDIO | `ADD COLUMN IF NOT EXISTS` — idempotente; sin DROP ni ALTER TYPE |
| `@nestjs/axios` introduce breaking change | BAJO | Versión compatible con NestJS 11 confirmada (`@nestjs/axios@3.x`) |
| RAM insuficiente en servidor UCB | MEDIO | Usar `preload_app = True` en Gunicorn; ~300 MB total con 9 workers |
| GeoJSON de GADM no disponible | BAJO | URL oficial de geodata.ucdavis.edu; versionar `.env.example` con URL alternativa |

---

## 8. Dependencias Nuevas

| Paquete | Entorno | Motivo |
|---------|---------|--------|
| `@nestjs/axios` | NestJS | HttpModule para llamar a GeoRef |
| `axios` | NestJS | Peer dependency de @nestjs/axios |
| `fastapi==0.115.0` | Python | Framework microservicio |
| `geopandas==1.0.1` | Python | PiP con GeoDataFrame |
| `shapely==2.0.6` | Python | Geometría Point |
| `gunicorn==22.0.0` | Python | Servidor WSGI con preload |
| `uvicorn[standard]` | Python | Worker ASGI para Gunicorn |
| `pydantic-settings` | Python | Configuración desde `.env` |
