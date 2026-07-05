import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationParamsDto } from 'src/shared/dto/pagination-params.dto';
import { RoleEnum } from 'src/shared/enums/role.enum';

export class FilterUsuariosDto extends PaginationParamsDto {
    @ApiPropertyOptional({
        description: 'Filtrar por rol. 1=Superadmin, 2=Admin, 3=Investigador',
        enum: RoleEnum,
        example: RoleEnum.Investigador,
    })
    @IsOptional()
    @Type(() => Number)
    @IsEnum(RoleEnum, { message: "El parámetro 'rol' debe ser 1, 2 o 3" })
    rol?: RoleEnum;

    @ApiPropertyOptional({
        description: 'Filtrar por estado activo. true=activos, false=inactivos',
        type: Boolean,
        example: true,
    })
    @IsOptional()
    @Transform(({ value }) => {
        if (value === 'true') return true;
        if (value === 'false') return false;
        return value;
    })
    @IsBoolean({ message: "El parámetro 'activo' debe ser true o false" })
    activo?: boolean;

    @ApiPropertyOptional({
        description: 'Buscar por nombre o email (búsqueda parcial, insensible a mayúsculas)',
        type: String,
        example: 'María',
        maxLength: 100,
    })
    @IsOptional()
    @IsString({ message: "El parámetro 'search' debe ser un texto" })
    @MaxLength(100, { message: "El parámetro 'search' no puede superar 100 caracteres" })
    search?: string;
}
