# Comparación: Implementado vs Pendiente — Backend Kaa Iya

> Documento de análisis de brechas basado en el código actual y el alcance definido en `informe.md`.
> Actualizado: junio 2026

---

## Resumen ejecutivo

| Área | Estado | Notas |
|------|--------|-------|
| Estructura BD / catálogos | ✅ Implementado | 31+ módulos, entidades completas |
| Formulario registro empresa | ✅ Implementado | POST /api/formularios/empresas |
| Formulario registro organización | ✅ Implementado | POST /api/formularios/organizaciones |
| Lógica de proyectos compartidos | ⚠️ Error de diseño | Siempre crea nuevos, no vincula existentes |
| Historial de participación actores | ⚠️ Incompleto | PK compuesta impide múltiples registros |
| Autenticación y usuarios | ❌ Faltante | JWT configurado pero sin módulo auth |
| Endpoints de consulta (detalle, filtros, paginación) | ❌ Faltante | Solo GET básicos sin parámetros |
| Dashboards analíticos | ❌ Faltante | Mencionado en informe, no iniciado |
| Multimedia (imágenes, videos) | ❌ Faltante | Sin módulo de uploads ni campos de URL |
| Georreferenciación (microservicio GeoRef) | ❌ Faltante | Arquitectura diseñada, no integrada |
| Migraciones y seeders | ❌ Faltante | synchronize: false pero sin archivos |
| Tests | ❌ Faltante | Zero archivos .spec.ts |
| Seguridad complementaria (helmet, rate limiting) | ❌ Faltante | Mencionado en informe, no implementado |

---

## 1. Lo que está implementado ✅

### 1.1 Infraestructura base

| Componente | Archivo clave | Estado |
|-----------|--------------|--------|
| Bootstrap NestJS con ValidationPipe + CORS + prefix /api | `src/main.ts` | ✅ |
| Configuración por ambiente (dev/prod/test/debug) con validación Joi | `src/infrastructure/config/` | ✅ |
| Módulo de BD TypeORM + PostgreSQL (`synchronize: false`) | `src/infrastructure/database/database.module.ts` | ✅ |
| Config JWT (secreto, expiración, activación condicional) | `src/infrastructure/config/services/jwt.config.ts` | ✅ |
| Swagger UI en /api/documentation (solo en dev/test/debug) | `src/main.ts` | ✅ |
| Dockerfile (node:22, puerto 3333) | `Dockerfile` | ✅ |
| Excepciones HTTP personalizadas (400, 401, 403, 404, 409) | `src/shared/exceptions/` | ✅ |
| Clases base de entidades (BaseCreated, BaseCreatedUpdated, BaseEntitySoftDelete) | `src/infrastructure/database/base.entity.ts` | ✅ |
| Utilidades: crypto (bcrypt), http-response, swagger helpers | `src/shared/utils/` | ✅ |

### 1.2 Catálogos de datos maestros (12 módulos)

Todos implementados con entidad, servicio y controlador. Los que admiten entradas custom tienen el patrón `esPropio`:

| Catálogo | Endpoint | Acepta custom |
|----------|----------|---------------|
| Áreas de proyecto | `GET /api/areas` | No |
| Apoyos | `GET /api/apoyos/forms` | Sí (esPropio) |
| Ayudas | `GET /api/ayudas/forms` | Sí (esPropio) |
| Motivos | `GET /api/motivos/forms` | Sí (esPropio) |
| Formas jurídicas | `GET /api/formas-juridicas/forms` | Sí (findOneOrCreate) |
| ODS | — | No |
| Tipos de proyecto | `GET /api/tipos-proyectos/forms` | Sí (findOneOrCreate) |
| Tipos de organización | `GET /api/tipos-organizaciones/forms` | Sí (findOneOrCreate) |
| Actores municipales | — | Sí (esPropio) |
| Especies animales | — | Sí (esPropio) |
| Prácticas agrícolas | — | Sí (esPropio) |
| Áreas de desarrollo | — | Sí (esPropio) |

### 1.3 Ubicaciones geográficas (4 módulos)

