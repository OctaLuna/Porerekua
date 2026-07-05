import { ValidationPipe, ValidationPipeOptions } from '@nestjs/common';

/**
 * Opciones canónicas del ValidationPipe global (AUDIT-002).
 *
 * - `whitelist`: elimina propiedades no declaradas en el DTO.
 * - `forbidNonWhitelisted`: rechaza con 400 si llegan propiedades desconocidas
 *   (evita mass-assignment a medida que crecen los DTOs).
 * - `transform` + `enableImplicitConversion`: conversión de tipos primitivos
 *   desde query/params (comportamiento previo, preservado).
 */
export const validationPipeOptions: ValidationPipeOptions = {
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: {
        enableImplicitConversion: true,
    },
};

export function buildValidationPipe(): ValidationPipe {
    return new ValidationPipe(validationPipeOptions);
}
