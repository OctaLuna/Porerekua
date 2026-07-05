import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { PaginationParamsDto } from 'src/shared/dto/pagination-params.dto';

export class FilterEmpresasDashboardDto extends PaginationParamsDto {
    @ApiPropertyOptional({ description: 'Filtrar por departamento (id_departamento)', example: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    departamento?: number;

    @ApiPropertyOptional({ description: 'Filtrar por forma jurídica (id_forma)', example: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    forma_juridica?: number;

    @ApiPropertyOptional({ description: 'Filtrar por motivo de apoyo (id_motivo)', example: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    motivo?: number;

    @ApiPropertyOptional({ description: 'Filtrar por tipo de apoyo (id_apoyo)', example: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    apoyo?: number;

    @ApiPropertyOptional({ description: 'Filtrar por ODS alineado (id_ods)', example: 13 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    ods?: number;

    @ApiPropertyOptional({ description: 'Búsqueda por nombre de empresa', example: 'Amazona' })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({
        description: 'Ordenamiento: campo:dirección. Campos válidos: nombre, anio_inicio_apoyo',
        example: 'nombre:asc',
    })
    @IsOptional()
    @IsString()
    sort?: string;
}