| Módulo | Entidades | Endpoint |
|--------|----------|---------|
| Departamentos | Departamento (con flag `amazonico`) | `GET /api/departamentos` |
| Municipios | Municipio → Departamento | `GET /api/municipios` |
| Comunidades indígenas | ComunidadIndigena | — |
| Comunidades-Municipios | Pivot M:M ComunidadIndigena ↔ Municipio | — |

### 1.4 Gestión empresarial (5 módulos)

| Módulo | Descripción |
|--------|-------------|
| Empresas | Entidad principal con `create()` transaccional y `findAll()` |
| ApoyosEmpresas | Pivot empresa ↔ apoyo |
| DepartamentosEmpresas | Pivot empresa ↔ departamento |
| MotivosEmpresas | Pivot empresa ↔ motivo |
| OdsEmpresas | Pivot empresa ↔ ODS |

### 1.5 Gestión organizacional (2 módulos)

| Módulo | Descripción |
|--------|-------------|
| Organizaciones | Entidad con `create()` transaccional y `findAll()` |
| OrganizacionesEmpresas | Pivot organización ↔ empresa (con campo `nombre` libre) |

### 1.6 Gestión de proyectos (6 módulos)

| Módulo | Descripción |
|--------|-------------|
| Proyectos | Entidad con bifurcación conservación/desarrollo |
| ProyectosEmpresas | Pivot proyecto ↔ empresa (con `fechaInicio`/`fechaFin`) |
| ProyectosOrganizaciones | Pivot proyecto ↔ organización (con `fechaInicio`/`fechaFin`) |
| LocalidadesProyectos | Municipio + comunidad indígena por proyecto (con validación de pertenencia) |
| ActoresProyectos | Actores municipales por proyecto |
| AyudasProyectos | Tipos de ayuda por proyecto |

### 1.7 Conservación y comunidades (3 módulos)

| Módulo | Descripción |
|--------|-------------|
| ConservacionAnimales | Especies protegidas por proyecto de conservación |
| ConservacionAgricolas | Prácticas agrícolas por proyecto de conservación |
| ComunidadesIndigenasAreas | Áreas de desarrollo comunitario por proyecto |

### 1.8 Formularios de registro (punto de entrada principal)

| Endpoint | Descripción |
|----------|-------------|
| `POST /api/formularios/empresas` | Registro completo empresa + proyectos en una transacción |
| `POST /api/formularios/organizaciones` | Registro completo organización + proyectos en una transacción |

Los formularios manejan el patrón `seleccionados + otros` en todos los catálogos y la bifurcación automática del proyecto según `area` (conservación vs desarrollo).

### 1.9 Consultas básicas (sin paginación ni filtros)

| Endpoint | Descripción |
|----------|-------------|
| `GET /api/empresas` | Listado plano de todas las empresas |
| `GET /api/organizaciones` | Listado plano de todas las organizaciones |
| `GET /api/proyectos` | Listado plano de todos los proyectos |

---

## 2. Problemas en la implementación actual ⚠️

### 2.1 Los proyectos siempre se crean nuevos — no hay vinculación a proyectos existentes

**Descripción del problema:**

Actualmente, cada vez que se registra una empresa u organización y declara proyectos en el formulario, el sistema crea proyectos **siempre nuevos** en la base de datos. No existe ningún mecanismo para vincular la empresa/organización a un proyecto que ya exista.

**Escenario real que falla:**
```
Empresa "Bolivia Sostenible" llena el formulario y declara:
  Proyecto: "Reforestación Rio Mamoré" (inicio 2023, fin 2025)

Organización "Fundación Amazonía Verde" llena el formulario y declara:
  Proyecto: "Reforestación Rio Mamoré" (el MISMO proyecto, colaboran juntos)

Resultado actual: Se crean DOS proyectos separados con el mismo nombre.
Resultado esperado: Se crea UNO y ambos quedan vinculados al mismo.
```

**Dónde está el problema en el código:**

