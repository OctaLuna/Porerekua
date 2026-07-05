import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, timeout, TimeoutError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';
import { MyConfigService } from 'src/infrastructure/config/config.service';
import { GeoRefHealthResponse, GeoRefRequest, GeoRefResponse } from './georef.dto';

@Injectable()
export class GeorefService {
    private readonly logger = new Logger(GeorefService.name);

    constructor(
        private readonly httpService: HttpService,
        private readonly config: MyConfigService,
    ) {}

    async resolveCoordinates(req: GeoRefRequest): Promise<GeoRefResponse | null> {
        const url = this.config.get<string>('GEOREF_URL');
        const timeoutMs = this.config.get<number>('GEOREF_TIMEOUT_MS');
        try {
            return await firstValueFrom(
                this.httpService.post<GeoRefResponse>(`${url}/geo/pip`, req).pipe(
                    timeout(timeoutMs),
                    map((res) => res.data),
                    catchError((err) => {
                        const isTimeout = err instanceof TimeoutError || err?.name === 'TimeoutError';
                        this.logger.warn(
                            isTimeout
                                ? `GeoRef timeout after ${timeoutMs}ms for (${req.lat}, ${req.lng})`
                                : `GeoRef error for (${req.lat}, ${req.lng}): ${err.message}`,
                        );
                        return of(null);
                    }),
                ),
            );
        } catch (err) {
            this.logger.warn(`GeoRef unavailable: ${err.message}`);
            return null;
        }
    }

    async checkHealth(): Promise<GeoRefHealthResponse | null> {
        const url = this.config.get<string>('GEOREF_URL');
        try {
            return await firstValueFrom(
                this.httpService.get<GeoRefHealthResponse>(`${url}/geo/health`).pipe(
                    map((res) => res.data),
                    catchError(() => of(null)),
                ),
            );
        } catch {
            return null;
        }
    }
}
