import { Controller, Get, HttpCode, HttpStatus, ServiceUnavailableException } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiOkResponse, ApiServiceUnavailableResponse } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { GeorefService } from 'src/modules/georef/georef.service';

@ApiTags('Health')
@SkipThrottle()
@Controller('health')
export class HealthController {
    private readonly startedAt = Date.now();

    constructor(
        @InjectDataSource() private readonly dataSource: DataSource,
        private readonly georefService: GeorefService,
    ) {}

    @Get()
    @ApiOperation({
        summary: 'Liveness probe',
        description:
            '🔓 Público. Indica que el proceso está vivo y respondiendo. No consulta dependencias. ' +
            'Usar como `healthCheckPath` en Render/Railway.',
    })
    @ApiOkResponse({ description: 'El servicio está corriendo.' })
    liveness() {
        return {
            status: 'ok',
            service: 'kaaiya-backend',
            timestamp: new Date().toISOString(),
            uptimeSeconds: Math.floor((Date.now() - this.startedAt) / 1000),
        };
    }

    @Get('ready')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Readiness probe',
        description:
            '🔓 Público. Verifica dependencias: base de datos (obligatoria) y microservicio GeoRef ' +
            '(opcional — su caída no marca el servicio como no listo, solo se reporta `degraded`). ' +
            'Devuelve `503` solo si la base de datos no responde.',
    })
    @ApiOkResponse({ description: 'BD operativa (georef puede estar degradado).' })
    @ApiServiceUnavailableResponse({ description: 'La base de datos no responde.' })
    async readiness() {
        let db: 'up' | 'down' = 'down';
        try {
            await this.dataSource.query('SELECT 1');
            db = 'up';
        } catch {
            db = 'down';
        }

        const georefHealth = await this.georefService.checkHealth();
        const georef = georefHealth ? 'up' : 'down';

        const status = db === 'up' ? (georef === 'up' ? 'ok' : 'degraded') : 'unavailable';

        const body = { status, db, georef, timestamp: new Date().toISOString() };

        if (db === 'down') {
            throw new ServiceUnavailableException(body);
        }
        return body;
    }
}