- `ProyectosEmpresasService.createMany()` en `src/modules/gestion-proyectos/proyectos-empresas/services/proyectos-empresas.service.ts`:  llama a `ProyectosService.create()` incondicionalmente para cada proyecto del formulario.
- No hay ningún `findOne({ nombre })` previo que busque si ya existe un proyecto con ese nombre.

**Lo que dijimos que haríamos manualmente:**
Acordamos durante el diseño que la vinculación a proyectos existentes se haría de forma manual por un administrador (un admin iría a la BD y crearía la relación directamente). Esto es una solución temporal y debe documentarse como deuda técnica.

**Propuesta de solución futura (no urgente):**
1. Agregar en el formulario una sección opcional: "¿Este proyecto ya está registrado en la plataforma?" con un buscador de proyectos existentes.
2. Si el usuario selecciona un proyecto existente → solo crear la relación `ProyectoEmpresa`/`ProyectoOrganizacion`.
3. Si el usuario no selecciona nada → crear el proyecto nuevo como hoy.
4. Esto requiere un endpoint `GET /api/proyectos?search=nombre` para el buscador del frontend.

---

### 2.2 El historial de participación de actores no puede rastrear salidas y re-entradas

**Descripción del problema:**

Las tablas `proyectos_empresas` y `proyectos_organizaciones` tienen PK compuesta `(id_empresa, id_proyecto)` y `(id_proyecto, id_organizacion)`. Esto significa que **solo puede existir un registro por par empresa-proyecto** u organización-proyecto.

Las columnas `fechaInicio` y `fechaFin` de estas tablas representan el período de participación, pero la estructura actual impide registrar una segunda participación si el actor salió y volvió a entrar.

**Escenario real que falla:**
```
"Empresa A" participa en "Proyecto X" de 2021 a 2023.
En 2025 retoma su participación.

Resultado actual: No se puede registrar la segunda participación
  (la PK compuesta ya existe → violación de constraint).
Resultado esperado: Dos registros de participación:
  (idEmpresa, idProyecto, fechaInicio=2021, fechaFin=2023)
  (idEmpresa, idProyecto, fechaInicio=2025, fechaFin=null)
```

**Lo que acordamos hacer manualmente:**
El historial completo de participaciones se registrará y editará de forma manual por un administrador. Para el MVP, la tabla refleja la participación actual (la más reciente).

**Propuesta de solución futura:**
Cambiar la PK de `proyectos_empresas` y `proyectos_organizaciones` de composite `(id_empresa, id_proyecto)` a un `id` autoincremental, permitiendo múltiples registros para el mismo par. Agregar un campo `activo: boolean` para indicar la participación vigente.

Esto requiere una **migración** de las tablas afectadas.

---

### 2.3 Sin auditoría de cambios en datos de actores y proyectos

**Descripción:**

No hay ningún mecanismo de trazabilidad de cambios. Si un admin edita los datos de una empresa, no queda registro de:
- Qué campo se cambió
- Cuál era el valor anterior
- Quién lo cambió
- Cuándo se cambió

**Impacto:** Esto está en contradicción con el requisito de `informe.md` sección 10.4 ("registro estructurado de eventos relevantes: cambios en datos de actores y proyectos").

**Solución futura:** Tabla de auditoría `audit_logs (id, tabla, id_registro, campo, valor_anterior, valor_nuevo, id_usuario, created_at)` o uso de un plugin TypeORM de auditoría.

---

### 2.4 La relación organización-empresa no tiene fechas ni historial

**Descripción:**

`OrganizacionEmpresa` (alianzas entre organizaciones y empresas) solo guarda el nombre de la alianza. No tiene `fechaInicio`, `fechaFin` ni ningún otro dato temporal. No queda registro de cuándo ocurrió la alianza ni si sigue activa.

---

## 3. Pendiente — Autenticación y sistema de usuarios ❌

### 3.1 Infraestructura disponible (lista para usar)

- `@nestjs/jwt` y `passport-jwt` instalados
- `bcrypt` instalado con utilidades en `src/shared/utils/crypto.util.ts`
- `RoleEnum` definido en `src/shared/enums/role.enum.ts`
- Configuración JWT en `src/infrastructure/config/services/jwt.config.ts`

