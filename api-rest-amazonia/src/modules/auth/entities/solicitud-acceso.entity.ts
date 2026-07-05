import { Entity, PrimaryGeneratedColumn, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseCreated } from 'src/infrastructure/database/base.entity';
import { Usuario } from './usuario.entity';

export enum EstadoSolicitudEnum {
    Pendiente = 'pendiente',
    Aprobada = 'aprobada',
    Rechazada = 'rechazada',
}

@Entity('solicitudes_acceso')
export class SolicitudAcceso extends BaseCreated {

    @PrimaryGeneratedColumn({ name: 'id_solicitud' })
    id: number;

    @Column({ name: 'nombre_solicitante', type: 'varchar', length: 150, nullable: false })
    nombreSolicitante: string;

    @Index('idx_solicitudes_email')
    @Column({ name: 'email_solicitante', type: 'varchar', length: 255, nullable: false })
    emailSolicitante: string;

    @Column({ name: 'institucion', type: 'varchar', length: 255, nullable: false })
    institucion: string;

    @Column({ name: 'proposito', type: 'text', nullable: false })
    proposito: string;

    @Index('idx_solicitudes_estado')
    @Column({
        name: 'estado',
        type: 'enum',
        enum: EstadoSolicitudEnum,
        default: EstadoSolicitudEnum.Pendiente,
    })
    estado: EstadoSolicitudEnum;

    @Column({ name: 'fecha_expiracion_acceso', type: 'timestamp', nullable: true })
    fechaExpiracionAcceso: Date | null;

    @Column({ name: 'id_revisor', type: 'int', nullable: true })
    idRevisor: number | null;

    @ManyToOne(() => Usuario, (u) => u.solicitudesRevisadas, { nullable: true })
    @JoinColumn({ name: 'id_revisor' })
    revisor: Usuario | null;

    @Column({ name: 'id_usuario_creado', type: 'int', nullable: true })
    idUsuarioCreado: number | null;

    @Column({ name: 'nota_rechazo', type: 'text', nullable: true })
    notaRechazo: string | null;

    @Column({ name: 'fecha_revision', type: 'timestamp', nullable: true })
    fechaRevision: Date | null;
}
