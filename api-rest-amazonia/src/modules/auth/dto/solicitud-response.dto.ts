import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EstadoSolicitudEnum } from '../entities/solicitud-acceso.entity';

export class SolicitudResponseDto {
    @ApiProperty({ type: Number, example: 1 })
    id: number;

    @ApiProperty({ type: String, example: 'María García' })
    nombreSolicitante: string;

    @ApiProperty({ type: String, example: 'maria.garcia@universidad.bo' })
    emailSolicitante: string;

    @ApiProperty({ type: String, example: 'Universidad Mayor de San Andrés' })
    institucion: string;

    @ApiProperty({ type: String, example: 'Investigación sobre biodiversidad amazónica...' })
    proposito: string;

    @ApiProperty({ enum: EstadoSolicitudEnum, example: EstadoSolicitudEnum.Pendiente })
    estado: EstadoSolicitudEnum;

    @ApiPropertyOptional({ type: String, nullable: true, example: '2027-06-30T23:59:59.000Z' })
    fechaExpiracionAcceso: Date | null;

    @ApiPropertyOptional({ type: Number, nullable: true, example: 1 })
    idRevisor: number | null;

    @ApiPropertyOptional({ type: Number, nullable: true, example: 5 })
    idUsuarioCreado: number | null;

    @ApiPropertyOptional({ type: String, nullable: true })
    notaRechazo: string | null;

    @ApiPropertyOptional({ type: String, nullable: true })
    fechaRevision: Date | null;

    @ApiProperty({ type: String, example: '2026-06-11T10:00:00.000Z' })
    createdAt: Date;
}
