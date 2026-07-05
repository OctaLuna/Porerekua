import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class CrearSolicitudDto {
    @ApiProperty({
        description: 'Nombre completo del solicitante',
        type: String,
        example: 'María García',
    })
    @IsString({ message: 'nombreSolicitante debe ser un texto' })
    @IsNotEmpty({ message: 'nombreSolicitante es obligatorio' })
    @Length(2, 150, { message: 'nombreSolicitante debe tener entre 2 y 150 caracteres' })
    nombreSolicitante: string;

    @ApiProperty({
        description: 'Correo electrónico del solicitante',
        type: String,
        example: 'maria.garcia@universidad.bo',
    })
    @IsEmail({}, { message: 'emailSolicitante debe ser un correo electrónico válido' })
    @IsNotEmpty({ message: 'emailSolicitante es obligatorio' })
    emailSolicitante: string;

    @ApiProperty({
        description: 'Institución a la que pertenece el solicitante',
        type: String,
        example: 'Universidad Mayor de San Andrés',
    })
    @IsString({ message: 'institucion debe ser un texto' })
    @IsNotEmpty({ message: 'institucion es obligatorio' })
    @Length(2, 255, { message: 'institucion debe tener entre 2 y 255 caracteres' })
    institucion: string;

    @ApiProperty({
        description: 'Propósito de la investigación (mínimo 20 caracteres)',
        type: String,
        example: 'Investigación sobre biodiversidad amazónica para tesis doctoral en Biología.',
    })
    @IsString({ message: 'proposito debe ser un texto' })
    @IsNotEmpty({ message: 'proposito es obligatorio' })
    @Length(20, 1000, { message: 'proposito debe tener entre 20 y 1000 caracteres' })
    proposito: string;
}
