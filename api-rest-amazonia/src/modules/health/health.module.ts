import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { GeorefModule } from 'src/modules/georef/georef.module';

@Module({
	imports: [GeorefModule],
	controllers: [HealthController],
})
export class HealthModule { }
