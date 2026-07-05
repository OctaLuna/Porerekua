import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class RechazarSolicitudDto {
    @ApiPropertyOptional({
        description: 'Nota explicando el motivo del rechazo',
        type: String,
        example: 'El propósito no está alineado con los objetivos de la plataforma.',
    })
    @IsOptional()
    @IsString({ message: 'notaRechazo debe ser un texto' })
    @MaxLength(500, { message: 'notaRechazo no puede superar 500 caracteres' })
    notaRechazo?: string;
}
