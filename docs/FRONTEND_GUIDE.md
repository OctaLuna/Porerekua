# Guía de Integración — Kaa Iya API para Frontend

Guía práctica para que el equipo de frontend consuma la API sin necesidad de leer el código del backend. Incluye flujos completos, ejemplos copy-paste y todas las particularidades del sistema.

---

## 1. URLs y acceso rápido

| Recurso | URL |
|---|---|
| **API base** | `https://api-rest-amazonia-mej8.onrender.com/api` |
| **Swagger UI** (explorador interactivo) | `https://api-rest-amazonia-mej8.onrender.com/api/documentation` |
| **OpenAPI JSON** (para generar tipos) | `https://api-rest-amazonia-mej8.onrender.com/api/documentation-json` |
| Health / liveness | `GET /api/health` |
| Health / readiness | `GET /api/health/ready` |

### Cómo usar el Swagger

1. Abrir la URL de Swagger en el navegador.
2. Hacer `POST /api/auth/login` con tus credenciales (botón "Try it out").
3. Copiar el `accessToken` de la respuesta.
4. Hacer clic en el botón **Authorize** (candado, arriba a la derecha).
5. Pegar el token en el campo `access-token (http, Bearer)` → **Authorize**.
6. Ahora todos los endpoints con candado se prueban autenticados.

### Generar tipos TypeScript automáticamente

```bash
npx openapi-typescript https://api-rest-amazonia-mej8.onrender.com/api/documentation-json \
  -o src/api/types.ts
```

---

## 2. Autenticación

Todos los endpoints protegidos requieren el header:
```
Authorization: Bearer <accessToken>
```

### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "usuario@dominio.com",
  "password": "MiPassword1!"
}
```

**Respuesta 201:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "tipo": "Bearer",
  "expiresIn": "24h"
}
```

> El token tiene validez de 24 horas. Al expirar, el cliente recibirá `401` y debe redirigir al login.
> **Rate limit:** máximo 5 intentos de login por IP en 60 segundos → `429 Too Many Requests`.

### Logout

```http
POST /api/auth/logout    [requiere token]
```

El backend no tiene blacklist; el logout es semántico. Eliminar el token en el cliente.

---

## 3. Usuarios y roles

### Los 3 roles

| Valor `rol` | Nombre | Permisos |
|---|---|---|
| `1` | Superadmin | Todo, incluyendo eliminar cualquier usuario |
| `2` | Admin | Crear usuarios, gestionar usuarios, aprobar investigadores |
| `3` | Investigador | Lectura autenticada (sin crear ni modificar) |

El rol viene codificado en el payload del JWT (campo `rol`). Puedes decodificarlo en el cliente con `jwt-decode` para controlar visibilidad de elementos del UI sin hacer una petición extra.

### Ver mi perfil

```http
GET /api/auth/me    [cualquier rol]
```
```json
{
  "usuario": {
    "id": 1,
    "email": "admin@kaaiya.bo",
    "nombre": "Marco Luna",
    "rol": 2,
    "activo": true,
    "fechaExpiracion": null,
    "createdAt": "2026-06-01T00:00:00Z",
    "updatedAt": "2026-06-01T00:00:00Z"
  }
}
```

`fechaExpiracion` es `null` para Admin y Superadmin. Para Investigadores es la fecha límite de su acceso.

### Actualizar mi nombre

```http
PUT /api/auth/me    [cualquier rol]
Content-Type: application/json

{ "nombre": "Nuevo Nombre" }
```

### Cambiar contraseña

```http
POST /api/auth/change-password    [cualquier rol]
Content-Type: application/json

{
  "currentPassword": "MiPasswordActual1!",
  "newPassword": "MiNuevoPass2@"
}
```

La nueva contraseña debe tener: mínimo 8 caracteres, una mayúscula, un número y un símbolo.

---

## 4. Gestión de usuarios (Admin y Superadmin)

### Crear usuario Admin

```http
POST /api/auth/register    [Admin o Superadmin]
Content-Type: application/json

{
  "email": "nuevo.admin@kaaiya.bo",
  "nombre": "Ana García",
  "password": "AdminPass1!",
  "rol": 2
}
```

> Un Admin solo puede crear otros Admin (`rol: 2`). Solo un Superadmin puede crear Superadmin (`rol: 1`).
> Los Investigadores NO se crean así — usan el flujo de solicitud de acceso (ver abajo).

### Listar usuarios

```http
GET /api/auth/usuarios?rol=3&activo=true&search=nombre&page=1&limit=10    [Admin+]
```

Filtros opcionales: `rol` (1/2/3), `activo` (true/false), `search` (texto en nombre o email), `page`, `limit`.

### Actualizar usuario

