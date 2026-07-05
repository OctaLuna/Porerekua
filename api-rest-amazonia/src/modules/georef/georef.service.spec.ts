import { of, throwError, TimeoutError } from 'rxjs';
import { GeorefService } from './georef.service';

describe('GeorefService (degradación elegante)', () => {
    const config = {
        get: (k: string) => (k === 'GEOREF_URL' ? 'http://127.0.0.1:8001' : 5000),
    } as any;

    it('resolveCoordinates devuelve la región cuando GeoRef responde', async () => {
        const http = {
            post: jest.fn().mockReturnValue(
                of({ data: { found: true, department: 'Santa Cruz', municipality: 'Andrés Ibáñez', country: 'Bolivia' } }),
            ),
        } as any;
        const service = new GeorefService(http, config);
        const r = await service.resolveCoordinates({ lat: -17.78, lng: -63.18 });
        expect(http.post).toHaveBeenCalledWith('http://127.0.0.1:8001/geo/pip', { lat: -17.78, lng: -63.18 });
        expect(r).toMatchObject({ found: true, department: 'Santa Cruz' });
    });

    it('resolveCoordinates devuelve null si GeoRef falla (no lanza)', async () => {
        const http = { post: jest.fn().mockReturnValue(throwError(() => new Error('ECONNREFUSED'))) } as any;
        const service = new GeorefService(http, config);
        await expect(service.resolveCoordinates({ lat: -17.78, lng: -63.18 })).resolves.toBeNull();
    });

    it('resolveCoordinates devuelve null ante timeout', async () => {
        const http = { post: jest.fn().mockReturnValue(throwError(() => new TimeoutError())) } as any;
        const service = new GeorefService(http, config);
        await expect(service.resolveCoordinates({ lat: -17.78, lng: -63.18 })).resolves.toBeNull();
    });

    it('checkHealth devuelve null si el microservicio no responde', async () => {
        const http = { get: jest.fn().mockReturnValue(throwError(() => new Error('down'))) } as any;
        const service = new GeorefService(http, config);
        await expect(service.checkHealth()).resolves.toBeNull();
    });

    it('checkHealth devuelve el estado cuando responde', async () => {
        const http = { get: jest.fn().mockReturnValue(of({ data: { status: 'ok', features_loaded: 112 } })) } as any;
        const service = new GeorefService(http, config);
        await expect(service.checkHealth()).resolves.toMatchObject({ status: 'ok' });
    });
});
