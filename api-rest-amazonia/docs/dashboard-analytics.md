# Capa analítica y dashboard — Kaa Iya

> Implementado: junio 2026  
> Rama: `Octa-backend`

---

## Qué se añadió

Una capa de lectura sobre la base de datos existente para alimentar un dashboard con KPIs, métricas por región y evolución temporal. La arquitectura tiene tres niveles:

```
Tablas transaccionales (OLTP — ya existían)
        ↓  triggers automáticos
Materialized views en PostgreSQL  (nuevas)
        ↓  raw queries + caché en memoria
Módulo NestJS /dashboard           (nuevo)
```

---

## Archivos nuevos

### `database/analytics.sql`

Script SQL independiente que se ejecuta **después** de `schema.sql`. Crea:

| Objeto | Tipo | Descripción |
|---|---|---|
| `mv_dashboard_resumen_global` | Materialized view | 1 fila con todos los KPIs globales |
| `mv_dashboard_por_region` | Materialized view | 1 fila por departamento |
| `mv_dashboard_timeline` | Materialized view | 1 fila por año |
| `refresh_dashboard_views()` | Función PL/pgSQL | Refresca las 3 vistas |
| `trg_dashboard_refresh_empresas` | Trigger | Dispara refresco tras INSERT/UPDATE/DELETE en `empresas` |
| `trg_dashboard_refresh_organizaciones` | Trigger | Ídem en `organizaciones` |
| `trg_dashboard_refresh_proyectos` | Trigger | Ídem en `proyectos` |

**Para aplicar en desarrollo:**
```bash
psql -d amazonia_db -f database/analytics.sql
```

### `src/modules/dashboard/`

```
src/modules/dashboard/
├── dashboard.module.ts
├── controllers/
│   └── dashboard.controller.ts
└── services/
    └── dashboard.service.ts
```

---

## Detalle de las materialized views

### `mv_dashboard_resumen_global`

Fila única con totales globales del sistema. Campos:

| Campo | Descripción |
|---|---|
| `total_empresas` | Conteo total de empresas registradas |
| `total_organizaciones` | Conteo total de organizaciones |
| `total_proyectos` | Conteo total de proyectos |
| `proyectos_conservacion` | Proyectos con `id_area = 1` |
| `proyectos_desarrollo` | Proyectos con `id_area = 2` |
| `proyectos_activos` | Proyectos sin `anio_fin` (en curso) |
| `empresas_con_proyectos` | Empresas que participan en al menos un proyecto |
| `organizaciones_con_proyectos` | Organizaciones con al menos un proyecto |
| `departamentos_amazonicos` | Departamentos con `amazonico = TRUE` |
| `ultima_actualizacion` | Timestamp del último refresco (NOW() al momento de refrescar) |

### `mv_dashboard_por_region`

Una fila por departamento. Cruza tres fuentes geográficas distintas:
- **Empresas**: vía `departamentos_empresas` (relación M:N)
- **Organizaciones**: vía `organizaciones.id_departamento` (FK directo)
- **Proyectos**: vía `localidades_proyectos → municipios → departamentos`

Campos: `id_departamento`, `departamento`, `amazonico`, `total_empresas`, `total_organizaciones`, `total_proyectos`, `proyectos_conservacion`, `proyectos_desarrollo`.

### `mv_dashboard_timeline`

Una fila por año, desde el registro más antiguo hasta el año actual. Usa los campos enteros de año de cada entidad:
- `empresas.anio_inicio_apoyo`
- `organizaciones.anio_inicio_trabajo`
- `proyectos.anio_inicio`

Campos: `anio`, `nuevas_empresas`, `nuevas_organizaciones`, `nuevos_proyectos`.

---

## Endpoints del dashboard

Todos bajo el prefijo `/api/dashboard`. Requieren **Bearer JWT** (`Authorization: Bearer <token>`).  
Visibles en Swagger UI bajo el tag **Dashboard**.

| Método | Ruta | Fuente | Caché TTL |
|---|---|---|---|
| `GET` | `/api/dashboard/resumen` | `mv_dashboard_resumen_global` | 60 s |
| `GET` | `/api/dashboard/por-region` | `mv_dashboard_por_region` | 60 s |
| `GET` | `/api/dashboard/timeline` | `mv_dashboard_timeline` | 300 s |
| `GET` | `/api/dashboard/salud` | `mv_dashboard_resumen_global` | 30 s |

### Respuesta de `/api/dashboard/salud`

```json
{
  "status": "ok",
  "ultima_actualizacion": "2026-06-11T20:30:00.000Z",
  "totales": {
    "empresas": 142,
    "organizaciones": 89,
    "proyectos": 317
  }
}
```

---

## Caché en memoria

`DashboardService` mantiene un `Map<string, { data, expiresAt }>` privado. No requiere Redis ni ninguna dependencia externa. El caché se invalida automáticamente por TTL; el siguiente request tras el vencimiento consulta la materialized view y repuebla la entrada.

---

## Decisión de diseño: triggers sin CONCURRENTLY

PostgreSQL prohíbe `REFRESH MATERIALIZED VIEW CONCURRENTLY` dentro de una transacción. Los triggers siempre corren en la misma transacción que el DML que los dispara, por lo que la función de refresco usa `REFRESH MATERIALIZED VIEW` (sin `CONCURRENTLY`).

Para el volumen actual de datos (cientos de filas) el bloqueo de lectura es menor a 5 ms y no tiene impacto perceptible.

Todos los materialized views tienen `UNIQUE INDEX` definido, lo que habilita el uso de `CONCURRENTLY` desde fuera de transacciones (cron externo, endpoint de admin) si el volumen escala.

---

## Deuda técnica registrada

| Item | Descripción |
|---|---|
| CONCURRENTLY para escala | Con >10 k filas reemplazar triggers por un `@Cron` de `@nestjs/schedule` que llame `REFRESH MATERIALIZED VIEW CONCURRENTLY` cada 60 s desde fuera de toda transacción |
| Invalidación activa de caché | Usar `pg_notify` en el trigger para señalar a NestJS que limpie el caché antes del TTL |
| Endpoint de refresco manual | `POST /dashboard/refrescar` (solo Superadmin) para forzar `REFRESH CONCURRENTLY` on-demand |

---

## Verificación rápida

```sql
-- Las 3 vistas existen y tienen datos
SELECT * FROM mv_dashboard_resumen_global;
SELECT COUNT(*) FROM mv_dashboard_por_region;   -- debe ser 9 (departamentos)
SELECT * FROM mv_dashboard_timeline ORDER BY anio;

-- Los triggers están activos
SELECT tgname, tgrelid::regclass FROM pg_trigger
WHERE tgname LIKE 'trg_dashboard%';
```

```bash
# El backend compila y levanta sin errores
npm run start:dev

# Endpoint sin token → 401
curl http://localhost:3333/api/dashboard/resumen

# Endpoint con token → 200
curl -H "Authorization: Bearer <token>" http://localhost:3333/api/dashboard/resumen
```
