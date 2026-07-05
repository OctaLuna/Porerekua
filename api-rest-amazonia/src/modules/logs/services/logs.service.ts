import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LogAuditoria } from '../entities/log-auditoria.entity';
import { FilterLogsDto } from '../dto/filter-logs.dto';
import { PaginationResponseDto } from 'src/shared/dto/pagination-response.dto';
import { buildPagination } from 'src/shared/utils/pagination.util';

export interface RegistrarLogDto {
    tipo: 'aplicacion' | 'seguridad';
    severidad: 'info' | 'warn' | 'error' | 'critico';
    accion: string;
    usuarioId?: number | null;
    detalle?: object | null;
    ipOrigen?: string | null;
}

@Injectable()
export class LogsService {
    private readonly logger = new Logger(LogsService.name);

    constructor(
        @InjectRepository(LogAuditoria)
        private readonly logRepo: Repository<LogAuditoria>,
    ) {}

    registrar(dto: RegistrarLogDto): void {
        // Fire-and-forget: no bloquea el request ni propaga errores al llamador
        setImmediate(() => {
            this.logRepo
                .save(
                    this.logRepo.create({
                        tipo: dto.tipo,
                        severidad: dto.severidad,
                        accion: dto.accion,
                        usuarioId: dto.usuarioId ?? null,
                        detalle: dto.detalle ?? null,
                        ipOrigen: dto.ipOrigen ?? null,
                    }),
                )
                .catch((err) => {
                    this.logger.error(`Error al persistir log [${dto.accion}]: ${err.message}`);
                });
        });
    }

    async findAll(params: FilterLogsDto): Promise<PaginationResponseDto<LogAuditoria>> {
        const { page, limit, tipo, severidad, usuario_id, fecha_desde, fecha_hasta } = params;

        const qb = this.logRepo
            .createQueryBuilder('l')
            .orderBy('l.createdAt', 'DESC');

        if (tipo) qb.andWhere('l.tipo = :tipo', { tipo });
        if (severidad) qb.andWhere('l.severidad = :severidad', { severidad });
        if (usuario_id) qb.andWhere('l.usuario_id = :uid', { uid: usuario_id });
        if (fecha_desde) qb.andWhere('l.created_at >= :desde', { desde: new Date(fecha_desde) });
        if (fecha_hasta) {
            const hasta = new Date(fecha_hasta);
            hasta.setHours(23, 59, 59, 999);
            qb.andWhere('l.created_at <= :hasta', { hasta });
        }

        const limitActual = Math.min(limit ?? 50, 200);

        const [data, total] = await qb
            .skip((page - 1) * limitActual)
            .take(limitActual)
            .getManyAndCount();

        return buildPagination(data, total, page, limitActual);
    }
}
