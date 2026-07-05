import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Usuario } from 'src/modules/auth/entities/usuario.entity';

@Entity('logs_auditoria')
export class LogAuditoria {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 20 })
    tipo: 'aplicacion' | 'seguridad';

    @Column({ type: 'varchar', length: 10 })
    severidad: 'info' | 'warn' | 'error' | 'critico';

    @Column({ name: 'usuario_id', type: 'int', nullable: true })
    usuarioId: number | null;

    @Column({ type: 'varchar', length: 200 })
    accion: string;

    @Column({ type: 'jsonb', nullable: true })
    detalle: object | null;

    @Column({ name: 'ip_origen', type: 'varchar', length: 45, nullable: true })
    ipOrigen: string | null;

    @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
    createdAt: Date;

    @ManyToOne(() => Usuario, { nullable: true })
    @JoinColumn({ name: 'usuario_id' })
    usuario: Usuario | null;
}
