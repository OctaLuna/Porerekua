# Test Users — Módulo Auth
> Última ejecución: 2026-06-12 | Todos los tests: ✅ 46/46 pasaron

> Este archivo contiene credenciales de prueba. **Nunca incluir en producción.**

---

## Usuarios de prueba — Estado en BD

| ID | Rol          | Email                          | Password        | Estado                          |
|----|--------------|--------------------------------|-----------------|---------------------------------|
| 1  | Superadmin   | superadmin@kaaiya.test         | SuperPass1!     | Activo, sin expiración          |
| 2  | Admin        | admin@kaaiya.test              | AdminPass1!     | Activo, sin expiración          |
| 3  | Investigador | investigador@kaaiya.test       | InvPass2027!*   | Activo, expira 2030-01-01       |
| 4  | Investigador | inv-expirado@kaaiya.test       | InvPass2026!    | Activo, expiró 2020-01-01       |
| 5  | Admin        | inactivo@kaaiya.test           | InacPass1!      | Inactivo (`activo=false`)       |

> *El investigador vigente cambió su contraseña durante las pruebas a `InvPass2027!`

---

## Cómo recrear los usuarios

```bash
# 1. Superadmin — via seeder (en .env: SEED_SUPERADMIN_EMAIL y SEED_SUPERADMIN_PASSWORD)
npm run migrate:auth   # crea tablas si no existen
npm run seed:superadmin

# 2. Admin
curl -s -X POST http://localhost:3333/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"superadmin@kaaiya.test","password":"SuperPass1!"}' | grep accessToken

curl -s -X POST http://localhost:3333/api/auth/register \
  -H "Authorization: Bearer <SA_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@kaaiya.test","nombre":"Admin Test","password":"AdminPass1!","rol":2}'

# 3. Investigador vigente (vía solicitud → aprobar como Admin)
curl -s -X POST http://localhost:3333/api/auth/solicitar-acceso \
  -H "Content-Type: application/json" \
  -d '{"nombreSolicitante":"Investigador Test","emailSolicitante":"investigador@kaaiya.test","institucion":"UMSA","proposito":"Pruebas de QA para el modulo de autenticacion de la plataforma Kaa Iya"}'

curl -s -X PATCH http://localhost:3333/api/auth/solicitudes/1/aprobar \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"fechaExpiracionAcceso":"2030-01-01T00:00:00Z","passwordTemporal":"InvPass2026!"}'

# 4. Investigador expirado (fecha pasada)
curl -s -X POST http://localhost:3333/api/auth/solicitar-acceso \
  -H "Content-Type: application/json" \
  -d '{"nombreSolicitante":"Investigador Expirado","emailSolicitante":"inv-expirado@kaaiya.test","institucion":"UCB","proposito":"Pruebas de QA para verificar el comportamiento de accesos expirados en el sistema"}'

curl -s -X PATCH http://localhost:3333/api/auth/solicitudes/2/aprobar \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"fechaExpiracionAcceso":"2020-01-01T00:00:00Z","passwordTemporal":"InvPass2026!"}'

# 5. Usuario inactivo
curl -s -X POST http://localhost:3333/api/auth/register \
  -H "Authorization: Bearer <SA_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"email":"inactivo@kaaiya.test","nombre":"Usuario Inactivo","password":"InacPass1!","rol":2}'
# Luego: PATCH /auth/usuarios/<id> {"activo":false}
```

---

## Resultados de pruebas — 2026-06-12

### Sin token / Token inválido (11 pruebas)

| Endpoint | Método | Esperado | Obtenido | ✅/❌ |
|----------|--------|----------|----------|------|
| /api/auth/me | GET | 401 | 401 | ✅ |
| /api/auth/usuarios | GET | 401 | 401 | ✅ |
| /api/auth/solicitar-acceso (body inválido) | POST | 400 | 400 | ✅ |
| /api/empresas?limit=1 | GET | 200 | 200 | ✅ |
| /api/organizaciones?limit=1 | GET | 200 | 200 | ✅ |
| /api/proyectos?limit=1 | GET | 200 | 200 | ✅ |
| /api/departamentos?amazonico=true | GET | 200 | 200 | ✅ |
| /api/municipios?search=Trinidad | GET | 200 | 200 | ✅ |
| /api/proyectos?area=1 | GET | 200 | 200 | ✅ |
| /api/areas | GET | 200 | 200 | ✅ |
| /api/apoyos/forms | GET | 200 | 200 | ✅ |
| /api/auth/me (token "tokenbasura123") | GET | 401 | 401 | ✅ |
| /api/auth/me (token malformado) | GET | 401 | 401 | ✅ |

### Investigador vigente — id=3, expira 2030 (10 pruebas)

| Endpoint | Método | Esperado | Obtenido | ✅/❌ |
|----------|--------|----------|----------|------|
| /api/auth/me | GET | 200 | 200 | ✅ |
| /api/auth/me (PUT actualizar nombre) | PUT | 200 | 200 | ✅ |
| /api/auth/change-password | POST | 200 | 200 | ✅ |
| /api/auth/logout | POST | 200 | 200 | ✅ |
| /api/auth/usuarios | GET | 403 | 403 | ✅ |
| /api/auth/usuarios/1 | DELETE | 403 | 403 | ✅ |
| /api/auth/register | POST | 403 | 403 | ✅ |
| /api/auth/solicitudes | GET | 403 | 403 | ✅ |
| /api/empresas?limit=1 | GET | 200 | 200 | ✅ |
| /api/proyectos?area=1 | GET | 200 | 200 | ✅ |

### Admin — id=2 (11 pruebas)

