import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Length } from 'class-validator';

export class UpdatePerfilPropioDto {
    @ApiPropertyOptional({
        description: 'Nombre completo del usuario. Único campo editable desde el perfil propio.',
        type: String,
        example: 'María García',
        minLength: 2,
        maxLength: 150,
    })
    @IsOptional()
    @IsString({ message: 'nombre debe ser un texto' })
    @Length(2, 150, { message: 'nombre debe tener entre 2 y 150 caracteres' })
    nombre?: string;
}
