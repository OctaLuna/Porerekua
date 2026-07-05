// src/config/cors.config.ts
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

export function getCorsOptions(allowedOrigins: string): CorsOptions {
    // AUDIT-001: nunca combinar reflexión de origen con `credentials: true`.
    // Con wildcard se devuelve `origin: '*'` y se DESACTIVAN las credenciales
    // (el navegador prohíbe `Access-Control-Allow-Origin: *` + credenciales).
    // Para permitir credenciales hay que declarar una lista blanca explícita
    // en `DOMAIN_FRONTEND` (separada por comas).
    if (allowedOrigins === '*') {
        return {
            origin: '*',
            methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
            credentials: false,
        };
    }

    const origins = allowedOrigins.split(',').map(o => o.trim()).filter(Boolean);
    return {
        origin: (origin, callback) => {
            if (!origin || origins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'), false);
            }
        },
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true,
    };
}
