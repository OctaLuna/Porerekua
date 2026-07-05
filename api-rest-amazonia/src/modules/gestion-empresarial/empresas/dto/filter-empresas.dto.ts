import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { PaginationParamsDto } from 'src/shared/dto/pagination-params.dto';

export class FilterEmpresasDto extends PaginationParamsDto {
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
        description: 'Filtrar por ID de forma jurídica',
        type: Number,
        example: 1,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: "El parámetro 'forma_juridica' debe ser un número entero" })
    @Min(1, { message: "El parámetro 'forma_juridica' debe ser mayor o igual a 1" })
    forma_juridica?: number;

    @ApiPropertyOptional({
        description: 'Buscar por nombre de empresa (búsqueda parcial, insensible a mayúsculas)',
        type: String,
        example: 'Amazonia',
    })
    @IsOptional()
    @IsString({ message: "El parámetro 'search' debe ser un texto" })
    @MaxLength(100, { message: "El parámetro 'search' no puede superar 100 caracteres" })
    search?: string;

    @ApiPropertyOptional({
        description: "Ordenar resultados. Formato: 'campo:asc' o 'campo:desc'. Campos válidos: nombre, anioInicioApoyo",
        type: String,
        example: 'nombre:asc',
    })
    @IsOptional()
    @IsIn(['nombre:asc', 'nombre:desc', 'anioInicioApoyo:asc', 'anioInicioApoyo:desc'], {
        message: "El parámetro 'sort' debe ser uno de: nombre:asc, nombre:desc, anioInicioApoyo:asc, anioInicioApoyo:desc",
    })
    sort?: string;
}
