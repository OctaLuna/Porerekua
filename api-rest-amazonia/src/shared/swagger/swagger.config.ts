import { DocumentBuilder } from '@nestjs/swagger';

/**
 * Configuración canónica de OpenAPI/Swagger, compartida entre `main.ts`
 * (Swagger UI) y `scripts/export-openapi.ts` (genera docs/openapi.json).
 */
export function buildSwaggerConfig() {
    return new DocumentBuilder()
        .setTitle('Kaa Iya — Backend API')
        .setDescription(
            'API REST de la plataforma **Kaa Iya** ("Espíritu del Bosque"), para gestionar y visibilizar iniciativas sostenibles en la Amazonía boliviana.\n\n' +
            '**Base URL:** `/api`\n\n' +
            '**Autenticación:** Bearer JWT. Obtén tu token en `POST /auth/login` e inclúyelo en todas las peticiones protegidas: `Authorization: Bearer <token>`',
        )
        .setVersion('1.0.0')
        .setContact('Equipo Kaa Iya — UCB San Pablo', 'https://www.ucb.edu.bo', 'catedra.amazonia@ucb.edu.bo')
        .setLicense('UNLICENSED', '')
        .addServer('http://localhost:3333', 'Local development')
        .addServer('https://kaaiya-backend.onrender.com', 'Producción (Render/Railway — ajustar al dominio real)')
        .addBearerAuth(
            {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                description: 'Ingresa el token JWT obtenido de POST /auth/login',
            },
            'access-token',
        )
        .addTag(
            'Health',
            'Probes de estado del servicio: `GET /health` (liveness) y `GET /health/ready` (readiness: BD + GeoRef).',
        )
        .addTag(
            'Auth — Público',
            'Endpoints accesibles sin autenticación.\n\n' +
            'Usar para iniciar sesión (`POST /auth/login`) o solicitar acceso como investigador (`POST /auth/solicitar-acceso`).\n\n' +
            'El token JWT devuelto en `/auth/login` debe incluirse en todas las peticiones posteriores como:\n`Authorization: Bearer <token>`\n\n' +
            '**Rate limiting:** los endpoints de autenticación tienen límite por IP para prevenir ataques de fuerza bruta.',
        )
        .addTag(
            'Auth — Usuario Autenticado',
            'Endpoints disponibles para cualquier usuario con sesión activa, independientemente del rol.\n\n' +
            '**Requieren header:** `Authorization: Bearer <token>`\n\n' +
            'Devuelven `401` si el token está ausente, expirado o es inválido.\n\n' +
            '**Roles que pueden acceder:** Superadmin, Admin, Investigador.',
        )
        .addTag(
            'Auth — Admin',
            'Endpoints de gestión exclusivos para administradores (rol Admin o Superadmin).\n\n' +
            'Devuelven `403` para cualquier rol que no sea Admin o Superadmin.\n\n' +
            '⚠️ `DELETE /auth/usuarios/:id` requiere rol **Superadmin** exclusivamente.',
        )
        .addTag(
            'Catálogos',
            'Datos maestros para construir los formularios (áreas, apoyos, ayudas, motivos, ODS, tipos, etc.). ' +
            'Los endpoints `/forms` devuelven solo entradas predefinidas (`esPropio=false`).',
        )
        .addTag(
            'Dashboard',
            'Endpoints de solo lectura con métricas agregadas y listados filtrados de proyectos amazónicos.\n\n' +
            '**Flujo recomendado:** `GET /dashboard/filtros-disponibles` → `GET /dashboard/resumen` → ' +
            '`GET /dashboard/proyectos` (con filtros) → gráficos con `/por-region`, `/por-tipo`, `/timeline`.\n\n' +
            '**Caché:** todos los endpoints tienen caché en memoria; los datos se refrescan automáticamente vía triggers en PostgreSQL.',
        )
        .build();
}
