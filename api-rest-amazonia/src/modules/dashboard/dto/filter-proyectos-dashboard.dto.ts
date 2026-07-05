import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { PaginationParamsDto } from 'src/shared/dto/pagination-params.dto';

export class FilterProyectosDashboardDto extends PaginationParamsDto {
    @ApiPropertyOptional({
        description: 'Filtrar por área: 1 = Conservación, 2 = Desarrollo de comunidades indígenas',
        example: 1,
        enum: [1, 2],
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(2)
    area?: number;

    @ApiPropertyOptional({ description: 'Filtrar por departamento (id_departamento)', example: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    departamento?: number;

    @ApiPropertyOptional({ description: 'Filtrar por municipio (id_municipio)', example: 49 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    municipio?: number;

    @ApiPropertyOptional({ description: 'Filtrar por comunidad indígena (id_comunidad)', example: 22 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    comunidad?: number;

    @ApiPropertyOptional({ description: 'Filtrar por tipo de proyecto (id_tipo)', example: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    tipo?: number;

    @ApiPropertyOptional({ description: 'Filtrar por tipo de ayuda social (id_ayuda)', example: 2 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    ayuda?: number;

    @ApiPropertyOptional({ description: 'Filtrar por actor local involucrado (id_actor)', example: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    actor?: number;

    @ApiPropertyOptional({
        description: 'true = solo proyectos activos (sin fecha de fin), false = solo proyectos finalizados',
        example: true,
    })
    @IsOptional()
    @Transform(({ value }) => {
        if (value === 'true' || value === true) return true;
        if (value === 'false' || value === false) return false;
        return undefined;
    })
    @IsBoolean()
    activo?: boolean;

    @ApiPropertyOptional({ description: 'Año de inicio mínimo (inclusive)', example: 2020 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1900)
    anio_desde?: number;

    @ApiPropertyOptional({ description: 'Año de inicio máximo (inclusive)', example: 2025 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1900)
    anio_hasta?: number;

    @ApiPropertyOptional({ description: 'Búsqueda por nombre de proyecto', example: 'jaguar' })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({
        description: 'Ordenamiento: campo:dirección. Campos válidos: nombre, anio_inicio, id_proyecto',
        example: 'anio_inicio:desc',
    })
    @IsOptional()
    @IsString()
    sort?: string;
}
