import { Entity, PrimaryGeneratedColumn, Column, Index, OneToMany } from 'typeorm';
import { BaseCreatedUpdated } from 'src/infrastructure/database/base.entity';
import { RoleEnum } from 'src/shared/enums/role.enum';
import { SolicitudAcceso } from './solicitud-acceso.entity';

@Entity('usuarios')
export class Usuario extends BaseCreatedUpdated {

    @PrimaryGeneratedColumn({ name: 'id_usuario' })
    id: number;

    @Index('idx_usuarios_email')
    @Column({ name: 'email', type: 'varchar', length: 255, nullable: false, unique: true })
    email: string;

    @Column({ name: 'password_hash', type: 'varchar', length: 255, nullable: false, select: false })
    passwordHash: string;

    @Column({ name: 'nombre', type: 'varchar', length: 150, nullable: false })
    nombre: string;

    @Index('idx_usuarios_rol')
    @Column({ name: 'rol', type: 'int', nullable: false })
    rol: RoleEnum;

    @Column({ name: 'activo', type: 'boolean', nullable: false, default: true })
    activo: boolean;

    @Column({ name: 'fecha_expiracion', type: 'timestamp', nullable: true })
    fechaExpiracion: Date | null;

    // Timestamp mínimo que debe tener el iat del token para ser válido.
    // Se actualiza al desactivar la cuenta o cambiar contraseña, invalidando tokens anteriores.
    @Column({ name: 'token_valid_from', type: 'timestamp', nullable: true })
    tokenValidFrom: Date | null;

    @OneToMany(() => SolicitudAcceso, (s) => s.revisor)
    solicitudesRevisadas: SolicitudAcceso[];
}