```http
PATCH /api/auth/usuarios/{id}    [Admin+]
Content-Type: application/json

{
  "nombre": "Nombre Actualizado",
  "activo": false
}
```

Desactivar (`activo: false`) impide el login inmediatamente e invalida sus tokens.

### Eliminar usuario

```http
DELETE /api/auth/usuarios/{id}    [solo Superadmin]
```

Acción irreversible. Para desactivar temporalmente usar `PATCH` con `activo: false`.

---

## 5. Flujo de investigadores (solicitud y aprobación)

Los investigadores no pueden ser creados directamente por un Admin — pasan por un flujo de aprobación.

### Paso 1 — El solicitante envía su solicitud (público, sin token)

```http
POST /api/auth/solicitar-acceso
Content-Type: application/json

{
  "nombreSolicitante": "María López",
  "emailSolicitante": "maria.lopez@universidad.bo",
  "institucion": "Universidad Mayor de San Andrés",
  "proposito": "Investigación sobre biodiversidad amazónica para tesis doctoral en Biología. Análisis de datos de proyectos de conservación entre 2020-2025."
}
```

El campo `proposito` debe tener entre 20 y 1000 caracteres.

### Paso 2 — El Admin revisa las solicitudes pendientes

```http
GET /api/auth/solicitudes    [Admin+]
```

Devuelve solicitudes en estado `pendiente`, `aprobada`, `rechazada`.

### Paso 3a — Aprobar y crear el investigador

```http
PATCH /api/auth/solicitudes/{id}/aprobar    [Admin+]
Content-Type: application/json

{
  "fechaExpiracionAcceso": "2027-06-01T00:00:00Z"
}
```

El backend crea automáticamente un usuario `Investigador` con el email de la solicitud. La contraseña inicial es generada; el usuario debe cambiarla en su primer login.

### Paso 3b — Rechazar

```http
PATCH /api/auth/solicitudes/{id}/rechazar    [Admin+]
Content-Type: application/json

{
  "notaRechazo": "La institución no está en nuestro directorio de organizaciones aliadas."
}
```

---

## 6. Catálogos — datos maestros para formularios

Todos los catálogos son **públicos** (sin token). Cargarlos **una sola vez** al montar el formulario y guardar en estado local o context.

| Endpoint | Clave de la respuesta | Descripción |
|---|---|---|
| `GET /api/areas` | `areas` | Áreas de proyecto: `1`=Conservación, `2`=Desarrollo comunitario |
| `GET /api/ods` | `ods` | 17 Objetivos de Desarrollo Sostenible de la ONU |
| `GET /api/apoyos/forms` | `apoyos` | Tipos de apoyo que brinda la empresa |
| `GET /api/ayudas/forms` | `ayudas` | Tipos de ayuda que recibe el proyecto |
| `GET /api/motivos/forms` | `motivos` | Motivaciones de la empresa para apoyar |
| `GET /api/formas-juridicas/forms` | `formasJuridicas` | S.R.L., S.A., Fundación… |
| `GET /api/tipos-proyectos/forms` | `tiposProyectos` | Ecoturismo, Reforestación, Conservación de bosques… |
| `GET /api/tipos-organizaciones/forms` | `tiposOrganizaciones` | ONG, Fundación, Asociación… |
| `GET /api/especies-animales/forms` | `especiesAnimales` | Para proyectos de conservación |
| `GET /api/practicas-agricolas/forms` | `practicasAgricolas` | Para proyectos de conservación |
| `GET /api/actores-municipales/forms` | `actoresMunicipales` | Instituciones locales involucradas |
| `GET /api/areas-desarrollo` | *(array directo)* | Para proyectos de desarrollo comunitario |

Cada ítem del catálogo tiene la forma: `{ "id": 1, "nombre": "Nombre del ítem" }`.

> Los catálogos devuelven **solo las opciones predefinidas del sistema** (`esPropio: false`). Las opciones custom que los usuarios crean al registrar actores no aparecen aquí.

---

## 7. Ubicaciones — carga en cascada

Todos los endpoints de ubicación son **públicos**.

### Para el formulario de empresa u organización

Muestra todos los departamentos de Bolivia:

```http
GET /api/departamentos
```

### Para el formulario de proyecto

Muestra solo los 5 departamentos amazónicos:

```http
GET /api/departamentos?amazonico=true
```

Respuesta:
```json
{
  "data": [
    { "id": 1, "nombre": "Pando", "amazonico": true },
    { "id": 2, "nombre": "Beni", "amazonico": true },
    { "id": 3, "nombre": "La Paz", "amazonico": true },
    { "id": 4, "nombre": "Cochabamba", "amazonico": true },
    { "id": 5, "nombre": "Santa Cruz", "amazonico": true }
  ],
  "total": 5, "page": 1, "limit": 10, ...
}
```