**Lo que NO existe:** módulo `auth/`, entidad `Usuario`, endpoints de login, guards activos.

---

### 3.2 Los 4 roles del sistema

| Rol | Descripción | Acceso público | Acceso privado |
|-----|-------------|----------------|----------------|
| **Superadmin** | Control total del sistema | Todo | Todo: usuarios, configuración, auditoría, BD |
| **Admin** | Gestión operativa | Todo | CRUD empresas/orgs/proyectos, gestión usuarios, aprobar investigadores |
| **Investigador** | Acceso temporal aprobado | Solo resumen básico (como invitado) | Datos completos mientras tenga acceso vigente |
| **Invitado** | Sin autenticación | Solo resumen básico | Ninguno |

---

### 3.3 Qué implica cada rol en detalle

#### Invitado (sin login)
- Puede ver listado de empresas: nombre, área geográfica, ODS que apoya
- Puede ver listado de organizaciones: nombre, tipo, departamento
- Puede ver listado de proyectos: nombre, área (conservación/desarrollo), municipios
- **NO puede ver:** datos de contacto, información financiera, documentos internos, dashboards

#### Investigador (acceso temporal aprobado)
- Primero hace una **solicitud de acceso** (formulario con nombre, institución, propósito de investigación)
- Un **admin revisa y aprueba o rechaza** la solicitud
- Si se aprueba: recibe credenciales con fecha de expiración definida por el admin
- Acceso completo a todos los datos (igual que admin) **excepto** gestión de usuarios
- Su acceso expira automáticamente (el JWT tiene tiempo definido en la solicitud)
- **No puede** editar nada, solo consultar

#### Admin
- CRUD completo de empresas, organizaciones y proyectos
- Crear y gestionar usuarios (admin o investigador)
- Ver y responder solicitudes de acceso de investigadores
- Ver dashboards y reportes
- **No puede** modificar configuración del sistema ni ver logs de auditoría (eso es superadmin)

#### Superadmin
- Todo lo del admin
- Gestión de configuración del sistema
- Acceso a logs de auditoría
- Crear otros superadmins o admins
- No hay restricciones

---

### 3.4 Módulos/endpoints que hay que crear

```
src/modules/auth/
├── auth.module.ts
├── controllers/
│   ├── auth.controller.ts          # POST /auth/login, POST /auth/logout
│   └── solicitudes.controller.ts   # POST /auth/solicitar-acceso, GET /auth/solicitudes (admin), PATCH /auth/solicitudes/:id (admin)
├── services/
│   ├── auth.service.ts             # login, validateUser, generateToken
│   └── solicitudes.service.ts      # create, findAll, approve, reject
├── entities/
│   ├── usuario.entity.ts           # id, email, password, rol, activo, created_at
│   └── solicitud-acceso.entity.ts  # id, nombre, institucion, proposito, estado, fechaExpiracion, id_usuario_revisor
├── dto/
│   ├── login.dto.ts
│   └── crear-solicitud.dto.ts
├── guards/
│   ├── jwt-auth.guard.ts
│   └── roles.guard.ts
└── strategies/
    └── jwt.strategy.ts
```

**Decoradores necesarios:**
- `@Roles(RoleEnum.Admin, RoleEnum.SuperAdmin)` — restringir por rol
- `@UseGuards(JwtAuthGuard, RolesGuard)` — activar en endpoints protegidos

---

## 4. Pendiente — Endpoints del frontend ❌

### 4.1 Endpoints de detalle (no existen)

| Endpoint | Descripción | Acceso |
|----------|-------------|--------|
| `GET /api/proyectos/:id` | Datos completos del proyecto con todas sus relaciones | Todos |
| `GET /api/empresas/:id` | Perfil completo de la empresa | Invitado: resumen / Investigador+: completo |
| `GET /api/organizaciones/:id` | Perfil completo de la organización | Invitado: resumen / Investigador+: completo |

### 4.2 Paginación (no existe en ningún endpoint)

