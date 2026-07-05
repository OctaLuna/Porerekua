import { Injectable } from "@nestjs/common";
import { MyConfigService } from "../config.service";
import { EnviromentEnum } from "src/shared/enums/enviroment.enum";

export interface MyServerConfigInterface {
    nodeEnv: string
    domainFrontend: string
    port: number
}

@Injectable()
export class MyServerConfig {
    constructor(private readonly config: MyConfigService) { }

    get(): MyServerConfigInterface {
        if (process.env.NODE_ENV === EnviromentEnum.PRODUCTION) {
            return {
                nodeEnv: this.config.get<string>('NODE_ENV'),
                domainFrontend: this.config.get<string>('DOMAIN_FRONTEND'),
                port: this.config.get<number>('PORT'),
            }
        }
        return {
            nodeEnv: this.config.get<string>('NODE_ENV'),
            domainFrontend: this.config.get<string>('DOMAIN_FRONTEND'),
            port: this.config.get<number>('PORT'),
        };
    }
}