### Al seleccionar un departamento → cargar sus municipios

```http
GET /api/municipios?departamento={id}
```

### Al seleccionar un municipio → cargar sus comunidades indígenas

```http
GET /api/municipios/{id}/comunidades
```

Respuesta: array de `{ "id": 1, "nombre": "Nombre comunidad" }`.

> **Importante:** si la respuesta es `[]`, el municipio no tiene comunidades registradas. El campo de comunidad indígena debe ser **opcional** y ocultarse o deshabilitarse cuando no hay opciones.

**Flujo completo del formulario:**

```
1. Cargar: GET /departamentos?amazonico=true
2. Usuario elige departamento X →
3. Cargar: GET /municipios?departamento=X
4. Usuario elige municipio Y →
5. Cargar: GET /municipios/Y/comunidades
6. Si comunidades: mostrar selector (opcional)
   Si vacío: ocultar/deshabilitar selector de comunidad
7. Usuario puede agregar más municipios (repetir 3-6)
```

---

## 8. Formularios de registro — crear empresas u organizaciones

Son el punto de entrada principal para registrar actores con sus proyectos. Son **públicos** (no requieren token) y **transaccionales** (todo o nada: si algo falla, no se guarda nada).

### Registrar empresa con proyectos

```http
POST /api/formularios/empresas
Content-Type: application/json
```

**Estructura del body:**

```json
{
  "nombre": "Industria Amazónica S.R.L.",
  "formaJuridica": { "id": 1 },
  "anioInicioApoyo": 2019,
  "departamentos": [5, 4],
  "apoyos": {
    "seleccionados": [1, 2],
    "otros": ["Asesoría técnica especializada"]
  },
  "motivosApoyo": {
    "seleccionados": [1],
    "otros": []
  },
  "ods": [13, 15, 17],
  "organizaciones": ["PROBIOMA", "WCS Bolivia"],
  "proyectos": [
    {
      "nombre": "Reforestación del Corredor Verde",
      "descripcion": "Restauración de 500 hectáreas de bosque amazónico degradado mediante técnicas de regeneración natural asistida.",
      "fechaInicio": "15-03-2022",
      "fechaFin": "14-03-2027",
      "anioInicio": 2022,
      "anioFin": 2027,
      "area": 1,
      "tipo": { "id": 2 },
      "departamento": 5,
      "municipiosTrabajo": [
        { "idMunicipio": 82 },
        { "idMunicipio": 70, "idComunidadIndigena": 3 }
      ],
      "ayudas": { "seleccionados": [1, 3], "otros": [] },
      "actores": {
        "seleccionados": [1],
        "otros": ["Subgobernación de Warnes"]
      },
      "conservacion": {
        "especies": { "seleccionados": [1, 2], "otros": ["Mariposa Morpho"] },
        "practicasAgricolas": { "seleccionados": [1], "otros": [] }
      },
      "lat": -17.4834,
      "lng": -63.5900
    }
  ]
}
```

**Respuesta 201:**
```json
{ "message": "Se lleno el formulario exitosamente" }
```

### Registrar organización con proyectos

```http
POST /api/formularios/organizaciones
Content-Type: application/json

{
  "nombre": "Fundación Amazonia Viva",
  "tipoOrganizacion": { "id": 1 },
  "idDepartamento": 2,
  "esNacional": true,
  "anioInicioTrabajo": 2015,
  "proyectos": [...]
}
```

---

## 9. Patrones del formulario de proyectos — guía detallada

### 9.1 Área del proyecto (`area`)

Define el tipo de datos adicionales que el proyecto requiere:

| `area` | Nombre | Campo adicional requerido |
|---|---|---|
| `1` | Conservación | `conservacion: { especies: {...}, practicasAgricolas: {...} }` |
| `2` | Desarrollo comunitario | `desarrollo: { seleccionados: [...], otros: [...] }` |

> **No mezclar:** si `area=1`, no enviar `desarrollo`. Si `area=2`, no enviar `conservacion`. Son mutuamente excluyentes.

### 9.2 Patrón `seleccionados + otros` — catálogos múltiples

Usado en: apoyos, motivosApoyo, ayudas, actores, especies, practicasAgricolas, áreas de desarrollo.

```json
{
  "seleccionados": [1, 2, 5],
  "otros": ["Opción personalizada", "Otra nueva"]
}
```

- `seleccionados`: IDs del catálogo (obtenidos de los endpoints `/forms`)
- `otros`: textos libres → se crean automáticamente en el sistema como opciones custom

Ambos arrays pueden estar vacíos, pero al menos uno debe tener contenido (la lógica de negocio lo valida por campo).

### 9.3 Patrón `findOneOrCreate` — catálogos singulares

Usado en: `tipo` del proyecto, `formaJuridica`, `tipoOrganizacion`.

