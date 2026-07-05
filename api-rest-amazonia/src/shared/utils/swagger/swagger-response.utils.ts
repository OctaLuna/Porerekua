import { CommonResponseDto } from "src/shared/dto/common-response.dto";
import { ValidationExceptionDto } from "src/shared/dto/validation-exception.dto";


export const SwaggerBadRequestCommon = () => {
    return {
        description: 'Respuesta en caso de parametros invalidos',
        type: ValidationExceptionDto
    };
}

export const SwaggerNotFoundCommon = () => {
    return {
        description: 'Respuesta en caso de no encontrar un recurso',
        type: CommonResponseDto
    }
}

export const SwaggerConflictCommon = () => {
    return {
        description: 'Respuesta en caso de un conflicto entre datos repetidos',
        type: CommonResponseDto
    }
}

export const SwaggerUnauthorizedCommon = () => {
    return {
        description: 'Token inválido, expirado o no proporcionado',
        type: CommonResponseDto
    }
}

export const SwaggerForbiddenCommon = () => {
    return {
        description: 'El usuario no tiene el rol necesario para este recurso',
        type: CommonResponseDto
    }
}

export const SwaggerTooManyRequestsCommon = () => {
    return {
        description: 'Demasiadas solicitudes desde esta IP. Espera antes de reintentar.',
        type: CommonResponseDto
    }
}