El DTO `PaginationParamsDto` ya existe en `src/shared/dto/pagination-params.dto.ts` pero **no se usa en ningún controlador**. Todos los `findAll()` devuelven registros sin límite.

Implementar paginación en:
- `GET /api/empresas?page=1&limit=10`
- `GET /api/organizaciones?page=1&limit=10`
- `GET /api/proyectos?page=1&limit=10`

### 4.3 Filtros (no existen)

| Endpoint | Filtros necesarios |
|----------|--------------------|
| `GET /api/proyectos` | `?area=1` (conservación/desarrollo), `?departamento=3`, `?tipo=2`, `?anio=2023`, `?search=nombre` |
| `GET /api/empresas` | `?departamento=3`, `?search=nombre` |
| `GET /api/organizaciones` | `?departamento=3`, `?esNacional=true`, `?tipo=2` |
| `GET /api/departamentos` | `?amazonico=true` (mostrar solo los 9 amazónicos) |
| `GET /api/municipios` | `?departamento=3`, `?search=nombre` |

### 4.4 Endpoints de administración (no existen)

| Endpoint | Descripción |
|----------|-------------|
| `PATCH /api/empresas/:id` | Editar datos de empresa (Admin+) |
| `PATCH /api/organizaciones/:id` | Editar datos de organización (Admin+) |
| `PATCH /api/proyectos/:id` | Editar datos de proyecto (Admin+) |
| `DELETE /api/empresas/:id` | Eliminar empresa — soft delete (Admin+) |
| `DELETE /api/organizaciones/:id` | Eliminar organización — soft delete (Admin+) |
| `DELETE /api/proyectos/:id` | Eliminar proyecto — soft delete (Admin+) |
| `POST /api/proyectos/:id/actores` | Agregar empresa/org a proyecto existente (Admin+) |
| `PATCH /api/proyectos/:id/actores/:idActor` | Actualizar fechas de participación (Admin+) |

---

## 5. Pendiente — Dashboards ❌

Los dashboards están descritos en `informe.md` como "información analítica" y "reportes de avance". Son accesibles para admin, superadmin e investigadores (no para invitados).

### 5.1 Endpoints de datos para dashboards (no existen)

| Endpoint | Descripción |
|----------|-------------|
| `GET /api/dashboard/resumen` | KPIs: total empresas, orgs, proyectos, depts cubiertos |
| `GET /api/dashboard/proyectos-por-area` | Conteo por área (conservación vs desarrollo) |
| `GET /api/dashboard/proyectos-por-departamento` | Mapa de calor por departamento |
| `GET /api/dashboard/actores-por-anio` | Evolución temporal de registro de actores |
| `GET /api/dashboard/proyectos-activos` | Proyectos sin fecha de fin (en curso) |
| `GET /api/dashboard/ods-distribucion` | Distribución de ODS más apoyados |

### 5.2 Lo que verán los diferentes roles

| Vista | Invitado | Investigador | Admin | Superadmin |
|-------|----------|-------------|-------|------------|
| KPIs generales | ❌ | ✅ | ✅ | ✅ |
| Proyectos por área/dept | ❌ | ✅ | ✅ | ✅ |
| Timeline actores | ❌ | ✅ | ✅ | ✅ |
| ODS más apoyados | ❌ | ✅ | ✅ | ✅ |
| Lista de usuarios | ❌ | ❌ | ✅ | ✅ |
| Logs de auditoría | ❌ | ❌ | ❌ | ✅ |

---

## 6. Pendiente — Multimedia ❌

### 6.1 Imágenes

El sistema no tiene módulo de subida de archivos. Se necesita:
- Módulo `multer` para manejo de archivos en NestJS
- Campo `imagenes: string[]` (URLs) en entidades `Empresa`, `Organizacion` y `Proyecto`
- Endpoint `POST /api/empresas/:id/imagen`, `POST /api/organizaciones/:id/imagen`, `POST /api/proyectos/:id/imagen`
- Almacenamiento en disco local (servidor UCB) con path configurable

### 6.2 Videos externos (YouTube)