**Opción A — usar uno existente del catálogo:**
```json
"tipo": { "id": 3 }
```

**Opción B — crear uno nuevo:**
```json
"tipo": { "otro": "Turismo comunitario sostenible" }
```

No enviar ambos campos juntos.

### 9.4 Formato de fechas

Siempre `dd-MM-yyyy` (dos dígitos para día y mes):
```json
"fechaInicio": "05-01-2024",
"fechaFin": "31-12-2026"
```

### 9.5 Municipios de trabajo

Un proyecto puede cubrir múltiples municipios. Para cada municipio, la comunidad indígena es opcional:

```json
"municipiosTrabajo": [
  { "idMunicipio": 82 },
  { "idMunicipio": 70, "idComunidadIndigena": 3 },
  { "idMunicipio": 85 }
]
```

El backend **valida** que la comunidad pertenece al municipio declarado. Si no corresponde → `400 Bad Request`.

---

## 10. Georreferenciación en proyectos

### Las dos capas de ubicación

| Capa | Campo | Obligatorio | Propósito |
|---|---|---|---|
| Administrativa | `departamento` + `municipiosTrabajo` | Sí | Filtros, estadísticas, asociación jerárquica |
| GPS | `lat` + `lng` | No | Pin en el mapa MapLibre, GeoRef automático |

**Ambas capas son independientes.** Un proyecto puede tener:
- Solo ubicación administrativa (sin pin en el mapa)
- Ambas capas (aparece en el mapa y en los filtros)

### Cómo funciona la georreferenciación automática

Cuando el frontend envía `lat` y `lng` en el formulario:

1. El backend llama automáticamente al microservicio GeoRef.
2. El GeoRef resuelve las coords a un **departamento** y **provincia boliviana** (GADM nivel 2).
3. Los campos `department` y `municipality` se guardan en el proyecto.
4. El proyecto aparece en `GET /api/proyectos/map`.

**El frontend NO llama al georef directamente.** El microservicio es interno al backend.

Si el georef no está disponible → el proyecto se guarda igual con `georefFailed: true` y `department: null`. No da error.

### Rango válido de coordenadas

```
lat: -23.0 a -9.0   (sur de Bolivia)
lng: -70.0 a -57.0  (Bolivia)
```

Enviar coordenadas fuera de este rango → `422 Unprocessable Entity`.

### Recomendación de UI

Mostrar al usuario:
1. Un campo de texto o input numérico para lat/lng, o
2. Un selector de punto en el mapa (MapLibre) que auto-rellene lat/lng al hacer clic.
3. Aclarar al usuario que es **opcional** y que el sistema lo georreferenciará automáticamente.
4. Validar en el frontend que las coords estén en el bounding box antes de enviar.

---

## 11. Listados de actores — proyectos, empresas, organizaciones

### Respuesta dual según autenticación

Estos endpoints usan `OptionalJwtAuthGuard`: **sin token** devuelven tarjetas públicas; **con token** devuelven el objeto completo con relaciones.

**Sin token — tarjeta pública:**
```json
{
  "data": [
    {
      "id": 18,
      "nombre": "Certificación de sostenibilidad en soya RTRS",
      "descripcionCorta": "Proyecto de...",
      "imagenPrincipalUrl": "https://...webp",
      "tipo": { "id": 5, "nombre": "Desarrollo productivo sostenible" },
      "area": { "id": 2, "nombre": "Desarrollo de comunidades indigenas" },
      "departamento": { "id": 5, "nombre": "Santa Cruz" }
    }
  ],
  "total": 19, "page": 1, "limit": 10, ...
}
```

**Con token — objeto completo** (incluye: localidades, ayudas, actores, conservacion/desarrollo, imágenes, empresa/organización relacionada).

### Filtros disponibles — construir selectores dinámicos

Llamar **sin autenticación**, cachear 300 segundos en el cliente:

```http
GET /api/proyectos/filtros-disponibles
GET /api/empresas/filtros-disponibles
GET /api/organizaciones/filtros-disponibles
```

Usan estos valores para construir los `<select>` de filtro en el UI (no hardcodear IDs).

### Proyectos — filtros de listado

```http
GET /api/proyectos?page=1&limit=10&sort=nombre_ASC
  &area=1
  &departamento=5
  &tipo=2
  &municipio=82
  &anio=2022
  &anio_desde=2020
  &anio_hasta=2024
  &search=reforestación
```

### Proyectos — mapa (sin token)

```http
GET /api/proyectos/map
```

Devuelve solo proyectos con coordenadas. Usar para renderizar marcadores en MapLibre GL:

