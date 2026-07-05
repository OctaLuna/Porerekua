# Contrato de API — Backend `api-rest-amazonia` ↔ Frontend `Porerekua`

> **Propósito.** El frontend está maquetado pero consume datos *mock* en inglés
> ([api/services/projects.service.ts](../api/services/projects.service.ts), 3 entidades:
> `Project/Foundation/Investigation`). El backend real (NestJS + TypeORM + Postgres, rama `Octa-backend`)
> expone **56 endpoints en 21 módulos**, en español y con un dominio mucho más rico. **Casi ningún campo coincide.**
> Este documento es la **guía de trabajo** para re-cablear el frontend módulo por módulo contra la API real.
>
> **Fuente de verdad:** Swagger en vivo → `http://localhost:3333/api/documentation` · JSON → `/api/documentation-json`.
> **Última sincronización:** 2026-06-23 (56 paths, 52 schemas).

---

## Índice

1. [Conexión y entorno](#1-conexión-y-entorno)
2. [Convenciones globales](#2-convenciones-globales)
3. [Tabla maestra (56 endpoints ↔ frontend)](#3-tabla-maestra)
4. [Contrato detallado por módulo](#4-contrato-detallado-por-módulo)
5. [Mapeo de campos es→en por entidad](#5-mapeo-de-campos-eses→en)
6. [Interfaces TypeScript propuestas](#6-interfaces-typescript-propuestas)
7. [Gaps y decisiones pendientes](#7-gaps-y-decisiones-pendientes)
8. [Plan de trabajo modular (checklist)](#8-plan-de-trabajo-modular)
9. [Apéndice](#9-apéndice)

---

## 1. Conexión y entorno

| Item | Valor |
|---|---|
| Base URL | `http://localhost:3333/api` |
| Prefijo global | `/api` (definido en `main.ts`) |
| Swagger UI | `http://localhost:3333/api/documentation` |
| OpenAPI JSON | `http://localhost:3333/api/documentation-json` |
| Frontend (Vite) | `http://localhost:3000` |

**Variables de entorno a introducir en el frontend** (`.env`, no commitear):

```bash
VITE_API_URL=http://localhost:3333/api
VITE_MAPTILER_KEY=<tu_key>   # hoy hardcodeada en GeoreferencingPage.tsx:91 → mover aquí
```

> ⚠️ **Seguridad:** la key de MapTiler está embebida en
> [pages/GeoreferencingPage.tsx:91](../pages/GeoreferencingPage.tsx#L91). Moverla a `VITE_MAPTILER_KEY` y
> restringirla por dominio en el panel de MapTiler.

**CORS:** el backend lee `DOMAIN_FRONTEND` (`.env`). Debe permitir `http://localhost:3000` en desarrollo
(hoy default `*`).

**Credenciales de prueba** (confirmar contra el seed): `admin@kaaiya.bo` / `MiPassword1!`.

---

## 2. Convenciones globales

Aplican a todos los módulos salvo que la ficha del endpoint diga lo contrario.

### 2.1 Sobre de paginación
Los listados devuelven:
```json
{ "data": [ /* ... */ ], "page": 1, "limit": 10, "pages": 5, "total": 42, "has_next": true, "has_prev": false }
```
Query params estándar: `?page=<int≥1>&limit=<int≥1>` (defaults `page=1`, `limit=10`).

### 2.2 Auth-gating (clave para el frontend)
- **Listas** (`/proyectos`, `/organizaciones`, `/empresas`): **auth opcional**. Sin token → objetos **resumidos (card)**. Con token válido → objeto **completo con relaciones**.
- **Detalle `/:id`** (proyectos, etc.): **requiere JWT**. Sin token responde `401`:
  ```json
  { "error": "AUTHENTICATION_REQUIRED", "message": "...", "login_url": "/api/auth/login" }
  ```
  (en algunos casos `{ "message": "Token inválido o no proporcionado" }`).
- **Dashboard** (`/dashboard/*`): **requiere JWT** completo.
- **Públicos puros** (sin token nunca): `*/forms`, `/proyectos/map`, `/proyectos/filtros-disponibles`,
  `/*/filtros-disponibles`, `/departamentos`, `/municipios`, `/ods`, `/areas*`, `/formularios/*`, `/auth/login`,
  `/auth/solicitar-acceso`, `/health*`.

### 2.3 Autenticación
- Header: `Authorization: Bearer <accessToken>`.
- `POST /auth/login` responde `{ accessToken, tipo: "Bearer", expiresIn: "24h" }`.
- Roles: `RoleEnum = { Superadmin: 1, Admin: 2, Investigador: 3 }`.
- Rate-limit en login: **5 intentos / 60 s por IP** → `429`.

### 2.4 Tipos y formato
- **IDs numéricos** (`number`), **no** strings (el mock usa strings → adaptar).
- **Nombres de campo en español**; fechas ISO 8601.
- `lat`/`lng` llegan como **string** en `/proyectos/map` (convertir a `number` en el cliente).

### 2.5 Uploads
- `multipart/form-data`, campo de archivo `file`, **máx 5 MB**, MIME `image/jpeg|png|webp`.
- El backend normaliza a **WebP 1200×800**. Respuesta típica: `{ imagenPrincipalUrl }` o imagen de galería `{ id, url, orden }`.

### 2.6 Errores
- Validación → `400` con `ValidationExceptionDto`.
- `401` no autenticado · `403` sin permiso de rol · `404` no encontrado · `409` conflicto · `429` rate-limit.

---

## 3. Tabla maestra

Leyenda auth: 🌐 público · 🔓 opcional (card/full) · 🔒 requiere token.

| Método · Ruta | Auth | Página/Componente frontend | Estado |
|---|---|---|---|
| `POST /auth/login` | 🌐 | [LoginPanel](../components/features/auth/LoginPanel.tsx) | ⚠️ hoy `console.log` |
| `POST /auth/logout` | 🔒 | Header (sesión) | ❌ por construir |
| `GET /auth/me` | 🔒 | AuthContext | ❌ por construir |
| `PUT /auth/me` | 🔒 | Perfil (admin) | ❌ por construir |
| `POST /auth/change-password` | 🔒 | Perfil / LoginPanel | ❌ por construir |
| `POST /auth/register` | 🔒 (Admin) | Admin → usuarios | ❌ por construir |
| `GET /auth/usuarios` | 🔒 (Admin) | Admin → usuarios | ❌ por construir |
| `GET /auth/usuarios/:id` | 🔒 (Admin) | Admin → usuarios | ❌ por construir |
| `PATCH /auth/usuarios/:id` | 🔒 (Admin) | Admin → usuarios | ❌ por construir |
| `DELETE /auth/usuarios/:id` | 🔒 (Admin) | Admin → usuarios | ❌ por construir |
| `POST /auth/solicitar-acceso` | 🌐 | [InvestigacionesPage](../pages/InvestigacionesPage.tsx) modal + [RegistrationPanel](../components/features/auth/RegistrationPanel.tsx) | ⚠️ hoy `console.log` |
| `GET /auth/solicitudes` | 🔒 (Admin) | Admin → bandeja solicitudes | ❌ por construir |
| `PATCH /auth/solicitudes/:id/aprobar` | 🔒 (Admin) | Admin → bandeja | ❌ por construir |
| `PATCH /auth/solicitudes/:id/rechazar` | 🔒 (Admin) | Admin → bandeja | ❌ por construir |
| `GET /proyectos` | 🔓 | [HomePage](../pages/HomePage.tsx), [DataPage](../pages/DataPage.tsx) | ⚠️ remapear mock |
| `GET /proyectos/map` | 🌐 | [GeoreferencingPage](../pages/GeoreferencingPage.tsx) | ⚠️ remapear mock |
| `GET /proyectos/filtros-disponibles` | 🌐 | Filtros de búsqueda | ❌ sin usar aún |
| `GET /proyectos/:id` | 🔒 | [DetailsPanel](../components/features/details/DetailsPanel.tsx) | ⚠️ requiere login |
| `POST /proyectos/:id/imagen-principal` | 🔒 | Admin → proyectos | ❌ por construir |
| `DELETE /proyectos/:id/imagen-principal` | 🔒 | Admin → proyectos | ❌ por construir |
| `POST /proyectos/:id/galeria` | 🔒 | Admin → proyectos | ❌ por construir |
| `DELETE /proyectos/:id/galeria/:imagenId` | 🔒 | Admin → proyectos | ❌ por construir |
| `PUT /proyectos/:id/galeria/orden` | 🔒 | Admin → proyectos | ❌ por construir |
| `GET /organizaciones` | 🔓 | [DataPage](../pages/DataPage.tsx) (Fundaciones) | ⚠️ remapear mock |
| `GET /organizaciones/filtros-disponibles` | 🌐 | Filtros | ❌ sin usar |
| `GET /organizaciones/:id` | 🔒 | [DetailsPanel](../components/features/details/DetailsPanel.tsx) | ⚠️ requiere login |
| `POST /organizaciones/:id/logo` | 🔒 | Admin | ❌ por construir |
| `DELETE /organizaciones/:id/logo` | 🔒 | Admin | ❌ por construir |
| `GET /empresas` | 🔓 | [DataPage](../pages/DataPage.tsx) (Fundaciones) | ⚠️ remapear mock |
| `GET /empresas/filtros-disponibles` | 🌐 | Filtros | ❌ sin usar |
| `GET /empresas/:id` | 🔒 | [DetailsPanel](../components/features/details/DetailsPanel.tsx) | ⚠️ requiere login |
| `POST /empresas/:id/logo` | 🔒 | Admin | ❌ por construir |
| `DELETE /empresas/:id/logo` | 🔒 | Admin | ❌ por construir |
| `POST /formularios/empresas` | 🌐 | [RegistrationPage](../pages/RegistrationPage.tsx), [HomePage](../pages/HomePage.tsx) panel | ⚠️ hoy `console.log` |
| `POST /formularios/organizaciones` | 🌐 | [RegistrationPage](../pages/RegistrationPage.tsx), [HomePage](../pages/HomePage.tsx) panel | ⚠️ hoy `console.log` |
| `GET /dashboard/resumen` | 🔒 | [DashboardPage](../pages/DashboardPage.tsx) + stats [HomePage](../pages/HomePage.tsx) | ⚠️ hardcodeado |
| `GET /dashboard/por-region` | 🔒 | DashboardPage (mapa calor) | ❌ "próximamente" |
| `GET /dashboard/por-tipo` | 🔒 | DashboardPage (gráfico) | ❌ "próximamente" |
| `GET /dashboard/timeline` | 🔒 | DashboardPage | ❌ por construir |
| `GET /dashboard/salud` | 🔒 | Admin/monitoreo | ❌ por construir |
| `GET /dashboard/proyectos` | 🔒 | DashboardPage (tabla rica) | ❌ por construir |
| `GET /dashboard/proyectos/:id` | 🔒 | DashboardPage detalle | ❌ por construir |
| `GET /dashboard/empresas` | 🔒 | DashboardPage | ❌ por construir |
| `GET /dashboard/empresas/:id` | 🔒 | DashboardPage detalle | ❌ por construir |
| `GET /dashboard/filtros-disponibles` | 🔒 | DashboardPage filtros | ❌ por construir |
| `GET /tipos-proyectos/forms` | 🌐 | Dropdowns (admin/registro) | ❌ por construir |
| `GET /tipos-organizaciones/forms` | 🌐 | Dropdowns | ❌ por construir |
| `GET /formas-juridicas/forms` | 🌐 | Form empresa | ❌ por construir |
| `GET /areas` | 🌐 | Dropdowns | ❌ por construir |
| `GET /areas-desarrollo` | 🌐 | Dropdowns | ❌ por construir |
| `GET /ods` | 🌐 | Form empresa/proyecto | ❌ por construir |
| `GET /motivos/forms` | 🌐 | Form empresa | ❌ por construir |
| `GET /apoyos/forms` | 🌐 | Form empresa | ❌ por construir |
| `GET /ayudas/forms` | 🌐 | Form proyecto | ❌ por construir |
| `GET /especies-animales/forms` | 🌐 | Form conservación | ❌ por construir |
| `GET /practicas-agricolas/forms` | 🌐 | Form conservación | ❌ por construir |
| `GET /actores-municipales/forms` | 🌐 | Form proyecto | ❌ por construir |
| `GET /departamentos` | 🌐 | Filtros / mapa | ❌ por construir |
| `GET /municipios` | 🌐 | Filtros | ❌ por construir |
| `GET /municipios/:id/comunidades` | 🌐 | Filtros encadenados | ❌ por construir |
| `GET /health` | 🌐 | Monitoreo | — |
| `GET /health/ready` | 🌐 | Monitoreo (readiness) | — |

**Total: 56 endpoints** (Auth 10 · Solicitudes 4 · Proyectos 9 · Organizaciones 5 · Empresas 5 · Formularios 2 · Dashboard 10 · Catálogos 12 · Ubicaciones 3 · Health 2 + `auth/login` ya contado).

---

## 4. Contrato detallado por módulo

### 4.1 Auth

#### `POST /api/auth/login` 🌐
- **Body** `LoginDto`: `{ email: string, password: string (min 6) }`
- **201** `TokenResponseDto`: `{ accessToken: string, tipo: "Bearer", expiresIn: "24h" }`
- **Errores:** `400` validación · `401` credenciales inválidas/cuenta desactivada/acceso expirado · `429` rate-limit.
- **Frontend:** [LoginPanel.tsx](../components/features/auth/LoginPanel.tsx) (hoy `onSubmit` solo hace `console.log`). Guardar `accessToken` en `AuthContext`.

#### `GET /api/auth/me` 🔒 · `PUT /api/auth/me` 🔒
- **GET 200** `UsuarioResponseDto`: `{ id, email, nombre, rol (RoleEnum), activo, fechaExpiracion: Date|null, createdAt, updatedAt }`
- **PUT Body** `UpdatePerfilPropioDto` (campos propios editables) → `200 UsuarioResponseDto`.

#### `POST /api/auth/change-password` 🔒
- **Body** `ChangePasswordDto` → `200`. Usar en perfil / flujo "cambiar contraseña".

#### `POST /api/auth/logout` 🔒 → `200`.

#### Gestión de usuarios (rol Admin/Superadmin)
- `POST /api/auth/register` — **Body** `RegisterUsuarioDto`: `{ email, nombre (2–150), password (min 8, ≥1 mayús + ≥1 número + ≥1 símbolo), rol }` → `201 UsuarioResponseDto`. (`403` si el rol no tiene permiso de crear ese rol.)
- `GET /api/auth/usuarios` — query `page, limit, rol, activo, search` → paginado de `UsuarioResponseDto`.
- `GET /api/auth/usuarios/:id` → `UsuarioResponseDto`.
- `PATCH /api/auth/usuarios/:id` — **Body** `UpdateUsuarioDto` → `200`.
- `DELETE /api/auth/usuarios/:id` → `200` (soft-delete).
- **Frontend:** pantallas de **Admin → Usuarios** (CRUD + filtros).

### 4.2 Solicitudes de acceso (investigadores)

#### `POST /api/auth/solicitar-acceso` 🌐
- **Body** `CrearSolicitudDto`:
  ```json
  { "nombreSolicitante": "María García", "emailSolicitante": "maria@uni.bo",
    "institucion": "UMSA", "proposito": "texto 20–1000 chars" }
  ```
- **201** · `409` si ya existe solicitud · `429` rate-limit.
- **Frontend:** modal "¿Eres Investigador?" en [InvestigacionesPage.tsx](../pages/InvestigacionesPage.tsx) y
  [RegistrationPanel.tsx](../components/features/auth/RegistrationPanel.tsx) (hoy `console.log`).
  ⚠️ El `RegistrationPanel` actual sube un archivo; el DTO **no** acepta archivo — ajustar el formulario a estos 4 campos.

#### Moderación (Admin)
- `GET /api/auth/solicitudes` — query `page, limit, estado` → paginado.
- `PATCH /api/auth/solicitudes/:id/aprobar` — **Body** `AprobarSolicitudDto`: `{ fechaExpiracionAcceso: Date (ISO), passwordTemporal: string (min 8, mayús+número+símbolo) }`.
- `PATCH /api/auth/solicitudes/:id/rechazar` — **Body** `RechazarSolicitudDto`: `{ notaRechazo?: string (≤500) }`.
- **Frontend:** **Admin → Bandeja de solicitudes**.

### 4.3 Proyectos

#### `GET /api/proyectos` 🔓
- Query: `page, limit, area, departamento, tipo, anio, municipio, anio_desde, anio_hasta, search, sort`.
- **Sin token (card)** — ejemplo real:
  ```json
  { "data": [ { "id": 1, "nombre": "...", "descripcionCorta": "≤150 chars|null",
      "imagenPrincipalUrl": null, "tipo": {"id":3,"nombre":"Restauración ecológica"},
      "area": {"id":1,"nombre":"Conservacion"}, "departamento": "Santa Cruz" } ],
    "page":1, "limit":10, "pages":19, "total":19, "has_next":true, "has_prev":false }
  ```
- **Con token:** objeto completo con relaciones.
- **Frontend:** [HomePage](../pages/HomePage.tsx) (`slice(0,3)`), [DataPage](../pages/DataPage.tsx) (ProjectCard).

#### `GET /api/proyectos/map` 🌐
- **200** array (sin paginar) de proyectos **con coordenadas**:
  ```json
  [ { "id":22, "nombre":"...", "descripcion":"...", "anioInicio":2018, "anioFin":null,
      "imagenPrincipalUrl":null, "lat":"-13.5000000", "lng":"-66.0000000",
      "department":"Beni", "municipality":"Yacuma",
      "area":{"id":1,"nombre":"Conservacion"}, "tipo":{"id":6,"nombre":"Conservación de especies"} } ]
  ```
- ⚠️ `lat`/`lng` son **string**; claves `department`/`municipality` en **inglés**.
- **Frontend:** [GeoreferencingPage.tsx](../pages/GeoreferencingPage.tsx) — reemplaza el mock directamente (markers + popup).

#### `GET /api/proyectos/filtros-disponibles` 🌐
- **200**: `{ areas:[{id,nombre}], tipos:[{id,nombre}], departamentos:[{id,nombre}], municipios:[{id,nombre,idDepartamento}] }`.
- Cache 300 s. Para poblar selects de filtros.

#### `GET /api/proyectos/:id` 🔒
- **200** `{ proyecto: { ...todas las relaciones, galería, imagen principal } }` · `401` sin token.
- **Frontend:** [DetailsPanel → ProjectDetails](../components/features/details/DetailsPanel.tsx). **Requiere login** (decidir flujo, ver §7).

#### Imágenes (Admin) 🔒
- `POST /api/proyectos/:id/imagen-principal` — multipart `file` → `{ imagenPrincipalUrl }`.
- `DELETE /api/proyectos/:id/imagen-principal` → `204`.
- `POST /api/proyectos/:id/galeria` — multipart `file` + `descripcion?` → imagen `{ id, url, orden }`.
- `DELETE /api/proyectos/:id/galeria/:imagenId` → `204`.
- `PUT /api/proyectos/:id/galeria/orden` — **Body** `[{ id: string, orden: number }]` → `200`.

### 4.4 Organizaciones

#### `GET /api/organizaciones` 🔓
- Query: `page, limit, departamento, esNacional, tipo, search`.
- Ejemplo (card):
  ```json
  { "data":[ {"id":1,"nombre":"...","tipo":{"id":5,"nombre":"Empresa privada"},
      "logoUrl":null,"departamento":"Santa Cruz","esNacional":true} ], "total":11, ... }
  ```
#### `GET /api/organizaciones/filtros-disponibles` 🌐 → `{ tipos:[{id,nombre}], departamentos:[{id,nombre}] }`.
#### `GET /api/organizaciones/:id` 🔒 → detalle completo.
#### `POST /api/organizaciones/:id/logo` 🔒 (multipart) · `DELETE /api/organizaciones/:id/logo` 🔒 → `204`.

### 4.5 Empresas

#### `GET /api/empresas` 🔓
- Query: `page, limit, departamento, forma_juridica, search, sort`.
- Ejemplo (card):
  ```json
  { "data":[ {"id":1,"nombre":"...","formaJuridica":{"id":4,"nombre":"..."},
      "logoUrl":null,"departamento":"Pando"} ], "total":9, ... }
  ```
#### `GET /api/empresas/filtros-disponibles` 🌐 → `{ formas_juridicas:[{id,nombre}], departamentos:[{id,nombre}] }`.
#### `GET /api/empresas/:id` 🔒 → detalle completo.
#### `POST /api/empresas/:id/logo` 🔒 (multipart) · `DELETE /api/empresas/:id/logo` 🔒 → `204`.

> **Nota de modelado:** "Fundaciones" del frontend = **dos** colecciones backend (`organizaciones` + `empresas`).
> En [DataPage](../pages/DataPage.tsx) habrá que decidir si se muestran juntas (merge) o en secciones separadas.

### 4.6 Formularios públicos de registro

#### `POST /api/formularios/empresas` 🌐
- **Body** `RegisterFormularioEmpresaDto` (anidado), campos principales:
  ```jsonc
  {
    "nombre": "string (5–100)",
    "formaJuridica": { "id": 1 /* o */, "otro": "string" },
    "departamentos": [1, 2],            // ids, no vacío
    "anioInicioApoyo": 2020,            // int ≥ 1
    "apoyos": { /* RegisterApoyosDto */ },
    "motivos": { /* ... */ }, "ods": [ /* ids */ ]   // según sub-DTOs
  }
  ```
- **201** `CommonResponseDto` · `400` validación · `404` (catálogo inexistente).

#### `POST /api/formularios/organizaciones` 🌐
- **Body** `RegisterFormularioOrganizacionDto`:
  ```jsonc
  {
    "tipo": { "id": 3 /* o */, "otro": "string (3–100)" },
    "nombre": "string (3–100)",
    "idDepartamento": 1,                // sede central
    "esNacional": true
    /* + campos adicionales del DTO */
  }
  ```
- **201** `CommonResponseDto` · `400` · `404`.
- **Frontend:** [RegistrationPage.tsx](../pages/RegistrationPage.tsx) y panel en [HomePage.tsx](../pages/HomePage.tsx).
  ⚠️ El formulario actual (`organizationName, personalName, email, description, reason, type`) **no** coincide con
  este DTO: hay que rehacer el formulario con tipo/forma-jurídica, departamentos (multiselect desde catálogos),
  año, apoyos, motivos, ODS. **Este es el cambio de formulario más grande.**

### 4.7 Dashboard (🔒 todos)

> Requieren token. Hoy [DashboardPage](../pages/DashboardPage.tsx) muestra conteos con `.length` del mock y
> placeholders "Gráfico/Mapa próximamente". Sin token responden `401 { "message": "Token inválido o no proporcionado" }`.

| Endpoint | Query | Uso frontend |
|---|---|---|
| `GET /dashboard/resumen` | — | Tarjetas de totales (reemplaza `.length`) |
| `GET /dashboard/por-region` | — | Mapa de calor / barras por departamento |
| `GET /dashboard/por-tipo` | `departamento, area` | Gráfico "Proyectos por categoría" |
| `GET /dashboard/timeline` | — | Serie temporal por año |
| `GET /dashboard/salud` | — | Panel de salud/KPIs |
| `GET /dashboard/proyectos` | `page,limit,area,departamento,municipio,comunidad,tipo,ayuda,actor,activo,anio_desde,anio_hasta,search,sort` | Tabla analítica de proyectos |
| `GET /dashboard/proyectos/:id` | — | Detalle analítico de proyecto |
| `GET /dashboard/empresas` | `page,limit,departamento,forma_juridica,motivo,apoyo,ods,search,sort` | Tabla analítica de empresas |
| `GET /dashboard/empresas/:id` | — | Detalle analítico de empresa |
| `GET /dashboard/filtros-disponibles` | — | Poblar selects del dashboard |

> Las shapes de respuesta del dashboard son objetos analíticos (no tipados como DTO en Swagger). **Acción:** capturar
> el JSON real con un token válido (`curl -H "Authorization: Bearer <tk>" .../dashboard/resumen`) antes de tipar.

### 4.8 Catálogos (`/forms` y similares) — 🌐 todos

Patrón de respuesta: `{ <clavePlural>: [ { id: number, nombre: string } ] }`. Para poblar dropdowns.

| Endpoint | Clave de respuesta |
|---|---|
| `GET /tipos-proyectos/forms` | `tiposProyectos` |
| `GET /tipos-organizaciones/forms` | `tiposOrganizaciones` |
| `GET /formas-juridicas/forms` | `formasJuridicas` |
| `GET /motivos/forms` | `motivos` |
| `GET /apoyos/forms` | `apoyos` |
| `GET /ayudas/forms` | `ayudas` |
| `GET /especies-animales/forms` | `especiesAnimales` |
| `GET /practicas-agricolas/forms` | `practicasAgricolas` |
| `GET /actores-municipales/forms` | `actoresMunicipales` |
| `GET /areas` | `areas` |
| `GET /areas-desarrollo` | `areasDesarrollo` |
| `GET /ods` | `ods` |

Ejemplo `GET /tipos-proyectos/forms`: `{ "tiposProyectos": [ {"id":1,"nombre":"Áreas protegidas"}, ... ] }`.
Ejemplo `GET /ods`: `{ "ods": [ {"id":1,"nombre":"Fin de la pobreza"}, ... ] }`.

### 4.9 Ubicaciones geográficas — 🌐

- `GET /departamentos` — query `page, limit, amazonico` → paginado de `{ id, nombre, amazonico: boolean }`.
- `GET /municipios` — query `page, limit, departamento, search` → paginado.
- `GET /municipios/:id/comunidades` → comunidades del municipio (filtros encadenados departamento→municipio→comunidad).

### 4.10 Health — 🌐
- `GET /health` → `200`. `GET /health/ready` → `200`/`503` (readiness).

---

## 5. Mapeo de campos es→en

El frontend asume modelos en inglés ([types/api.ts](../types/api.ts)). Tabla de traducción a aplicar.

### Proyecto (card) → `Project` actual
| API real | Tipo | Frontend actual | Acción |
|---|---|---|---|
| `id` | number | `id: string` | usar `number` |
| `nombre` | string | `name` | renombrar |
| `descripcionCorta` | string\|null | `description` | renombrar (detalle usa `descripcion`) |
| `imagenPrincipalUrl` | string\|null | `imageUrl` | renombrar + fallback placeholder |
| `tipo {id,nombre}` · `area {id,nombre}` | obj | `tags: string[]` | derivar tags de `[tipo.nombre, area.nombre]` |
| `departamento` | string | — | nuevo campo |
| (`/map`) `lat,lng` | **string** | `location:{lat,lng}` number | `Number(lat)`, `Number(lng)` |
| (`/map`) `department,municipality` | string | — | nuevos |
| — | | `foundationId` | **ya no aplica** (relación distinta) |

### Organización / Empresa → `Foundation` actual
| API real | Frontend actual | Acción |
|---|---|---|
| `nombre` | `name` | renombrar |
| `logoUrl` (null) | `logoUrl` | igual + placeholder |
| `tipo.nombre` (org) / `formaJuridica.nombre` (emp) | — | mostrar como subtítulo |
| `departamento`, `esNacional` | — | nuevos |
| — | `description` | **no viene en card** → usar detalle `:id` (requiere login) |

### Usuario → (nuevo)
`{ id, email, nombre, rol: 1|2|3, activo, fechaExpiracion, createdAt, updatedAt }`.

---

## 6. Interfaces TypeScript propuestas

Reemplazan [types/api.ts](../types/api.ts) (eliminar `Project/Foundation/Investigation` en inglés).

```ts
// types/api.ts (propuesto)
export interface Paginated<T> {
  data: T[]; page: number; limit: number; pages: number; total: number;
  has_next: boolean; has_prev: boolean;
}
export interface Ref { id: number; nombre: string }

// Proyectos
export interface ProyectoCard {
  id: number; nombre: string; descripcionCorta: string | null;
  imagenPrincipalUrl: string | null; tipo: Ref | null; area: Ref | null; departamento: string | null;
}
export interface ProyectoMap {
  id: number; nombre: string; descripcion: string; anioInicio: number | null; anioFin: number | null;
  imagenPrincipalUrl: string | null; lat: string; lng: string;        // strings de la API
  department: string | null; municipality: string | null; area: Ref | null; tipo: Ref | null;
}
export interface ProyectoFiltros {
  areas: Ref[]; tipos: Ref[]; departamentos: Ref[];
  municipios: Array<Ref & { idDepartamento: number }>;
}

// Organizaciones / Empresas
export interface OrganizacionCard {
  id: number; nombre: string; tipo: Ref | null; logoUrl: string | null;
  departamento: string | null; esNacional: boolean;
}
export interface EmpresaCard {
  id: number; nombre: string; formaJuridica: Ref | null; logoUrl: string | null; departamento: string | null;
}

// Auth
export enum RoleEnum { Superadmin = 1, Admin = 2, Investigador = 3 }
export interface AuthToken { accessToken: string; tipo: string; expiresIn: string }
export interface Usuario {
  id: number; email: string; nombre: string; rol: RoleEnum; activo: boolean;
  fechaExpiracion: string | null; createdAt: string; updatedAt: string;
}

// Solicitudes
export interface CrearSolicitud {
  nombreSolicitante: string; emailSolicitante: string; institucion: string; proposito: string;
}
```

---

## 7. Gaps y decisiones pendientes

1. **Investigaciones (gap).** No existe módulo backend de publicaciones/investigaciones. La página
   [InvestigacionesPage.tsx](../pages/InvestigacionesPage.tsx) y `useGetInvestigations` no tienen fuente real.
   *Decidir luego:* (a) construir módulo `/publicaciones` en backend, (b) ocultar la página del router/menú,
   (c) repurposear como vista de proyectos tipo investigación. **Por ahora: documentado, sin resolver.**
2. **Stats públicas de Home.** Las cifras de impacto (8.5M ha, 1.200 especies, 45 proyectos) están hardcodeadas en
   [HomePage.tsx](../pages/HomePage.tsx). `/dashboard/resumen` las tiene pero **exige token**. *Decidir:* exponer un
   resumen público en backend, o dejar Home con cifras estáticas y mostrar datos reales solo en el dashboard logueado.
3. **Detalle requiere login.** `/proyectos/:id`, `/organizaciones/:id`, `/empresas/:id` exigen token, pero el
   [DetailsPanel](../components/features/details/DetailsPanel.tsx) abre desde páginas públicas. *Decidir:* (a) mostrar
   solo datos de card sin abrir detalle, (b) pedir login al abrir detalle, (c) hacer público el detalle en backend.
4. **Equipo (Nosotros).** Sin endpoint → permanece estático en [NosotrosPage.tsx](../pages/NosotrosPage.tsx) (ok).
5. **Formulario de registro.** El form actual no coincide con `RegisterFormulario*Dto` (ver §4.6) → rehacer.
6. **Dashboard shapes.** Capturar JSON real con token antes de tipar (§4.7).

---

## 8. Plan de trabajo modular

Orden por desbloqueo. Cada ítem es una unidad de trabajo independiente.

- [ ] **0. Limpieza previa.** Borrar código muerto: [services/api.ts](../services/api.ts) y [types.ts](../types.ts)
      (vacíos), [hooks/useProjects.ts](../hooks/useProjects.ts) duplicado, [components/common/](../components/common/)
      (duplica `components/layout/`). Quitar `GEMINI_API_KEY` de [vite.config.ts](../vite.config.ts).
- [ ] **1. Infraestructura.** `services/apiClient.ts` (base URL desde `VITE_API_URL`, interceptor `Bearer`, manejo de
      error y del sobre de paginación). `.env` + `.env.example`. `AuthContext` (token en memoria + `localStorage`).
      Tipos del §6.
- [ ] **2. Georeferencia** ← `GET /proyectos/map` (público, fricción cero). Remapear markers/popup en
      [GeoreferencingPage.tsx](../pages/GeoreferencingPage.tsx); `Number(lat/lng)`.
- [ ] **3. Lista de proyectos** ← `GET /proyectos` + `GET /proyectos/filtros-disponibles`. Reescribir
      `useGetProjects` y adaptar [HomePage](../pages/HomePage.tsx)/[DataPage](../pages/DataPage.tsx) (campos es→en,
      paginación, filtros reales).
- [ ] **4. Fundaciones** ← `GET /organizaciones` + `GET /empresas` (+ filtros). Definir merge vs secciones en
      [DataPage](../pages/DataPage.tsx). Adaptar `FoundationCard`.
- [ ] **5. Login + perfil** ← `POST /auth/login`, `GET /auth/me`, `POST /auth/logout`. Conectar
      [LoginPanel](../components/features/auth/LoginPanel.tsx); rutas protegidas; header con sesión.
- [ ] **6. Detalle** ← `GET /proyectos/:id`, `/organizaciones/:id`, `/empresas/:id` (según decisión §7.3).
- [ ] **7. Formularios** ← `POST /formularios/organizaciones`, `/formularios/empresas`,
      `POST /auth/solicitar-acceso`. Rehacer formularios contra los DTOs reales + catálogos `/forms`.
- [ ] **8. Dashboard** ← `GET /dashboard/*` (con token). Tipar tras capturar JSON real; integrar gráficos.
- [ ] **9. Panel Admin** ← usuarios (`/auth/usuarios*`), bandeja de solicitudes (`/auth/solicitudes*`),
      CRUD/uploads de proyectos (imagen principal + galería), logos de org/empresa. Layout admin + rutas por rol.
- [ ] **G. Gaps** ← resolver Investigaciones y stats públicas (§7) según decisión de producto.

---

## 9. Apéndice

### Regenerar el contrato desde Swagger
```bash
curl -s http://localhost:3333/api/documentation-json -o openapi.json
# Abrir Swagger UI: http://localhost:3333/api/documentation
```

### Capturar shapes que requieren token (dashboard, detalles)
```bash
TOKEN=$(curl -s -X POST http://localhost:3333/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@kaaiya.bo","password":"MiPassword1!"}' | python -c "import sys,json;print(json.load(sys.stdin)['accessToken'])")
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:3333/api/dashboard/resumen | python -m json.tool
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:3333/api/proyectos/1 | python -m json.tool
```

### Convenciones del backend (para alinear nuevos módulos)
- Entidades extienden `BaseEntitySoftDelete` (`created_at`, `updated_at`, `is_deleted`).
- DTOs de paginación: `PaginationParamsDto` / `PaginationResponseDto`.
- Validación con `class-validator`; mensajes en español.
