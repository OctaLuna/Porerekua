import { getCorsOptions } from './cors.config';

describe('getCorsOptions (AUDIT-001)', () => {
    it('con wildcard NO debe habilitar credentials ni reflejar el origen', () => {
        const opts = getCorsOptions('*');
        expect(opts.origin).toBe('*');
        expect(opts.credentials).toBe(false);
    });

    it('con lista blanca permite credentials y acepta orígenes listados', () => {
        const opts = getCorsOptions('https://kaaiya.bo, https://app.kaaiya.bo');
        expect(opts.credentials).toBe(true);
        const origin = opts.origin as (
            o: string | undefined,
            cb: (err: Error | null, allow?: boolean) => void,
        ) => void;

        const allow = jest.fn();
        origin('https://kaaiya.bo', allow);
        expect(allow).toHaveBeenCalledWith(null, true);
    });

    it('rechaza un origen no incluido en la lista blanca', () => {
        const opts = getCorsOptions('https://kaaiya.bo');
        const origin = opts.origin as (
            o: string | undefined,
            cb: (err: Error | null, allow?: boolean) => void,
        ) => void;

        const cb = jest.fn();
        origin('https://evil.com', cb);
        expect(cb).toHaveBeenCalledWith(expect.any(Error), false);
    });

    it('permite peticiones sin Origin (server-to-server / curl)', () => {
        const opts = getCorsOptions('https://kaaiya.bo');
        const origin = opts.origin as (
            o: string | undefined,
            cb: (err: Error | null, allow?: boolean) => void,
        ) => void;

        const cb = jest.fn();
        origin(undefined, cb);
        expect(cb).toHaveBeenCalledWith(null, true);
    });
});