```json
[
  {
    "id": 18,
    "nombre": "Certificación soya RTRS",
    "lat": "-17.7500000",
    "lng": "-63.2500000",
    "department": "Santa Cruz",
    "municipality": "Andrés Ibáñez",
    "anioInicio": 2019,
    "anioFin": null,
    "imagenPrincipalUrl": null,
    "area": { "id": 2, "nombre": "Desarrollo de comunidades indigenas" },
    "tipo": { "id": 5, "nombre": "Desarrollo productivo sostenible" }
  }
]
```

### Empresas y organizaciones

```http
GET /api/empresas?page=1&limit=10&departamento=5&forma_juridica=2&search=texto&sort=nombre_ASC
GET /api/organizaciones?page=1&limit=10&departamento=3&esNacional=true&tipo=1&search=texto
```

---

## 12. Dashboard — panel analítico

Todos los endpoints del dashboard requieren **JWT (cualquier rol)**. Tienen caché en el servidor (30–300 s); los datos se refrescan automáticamente cuando hay nuevos registros.

### Flujo recomendado al cargar el panel

```
1. GET /api/dashboard/filtros-disponibles  →  poblar todos los <select> de filtros
2. GET /api/dashboard/resumen              →  18 KPIs globales para cards/header
3. GET /api/dashboard/por-region           →  gráfico de barras por departamento
4. GET /api/dashboard/por-tipo             →  gráfico por área y tipo de proyecto
5. GET /api/dashboard/timeline             →  gráfico de evolución anual
6. GET /api/dashboard/proyectos            →  tabla principal con 11 filtros
7. GET /api/dashboard/empresas             →  tabla de empresas con 7 filtros
```

### Resumen — KPIs globales

```http
GET /api/dashboard/resumen    [JWT]
```

Devuelve **18 métricas** en una sola respuesta: totales de empresas, organizaciones, proyectos, desglose por área, alcance geográfico, rango temporal, ODS cubiertos, etc.

### Proyectos del dashboard — 11 filtros

```http
GET /api/dashboard/proyectos?page=1&limit=10
  &area=1
  &departamento=5
  &municipio=82
  &comunidad=3
  &tipo=2
  &ayuda=1
  &actor=1
  &activo=true
  &anio_desde=2020
  &anio_hasta=2024
  &search=reforestación
  &sort=nombre_ASC
```

Diferencia con `GET /proyectos`: el dashboard consulta **vistas materializadas** (más rápido para agregados), devuelve más campos analíticos y tiene caché propio. Usar el dashboard para el panel de administración; usar `GET /proyectos` para la vista pública del sitio.

### Empresas del dashboard — 7 filtros

```http
GET /api/dashboard/empresas?page=1&limit=10
  &departamento=5
  &forma_juridica=2
  &motivo=1
  &apoyo=2
  &ods=13
  &search=industria
  &sort=nombre_ASC
```

### Por región y por tipo

```http
GET /api/dashboard/por-region    → métricas por los 9 departamentos bolivianos
GET /api/dashboard/por-tipo      → métricas por combinación (área, tipo de proyecto)
GET /api/dashboard/timeline      → conteo de nuevos registros por año
GET /api/dashboard/salud         → health del módulo + totales básicos
```

### Dashboard Público — sin autenticación

Para la **landing page** o secciones públicas del sitio. No requieren token, sin rate-limit específico (aplica el global de 60 req/min por IP).

```http
GET /api/dashboard/publico/resumen
```

Devuelve 5 métricas globales seguras (sin desagregación por individuo):

```json
{
  "total_proyectos": 19,
  "total_empresas": 10,
  "total_organizaciones": 12,
  "proyectos_activos": 19,
  "departamentos_con_actividad": 5
}
```

```http
GET /api/dashboard/publico/por-region
```

Array con métricas por departamento boliviano:

```json
[
  { "departamento": "Beni",       "total_proyectos": 6, "total_empresas": 5, "amazonico": true },
  { "departamento": "Santa Cruz", "total_proyectos": 4, "total_empresas": 2, "amazonico": true },
  ...
]
```

> **Diferencia clave vs. el dashboard privado:** no expone desglose por usuario individual, ni datos financieros, ni proyectos en estado borrador. Seguro para usar en una página pública sin login.

---

## 13. Publicaciones

Módulo de blog profesional donde los **Investigadores** publican artículos y la lectura es pública.

### Concepto de "bloques de contenido"

El campo `contenido` es un **array JSON de bloques tipados**. Esto permite intercalar títulos, párrafos e imágenes en cualquier orden:

```json
[
  { "tipo": "subtitulo", "texto": "Introducción" },
  { "tipo": "parrafo",   "texto": "El jaguar es el depredador apex de la Amazonía boliviana..." },
  { "tipo": "imagen",    "url": "https://api.kaaiya.com/uploads/publicaciones/abc.webp", "descripcion": "Jaguar en hábitat natural" },
  { "tipo": "subtitulo", "texto": "Metodología" },
  { "tipo": "parrafo",   "texto": "Se analizaron datos de 12 años..." }
]
```

