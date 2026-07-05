import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { GeorefService } from './georef.service';
import { MyConfigService } from 'src/infrastructure/config/config.service';

@Module({
    imports: [
        HttpModule.registerAsync({
            inject: [MyConfigService],
            useFactory: (config: MyConfigService) => ({
                timeout: config.get<number>('GEOREF_TIMEOUT_MS'),
                baseURL: config.get<string>('GEOREF_URL'),
            }),
        }),
    ],
    providers: [GeorefService],
    exports: [GeorefService],
})
export class GeorefModule {}
