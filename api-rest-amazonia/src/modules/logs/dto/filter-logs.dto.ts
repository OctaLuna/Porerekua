import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';
import { PaginationParamsDto } from 'src/shared/dto/pagination-params.dto';

export class FilterLogsDto extends PaginationParamsDto {
    @ApiPropertyOptional({
        description: 'Filtrar por categoría de log',
        enum: ['aplicacion', 'seguridad'],
    })
    @IsOptional()
    @IsIn(['aplicacion', 'seguridad'])
    tipo?: 'aplicacion' | 'seguridad';

    @ApiPropertyOptional({
        description: 'Filtrar por nivel de severidad',
        enum: ['info', 'warn', 'error', 'critico'],
    })
    @IsOptional()
    @IsIn(['info', 'warn', 'error', 'critico'])
    severidad?: 'info' | 'warn' | 'error' | 'critico';

    @ApiPropertyOptional({
        description: 'Filtrar por id del usuario que generó el evento',
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    usuario_id?: number;

    @ApiPropertyOptional({
        description: 'Fecha de inicio del rango (ISO 8601, ej: 2026-01-01)',
        example: '2026-01-01',
    })
    @IsOptional()
    @IsDateString()
    fecha_desde?: string;

    @ApiPropertyOptional({
        description: 'Fecha de fin del rango (ISO 8601, ej: 2026-12-31)',
        example: '2026-12-31',
    })
    @IsOptional()
    @IsDateString()
    fecha_hasta?: string;

    declare limit: number;
}