Tipos de bloque:

| `tipo` | Campos | Uso |
|---|---|---|
| `subtitulo` | `texto` | Encabezado de sección |
| `parrafo` | `texto` | Texto corrido |
| `imagen` | `url`, `descripcion` (opcional, alt text) | Imagen incrustada |

### Matriz de permisos

| Acción | Investigador (propio) | Investigador (ajeno) | Admin / Superadmin |
|---|---|---|---|
| Crear | ✅ | ❌ | ❌ |
| Ver publicadas | ✅ | ✅ | ✅ (y público sin auth) |
| Ver borradores propios | ✅ | ❌ | — |
| Editar | ✅ | ❌ | ✅ (queda en `editado_por`) |
| Eliminar | ✅ | ❌ | ✅ |
| Subir imágenes | ✅ | ❌ | ✅ |

### Endpoints

#### Lectura pública (sin token)

```http
GET /api/publicaciones?page=1&limit=10
```

Listado paginado, solo publicaciones en estado `publicado`, ordenadas por fecha descendente. Estructura de respuesta igual a los demás listados paginados (`data`, `total`, `page`, `limit`, `pages`, `has_next`, `has_prev`).

```http
GET /api/publicaciones/{slug}
```

Detalle completo por slug URL-amigable. Solo devuelve publicaciones publicadas. Incluye el array de bloques de contenido y las imágenes adjuntas.

**Ejemplo de respuesta:**
```json
{
  "id": "31e4fa88-1592-4146-80e5-a90276b8db15",
  "titulo": "El Jaguar en la Amazonía boliviana",
  "slug": "el-jaguar-en-la-amazonia-boliviana-31e4fa88",
  "contenido": [
    { "tipo": "subtitulo", "texto": "Introducción" },
    { "tipo": "parrafo",   "texto": "El jaguar es el depredador apex..." }
  ],
  "estado": "publicado",
  "fechaCreacion": "2026-06-29T12:00:00Z",
  "fechaPublicacion": "2026-06-29T12:05:00Z",
  "fechaUltimaEdicion": null,
  "editadoPorId": null,
  "autor": { "id": 11, "nombre": "Investigador Test" },
  "imagenes": []
}
```

#### Crear publicación (solo Investigador)

```http
POST /api/publicaciones    [JWT — solo rol Investigador]
Content-Type: application/json

{
  "titulo": "El Jaguar en la Amazonía boliviana",
  "contenido": [
    { "tipo": "subtitulo", "texto": "Introducción" },
    { "tipo": "parrafo",   "texto": "El jaguar es el depredador apex..." },
    { "tipo": "imagen",    "url": "https://...", "descripcion": "Jaguar en hábitat natural" }
  ],
  "estado": "borrador"
}
```

- El `slug` se genera automáticamente del título; **no enviarlo en el body**.
- El `autor_id` se toma del JWT; **no enviarlo en el body**.
- `estado` puede ser `"borrador"` (default) o `"publicado"` directamente.
- Respuesta 201: objeto completo con `id` y `slug` generados.

> Solo los usuarios con `rol: 3` (Investigador) pueden crear publicaciones. Admin y Superadmin reciben `403`.

#### Mis publicaciones (solo Investigador, incluye borradores)

```http
GET /api/publicaciones/mias?estado=borrador&page=1&limit=10    [JWT — solo rol Investigador]
```

Filtro `estado` opcional: `"borrador"` | `"publicado"`. Sin filtro devuelve todos.

#### Editar publicación

```http
PATCH /api/publicaciones/{id}    [JWT — Investigador (solo propia) / Admin / Superadmin]
Content-Type: application/json

{
  "titulo": "Título corregido",
  "estado": "publicado"
}
```

- Todos los campos son opcionales.
- Al cambiar `estado` a `"publicado"` por primera vez, el backend registra `fechaPublicacion` automáticamente.
- Si un Admin/Superadmin edita la publicación de otro autor, el campo `editadoPorId` queda registrado para trazabilidad.

#### Eliminar publicación

```http
DELETE /api/publicaciones/{id}    [JWT — Investigador (solo propia) / Admin / Superadmin]
```

Respuesta: `204 No Content`.

#### Subir imagen asociada

```http
POST /api/publicaciones/{id}/imagenes    [JWT — Investigador (solo propia) / Admin / Superadmin]
Content-Type: multipart/form-data

file: <archivo>          (JPEG, PNG o WebP, máx 5 MB)
descripcion: "Alt text"  (opcional)
```

Respuesta 201: `{ "id": "uuid", "url": "https://...", "orden": 0 }`.