No hay campos para URLs de video en ninguna entidad. Se necesita:
- Campo `videoUrl: string` (nullable) en entidad `Proyecto`
- Campo `videoUrl: string` (nullable) en entidad `Empresa`
- Validación de formato URL en DTOs

---

## 7. Pendiente — Técnico e infraestructura ❌

### 7.1 Migraciones de base de datos (crítico para producción)

| Estado | Detalle |
|--------|---------|
| `synchronize: false` | Configurado correctamente |
| Archivos de migración | **No existen** |
| Impacto | La BD no puede inicializarse ni evolucionar en producción sin hacerlo manualmente |

Para generar: `npm run typeorm migration:generate -- -n NombreMigracion`
Se requiere agregar scripts de migración en `package.json`.

### 7.2 Seeders de catálogos iniciales

Los datos maestros que el sistema necesita para funcionar no tienen script de carga inicial:

| Dato | Volumen estimado |
|------|-----------------|
| Departamentos bolivianos | 9 departamentos |
| Municipios de Bolivia | ~340 municipios |
| Comunidades indígenas y sus relaciones con municipios | Variable |
| 17 ODS | 17 registros fijos |
| Catálogos base (apoyos, motivos, ayudas, etc.) | 10-20 registros cada uno |

### 7.3 Seguridad complementaria

| Medida | Estado | Prioridad |
|--------|--------|-----------|
| `helmet` (HTTP security headers) | ❌ No implementado | Alta |
| Rate limiting (`@nestjs/throttler`) | ❌ No implementado | Alta |
| Validación de errores con mensajes claros | ⚠️ Parcial | Media |
| Logging estructurado (Winston/Pino) | ❌ No implementado | Media |
| 2FA para admins | ❌ No implementado | Baja |

### 7.4 Tests (cero implementados)

| Tipo de test | Archivos .spec.ts | Estado |
|-------------|------------------|--------|
| Unitarios | 0 | ❌ |
| Integración | 0 | ❌ |
| E2E | 0 | ❌ |

Prioridad de tests a escribir:
1. `FormulariosService` — lógica más compleja con transacciones
2. `ProyectosService` — bifurcación conservación/desarrollo
3. `LocalidadesProyectosService` — validación de municipio/comunidad
4. Endpoints POST de formularios (integración)

### 7.5 Otros técnicos

| Item | Estado |
|------|--------|
| Health check `GET /api/health` | ❌ |
| README.md del proyecto (actual es plantilla NestJS) | ❌ |
| Corrección typos en nombres de archivo (`fobidden`, `enviroment`) | ❌ cosmético |
| Enums huérfanos (`order-status`, `notification-type`) | ❌ scaffolding |

---

## 8. Prioridades y cronograma sugerido

Dado que el despliegue está previsto para **julio 2026**, la priorización debe ser:

### Fase 1 — Antes del despliegue (urgente)
1. Migraciones TypeORM para esquema actual
2. Seeders para datos maestros (depts, municipios, ODS, catálogos)
3. Módulo `auth` con login JWT y 4 roles
4. Guards en endpoints que requieren autenticación
5. Helmet + rate limiting en `main.ts`

### Fase 2 — Para el frontend público (semanas 1-2 post-deploy)
6. Endpoints de detalle (`GET /api/proyectos/:id`, etc.)
7. Paginación y filtros en listados
8. Filtro `?amazonico=true` en departamentos
9. Campo `videoUrl` en proyectos (migración simple)

### Fase 3 — Funcionalidades avanzadas
10. Sistema de solicitudes de acceso para investigadores
11. Endpoints de dashboards/analytics
12. Módulo de subida de imágenes
13. Tests unitarios y de integración

### Deuda técnica a decidir con el equipo
- **Lógica de proyectos compartidos**: actualmente manejada manualmente por el admin. Decidir si se automatiza antes del lanzamiento o se documenta como proceso manual temporal.
- **Historial de participación**: el modelo actual (PK compuesta) no soporta re-entradas al proyecto. Requiere migración. Decidir prioridad.
- **Auditoría de cambios**: tabla de audit_logs. Requerimiento del informe sección 10.4.
