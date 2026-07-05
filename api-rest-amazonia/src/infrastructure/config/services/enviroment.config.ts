import { EnviromentEnum } from "src/shared/enums/enviroment.enum";

export const environmentConfig = {
    [EnviromentEnum.PRODUCTION]: {
        logger: ['error'],
        // Swagger habilitado en producción para que el frontend consulte el
        // contrato de la API (/api/documentation). Los endpoints sensibles
        // siguen protegidos por JWT.
        swagger: true,
    },
    [EnviromentEnum.DEVELOPMENT]: {
        logger: ['error', 'warn', 'log'],
        swagger: true,
    },
    [EnviromentEnum.TEST]: {
        logger: ['error'],
        swagger: true,
    },
    [EnviromentEnum.DEBUG]: {
        logger: ['error', 'warn', 'log', 'debug'],
        swagger: true,
    },
};