| Endpoint | Método | Esperado | Obtenido | ✅/❌ |
|----------|--------|----------|----------|------|
| /api/auth/me | GET | 200 | 200 | ✅ |
| /api/auth/usuarios | GET | 200 | 200 | ✅ |
| /api/auth/solicitudes | GET | 200 | 200 | ✅ |
| /api/auth/register (rol=Admin) | POST | 201 | 201 | ✅ |
| /api/auth/register (rol=Superadmin) | POST | 403 | 403 | ✅ |
| /api/auth/usuarios/1 (Superadmin) | DELETE | 403 | 403 | ✅ |
| /api/auth/usuarios/6 (actualizar activo) | PATCH | 200 | 200 | ✅ |
| /api/empresas?limit=5 | GET | 200 | 200 | ✅ |
| /api/empresas?limit=101 | GET | 400 | 400 | ✅ |
| /api/organizaciones?esNacional=true | GET | 200 | 200 | ✅ |
| /api/proyectos?sort=nombre:desc | GET | 200 | 200 | ✅ |

### Superadmin — id=1 (9 pruebas)

| Endpoint | Método | Esperado | Obtenido | ✅/❌ |
|----------|--------|----------|----------|------|
| /api/auth/me | GET | 200 | 200 | ✅ |
| /api/auth/usuarios | GET | 200 | 200 | ✅ |
| /api/auth/usuarios/6 | DELETE | 200 | 200 | ✅ |
| /api/auth/register (rol=Superadmin) | POST | 201 | 201 | ✅ |
| /api/auth/usuarios/1 (propio id) | DELETE | 403 | 403 | ✅ |
| /api/auth/usuarios/999 (inexistente) | DELETE | 404 | 404 | ✅ |
| /api/auth/usuarios/2 (actualizar nombre) | PATCH | 200 | 200 | ✅ |
| /api/empresas?sort=anioInicioApoyo:asc | GET | 200 | 200 | ✅ |
| /api/proyectos?departamento=2&area=1 | GET | 200 | 200 | ✅ |

### Usuario inactivo e Investigador expirado (2 pruebas)

| Endpoint | Rol | Esperado | Obtenido | ✅/❌ |
|----------|-----|----------|----------|------|
| POST /api/auth/login | Usuario inactivo | 401 | 401 | ✅ |
| POST /api/auth/login | Investigador expirado | 401 | 401 | ✅ |

### Endpoints de detalle /:id (6 pruebas)

| Endpoint | Esperado | Obtenido | ✅/❌ |
|----------|----------|----------|------|
| GET /api/empresas/1 | 200 | 200 | ✅ |
| GET /api/organizaciones/1 | 200 | 200 | ✅ |
| GET /api/proyectos/1 | 200 | 200 | ✅ |
| GET /api/empresas/99999 | 404 | 404 | ✅ |
| GET /api/organizaciones/99999 | 404 | 404 | ✅ |
| GET /api/proyectos/99999 | 400 | 400 | ✅ |

### Paginación, filtros y solicitudes (14 pruebas)

| Endpoint | Esperado | Obtenido | ✅/❌ |
|----------|----------|----------|------|
| GET /empresas?page=1&limit=5 | 200 | 200 | ✅ |
| GET /empresas?limit=101 | 400 | 400 | ✅ |
| GET /proyectos?area=1 | 200 | 200 | ✅ |
| GET /proyectos?area=2 | 200 | 200 | ✅ |
| GET /proyectos?sort=anioInicio:desc | 200 | 200 | ✅ |
| GET /proyectos?sort=invalido | 400 | 400 | ✅ |
| GET /departamentos?amazonico=true | 200 | 200 | ✅ |
| GET /municipios?departamento=1 | 200 | 200 | ✅ |
| GET /municipios?search=Trinidad | 200 | 200 | ✅ |
| GET /organizaciones?esNacional=false | 200 | 200 | ✅ |
| POST /auth/solicitar-acceso válida | 201 | 201 | ✅ |
| POST /auth/solicitar-acceso duplicada | 409 | 409 | ✅ |
| POST /auth/solicitar-acceso propósito corto | 400 | 400 | ✅ |
| GET /auth/solicitudes?estado=pendiente | 200 | 200 | ✅ |

### Seguridad de contraseñas (4 pruebas)

| Escenario | Esperado | Obtenido | ✅/❌ |
|-----------|----------|----------|------|
| Login password incorrecto | 401 | 401 | ✅ |
| Login email inexistente | 401 | 401 | ✅ |
| Register password sin mayúscula | 400 | 400 | ✅ |
| Register password sin símbolo | 400 | 400 | ✅ |

---

## Resumen

| Grupo | Pruebas | ✅ | ❌ |
|-------|---------|----|----|
| Sin token / Token inválido | 13 | 13 | 0 |
| Investigador vigente | 10 | 10 | 0 |
| Admin | 11 | 11 | 0 |
| Superadmin | 9 | 9 | 0 |
| Usuario inactivo / Investigador expirado | 2 | 2 | 0 |
| Endpoints de detalle | 6 | 6 | 0 |
| Paginación y filtros | 14 | 14 | 0 |
| Seguridad contraseñas | 4 | 4 | 0 |
| **TOTAL** | **69** | **69** | **0** |

---

## Archivos `.spec.ts` pendientes de implementar

1. `src/modules/auth/services/auth.service.spec.ts`
2. `src/modules/auth/services/solicitudes.service.spec.ts`
3. `src/modules/auth/guards/roles.guard.spec.ts`
4. `src/modules/auth/strategies/jwt.strategy.spec.ts`
