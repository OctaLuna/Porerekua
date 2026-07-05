import { Logger } from "@nestjs/common";
import { EnviromentEnum } from "src/shared/enums/enviroment.enum";
import { MyServerConfigInterface } from "./server.config";

const logger = new Logger('Bootstrap');

export function logServerStatus(config: MyServerConfigInterface) {
    let color: string;
    let envName: string;

    switch (config.nodeEnv) {
        case EnviromentEnum.PRODUCTION:
            color = '\x1b[31m'; // rojo
            envName = EnviromentEnum.PRODUCTION.toUpperCase();
            break;
        case EnviromentEnum.DEVELOPMENT:
            color = '\x1b[32m'; // verde
            envName = EnviromentEnum.DEVELOPMENT.toUpperCase();
            break;
        case EnviromentEnum.TEST:
            color = '\x1b[33m'; // amarillo
            envName = EnviromentEnum.TEST.toUpperCase();
            break;
        case EnviromentEnum.DEBUG:
            color = '\x1b[34m'; // azul
            envName = EnviromentEnum.DEBUG.toUpperCase();
            break;
        default:
            color = '\x1b[32m'; // verde
            envName = EnviromentEnum.DEVELOPMENT.toUpperCase();
            break;
    }

    const reset = '\x1b[0m';

    // AUDIT-010: usar el Logger de Nest en lugar de console.log.
    logger.log(
        '\n' +
        '=========================================\n' +
        '   ☕️  AMAZONIA - Server Status\n' +
        '-----------------------------------------\n' +
        '   🚀 Application is running\n' +
        `   🌍 Environment : ${color}${envName}${reset}\n` +
        `   📡 Port        : ${color}${config.port}${reset}\n` +
        `   🔗 API Prefix  : ${color}/api${reset}\n` +
        '=========================================',
    );
}