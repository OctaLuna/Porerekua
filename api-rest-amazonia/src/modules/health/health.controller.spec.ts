import { ServiceUnavailableException } from '@nestjs/common';
import { HealthController } from './health.controller';

describe('HealthController', () => {
    const makeController = (dbOk: boolean, georefOk: boolean) => {
        const dataSource = {
            query: dbOk ? jest.fn().mockResolvedValue([{ '?column?': 1 }]) : jest.fn().mockRejectedValue(new Error('down')),
        } as any;
        const georef = {
            checkHealth: jest.fn().mockResolvedValue(georefOk ? { status: 'ok', features_loaded: 112 } : null),
        } as any;
        return new HealthController(dataSource, georef);
    };

    it('liveness devuelve status ok sin consultar dependencias', () => {
        const c = makeController(false, false);
        expect(c.liveness()).toMatchObject({ status: 'ok', service: 'kaaiya-backend' });
    });

    it('readiness ok cuando BD y georef están up', async () => {
        const c = makeController(true, true);
        await expect(c.readiness()).resolves.toMatchObject({ status: 'ok', db: 'up', georef: 'up' });
    });

    it('readiness degraded cuando georef está down pero BD up', async () => {
        const c = makeController(true, false);
        await expect(c.readiness()).resolves.toMatchObject({ status: 'degraded', db: 'up', georef: 'down' });
    });

    it('readiness lanza 503 cuando la BD está down', async () => {
        const c = makeController(false, true);
        await expect(c.readiness()).rejects.toBeInstanceOf(ServiceUnavailableException);
    });
});
