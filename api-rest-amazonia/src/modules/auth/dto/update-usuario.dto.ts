import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional, IsString, Length } from 'class-validator';
import { RoleEnum } from 'src/shared/enums/role.enum';

export class UpdateUsuarioDto {
    @ApiPropertyOptional({
        description: 'Nombre completo del usuario',
        type: String,
        example: 'Juan Pérez',
    })
    @IsOptional()
    @IsString({ message: 'nombre debe ser un texto' })
    @Length(2, 150, { message: 'nombre debe tener entre 2 y 150 caracteres' })
    nombre?: string;

    @ApiPropertyOptional({
        description: 'Estado activo del usuario',
        type: Boolean,
        example: true,
    })
    @IsOptional()
    @IsBoolean({ message: 'activo debe ser un booleano' })
    activo?: boolean;

    @ApiPropertyOptional({
        description: 'Rol del usuario. Solo Superadmin puede asignar el rol Superadmin.',
        enum: RoleEnum,
        example: RoleEnum.Admin,
    })
    @IsOptional()
    @IsEnum(RoleEnum, { message: 'rol debe ser un valor válido del enum RoleEnum' })
    rol?: RoleEnum;
}
