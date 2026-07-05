import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsIn, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { PaginationParamsDto } from 'src/shared/dto/pagination-params.dto';
import { AreasEnum } from 'src/shared/enums/areas.enum';

export class FilterProyectosDto extends PaginationParamsDto {
    @ApiPropertyOptional({
        description: 'Filtrar por área: 1 = Conservación, 2 = Desarrollo Comunitario',
        enum: AreasEnum,
        example: AreasEnum.conservacion,
    })
    @IsOptional()
    @Type(() => Number)
    @IsEnum(AreasEnum, { message: "El parámetro 'area' debe ser 1 (conservación) o 2 (desarrollo)" })
    area?: AreasEnum;

    @ApiPropertyOptional({
        description: 'Filtrar por ID de departamento donde opera el proyecto',
        type: Number,
        example: 3,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: "El parámetro 'departamento' debe ser un número entero" })
    @Min(1, { message: "El parámetro 'departamento' debe ser mayor o igual a 1" })
    departamento?: number;

    @ApiPropertyOptional({
        description: 'Filtrar por ID de tipo de proyecto',
        type: Number,
        example: 2,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: "El parámetro 'tipo' debe ser un número entero" })
    @Min(1, { message: "El parámetro 'tipo' debe ser mayor o igual a 1" })
    tipo?: number;

    @ApiPropertyOptional({
        description: 'Filtrar por año de inicio del proyecto',
        type: Number,
        example: 2023,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: "El parámetro 'anio' debe ser un número entero" })
    @Min(1900, { message: "El parámetro 'anio' debe ser un año válido" })
    anio?: number;

    @ApiPropertyOptional({
        description: 'Buscar por nombre de proyecto (búsqueda parcial, insensible a mayúsculas)',
        type: String,
        example: 'Reforestación',
    })
    @IsOptional()
    @IsString({ message: "El parámetro 'search' debe ser un texto" })
    @MaxLength(100, { message: "El parámetro 'search' no puede superar 100 caracteres" })
    search?: string;

    @ApiPropertyOptional({
        description: 'Filtrar por ID de municipio de trabajo del proyecto',
        type: Number,
        example: 10,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: "El parámetro 'municipio' debe ser un número entero" })
    @Min(1, { message: "El parámetro 'municipio' debe ser mayor o igual a 1" })
    municipio?: number;

    @ApiPropertyOptional({
        description: 'Filtrar proyectos que iniciaron desde este año (inclusive)',
        type: Number,
        example: 2020,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: "El parámetro 'anio_desde' debe ser un número entero" })
    @Min(1900, { message: "El parámetro 'anio_desde' debe ser un año válido" })
    anio_desde?: number;

    @ApiPropertyOptional({
        description: 'Filtrar proyectos que terminaron hasta este año (inclusive). Incluye proyectos activos (sin anio_fin)',
        type: Number,
        example: 2024,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: "El parámetro 'anio_hasta' debe ser un número entero" })
    @Min(1900, { message: "El parámetro 'anio_hasta' debe ser un año válido" })
    anio_hasta?: number;

    @ApiPropertyOptional({
        description: "Ordenar resultados. Formato: 'campo:asc' o 'campo:desc'. Campos válidos: nombre, anioInicio",
        type: String,
        example: 'anioInicio:desc',
    })
    @IsOptional()
    @IsIn(['nombre:asc', 'nombre:desc', 'anioInicio:asc', 'anioInicio:desc'], {
        message: "El parámetro 'sort' debe ser uno de: nombre:asc, nombre:desc, anioInicio:asc, anioInicio:desc",
    })
    sort?: string;
}