Las imágenes se convierten a **WebP 1200×800** automáticamente. La URL resultante es la que debes usar en el bloque `{ "tipo": "imagen", "url": "..." }` del contenido.

### Flujo completo para el Investigador

```
1. POST /publicaciones               → crea en borrador, obtienes id y slug
2. POST /publicaciones/{id}/imagenes → sube imágenes, obtienes URLs
3. PATCH /publicaciones/{id}         → añade bloques con las URLs de imágenes, estado="publicado"
4. GET  /publicaciones/{slug}        → verificar resultado público
```

---

## 14. Admin — Logs de Auditoría

Panel de trazabilidad para Admin y Superadmin. Registra automáticamente eventos de seguridad (login fallido, cambios de rol, etc.) y acciones administrativas sobre publicaciones.

### Consultar logs

```http
GET /api/admin/logs    [JWT — Admin o Superadmin]
```

**Filtros (todos opcionales):**

| Parámetro | Tipo | Descripción |
|---|---|---|
| `tipo` | `aplicacion` \| `seguridad` | Categoría del evento |
| `severidad` | `info` \| `warn` \| `error` \| `critico` | Nivel de urgencia |
| `usuario_id` | número | ID del usuario que generó el evento |
| `fecha_desde` | ISO 8601 (ej: `2026-01-01`) | Inicio del rango temporal |
| `fecha_hasta` | ISO 8601 (ej: `2026-12-31`) | Fin del rango temporal |
| `page` | número | Paginación (default 1) |
| `limit` | número | Resultados por página (default 50, máx 200) |

**Ejemplo:**
```http
GET /api/admin/logs?tipo=seguridad&severidad=warn&fecha_desde=2026-06-01&page=1&limit=50
```

**Respuesta:**
```json
{
  "data": [
    {
      "id": "uuid",
      "tipo": "seguridad",
      "severidad": "warn",
      "usuarioId": null,
      "accion": "LOGIN_FALLIDO",
      "detalle": { "email": "nadie@ejemplo.com" },
      "ipOrigen": null,
      "createdAt": "2026-06-29T12:00:00Z"
    },
    {
      "id": "uuid",
      "tipo": "seguridad",
      "severidad": "critico",
      "usuarioId": 1,
      "accion": "ROL_CAMBIADO",
      "detalle": { "usuarioAfectado": 11, "rolAnterior": 3, "rolNuevo": 2, "cambiadoPor": "admin@kaaiya.bo" },
      "ipOrigen": null,
      "createdAt": "2026-06-29T13:00:00Z"
    }
  ],
  "total": 42, "page": 1, "limit": 50, "pages": 1, "has_next": false, "has_prev": false
}
```

**Eventos registrados automáticamente:**

| Acción | Tipo | Severidad | Cuándo |
|---|---|---|---|
| `LOGIN_FALLIDO` | seguridad | warn | Credenciales incorrectas |
| `LOGIN_CUENTA_DESACTIVADA` | seguridad | warn | Login con cuenta desactivada |
| `LOGIN_ACCESO_EXPIRADO` | seguridad | warn | Login con `fechaExpiracion` pasada |
| `LOGIN_EXITOSO` | seguridad | info | Login correcto |
| `USUARIO_CREADO` | seguridad | info | Admin crea un usuario |
| `ROL_CAMBIADO` | seguridad | critico | Admin cambia el rol de un usuario |
| `CUENTA_DESACTIVADA` | seguridad | critico | Admin desactiva una cuenta |
| `CUENTA_ACTIVADA` | seguridad | info | Admin reactiva una cuenta |
| `USUARIO_ELIMINADO` | seguridad | critico | Superadmin elimina un usuario |
| `PUBLICACION_EDITADA_POR_ADMIN` | seguridad | warn | Admin/Superadmin edita publicación de otro autor |
| `PUBLICACION_ELIMINADA_POR_ADMIN` | seguridad | warn | Admin/Superadmin elimina publicación de otro autor |

> **Retención:** los logs se conservan mínimo **2 años** según requisito UCB / ISO 27001:2022.
> En el UI, mostrar el enlace al panel de logs **solo si `rol <= 2`** (Admin o Superadmin).

---

## 15. Imágenes

Todos los endpoints de imagen requieren **JWT**. Se usa `multipart/form-data` con el campo `file`.

### Proyectos

| Acción | Endpoint | Límite | Output |
|---|---|---|---|
| Subir imagen principal | `POST /api/proyectos/{id}/imagen-principal` | 5 MB | WebP 1200×800 |
| Eliminar imagen principal | `DELETE /api/proyectos/{id}/imagen-principal` | — | — |
| Agregar a galería | `POST /api/proyectos/{id}/galeria` | 5 MB c/u | WebP 1200×800 |
| Eliminar de galería | `DELETE /api/proyectos/{id}/galeria/{imagenId}` | — | — |
| Reordenar galería | `PUT /api/proyectos/{id}/galeria/orden` | — | — |

