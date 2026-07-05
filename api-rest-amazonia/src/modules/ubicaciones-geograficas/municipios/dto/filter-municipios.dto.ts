import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { PaginationParamsDto } from 'src/shared/dto/pagination-params.dto';

export class FilterMunicipiosDto extends PaginationParamsDto {
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
        description: 'Buscar por nombre de municipio (búsqueda parcial, insensible a mayúsculas)',
        type: String,
        example: 'Trinidad',
    })
    @IsOptional()
    @IsString({ message: "El parámetro 'search' debe ser un texto" })
    @MaxLength(100, { message: "El parámetro 'search' no puede superar 100 caracteres" })
    search?: string;
}
