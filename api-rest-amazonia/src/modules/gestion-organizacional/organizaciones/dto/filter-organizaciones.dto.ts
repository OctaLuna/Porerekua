import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { PaginationParamsDto } from 'src/shared/dto/pagination-params.dto';

export class FilterOrganizacionesDto extends PaginationParamsDto {
    @ApiPropertyOptional({
        description: 'Filtrar por ID de departamento',
        type: Number,
        example: 3,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: "El parámetro 'departamento' debe ser un número entero" })
    @Min(1, { message: "El parámetro 'departamento' debe ser mayor o igual a 1" })
    departamento?: number;

    @ApiPropertyOptional({
        description: 'Filtrar por organizaciones nacionales (true) o locales (false)',
        type: Boolean,
        example: true,
    })
    @IsOptional()
    @Transform(({ value }) => {
        if (value === 'true') return true;
        if (value === 'false') return false;
        return value;
    })
    @IsBoolean({ message: "El parámetro 'esNacional' debe ser true o false" })
    esNacional?: boolean;

    @ApiPropertyOptional({
        description: 'Filtrar por ID de tipo de organización',
        type: Number,
        example: 2,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: "El parámetro 'tipo' debe ser un número entero" })
    @Min(1, { message: "El parámetro 'tipo' debe ser mayor o igual a 1" })
    tipo?: number;

    @ApiPropertyOptional({
        description: 'Buscar por nombre de organización (búsqueda parcial, insensible a mayúsculas)',
        type: String,
        example: 'Fundación',
    })
    @IsOptional()
    @IsString({ message: "El parámetro 'search' debe ser un texto" })
    @MaxLength(100, { message: "El parámetro 'search' no puede superar 100 caracteres" })
    search?: string;
}