**Reordenar galería — body:**
```json
[
  { "id": "uuid-imagen-1", "orden": 0 },
  { "id": "uuid-imagen-2", "orden": 1 }
]
```

### Empresas y Organizaciones

| Acción | Endpoint | Límite | Output |
|---|---|---|---|
| Subir logo | `POST /api/empresas/{id}/logo` | 2 MB | WebP 400×400 |
| Eliminar logo | `DELETE /api/empresas/{id}/logo` | — | — |
| Subir logo org | `POST /api/organizaciones/{id}/logo` | 2 MB | WebP 400×400 |
| Eliminar logo org | `DELETE /api/organizaciones/{id}/logo` | — | — |

Formatos aceptados: JPEG, PNG, WebP. El backend convierte y redimensiona automáticamente a WebP.

---

## 16. Health — monitoreo (sin JWT)

```http
GET /api/health
→ 200 siempre que el proceso esté vivo
{ "status": "ok", "service": "kaaiya-backend", "uptimeSeconds": 3600 }

GET /api/health/ready
→ 200 cuando BD y GeoRef están operativos
{ "status": "ok", "db": "up", "georef": "up" }
→ "degraded" si georef está caído (backend sigue funcionando)
→ 503 si la BD está caída
```

---

## 17. Tabla de errores

| Código | Cuándo ocurre | Qué mostrar al usuario |
|---|---|---|
| `400 Bad Request` | Campo inválido, tipo incorrecto, campo extra desconocido | El campo `message` (puede ser array) contiene los mensajes de validación |
| `401 Unauthorized` | Sin token, token expirado o inválido | Redirigir al login |
| `403 Forbidden` | Rol insuficiente para esa acción | "No tienes permisos para esta acción" |
| `404 Not Found` | ID no existe en la base de datos | "No se encontró el recurso solicitado" |
| `409 Conflict` | Email ya registrado | "Ya existe una cuenta con ese correo electrónico" |
| `422 Unprocessable Entity` | Coordenadas fuera del rango de Bolivia | "Las coordenadas deben estar dentro del territorio boliviano" |
| `429 Too Many Requests` | Rate limit superado (login: 5/min; resto: 60/min) | "Demasiados intentos. Por favor espera 60 segundos antes de reintentar" |
| `503 Service Unavailable` | Base de datos no responde (`/health/ready` lo detecta) | "El servicio no está disponible en este momento. Por favor inténtalo más tarde" |

**Estructura de error estándar:**
```json
{
  "statusCode": 400,
  "message": ["email debe ser un correo válido", "password es obligatorio"],
  "error": "Bad Request"
}
```

`message` puede ser `string` (un error) o `string[]` (múltiples errores de validación simultáneos). Siempre tratar como array en el cliente para uniformidad.

---

## 18. Checklist de integración rápida

- [ ] Guardar `accessToken` en estado seguro (memoria o cookie httpOnly, no localStorage en prod)
- [ ] Interceptar respuestas `401` y redirigir a login
- [ ] Decodificar el payload del JWT para leer `rol` y controlar visibilidad del UI
- [ ] Llamar a `/filtros-disponibles` al montar vistas de listado/dashboard (no hardcodear IDs)
- [ ] Llamar a los catálogos `/forms` al montar formularios y cachear en context
- [ ] Implementar la carga en cascada: departamento → municipio → comunidad
- [ ] Ocultar/deshabilitar selector de comunidad cuando `GET /municipios/{id}/comunidades` devuelve `[]`
- [ ] Validar `lat/lng` en el cliente antes de enviar (Bolivia: lat −23..−9, lng −70..−57)
- [ ] Usar `GET /proyectos/map` para el mapa público y `GET /proyectos` para listados con auth
- [ ] Usar `GET /dashboard/filtros-disponibles` como punto de entrada del panel analítico
- [ ] Manejar `message` como array (incluso si es string individual)
- [ ] No enviar `PORT` ni headers de entorno en las peticiones (solo `Authorization` y `Content-Type`)
- [ ] **Publicaciones:** renderizar `contenido` como array de bloques tipados (`subtitulo` → `<h3>`, `parrafo` → `<p>`, `imagen` → `<img>`)
- [ ] **Publicaciones:** mostrar `GET /publicaciones` y `GET /publicaciones/{slug}` sin token en la sección pública; mostrar `GET /publicaciones/mias` solo si `rol === 3`
- [ ] **Dashboard público:** usar `GET /dashboard/publico/resumen` y `/por-region` en la landing sin requerir login
- [ ] **Logs:** mostrar enlace al panel de auditoría solo si `rol <= 2` (Admin o Superadmin)
