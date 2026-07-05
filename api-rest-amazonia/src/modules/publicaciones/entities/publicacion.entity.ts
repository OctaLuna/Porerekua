import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany,
    JoinColumn,
} from 'typeorm';
import { Usuario } from 'src/modules/auth/entities/usuario.entity';
import { PublicacionImagen } from './publicacion-imagen.entity';

@Entity('publicaciones')
export class Publicacion {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'autor_id', type: 'int' })
    autorId: number;

    @Column({ type: 'varchar', length: 500 })
    titulo: string;

    @Column({ type: 'varchar', length: 600, unique: true })
    slug: string;

    @Column({ type: 'jsonb', default: [] })
    contenido: object[];

    @Column({ type: 'varchar', length: 20, default: 'borrador' })
    estado: 'borrador' | 'publicado';

    @Column({ name: 'fecha_creacion', type: 'timestamptz', default: () => 'NOW()' })
    fechaCreacion: Date;

    @Column({ name: 'fecha_ultima_edicion', type: 'timestamptz', nullable: true })
    fechaUltimaEdicion: Date | null;

    @Column({ name: 'fecha_publicacion', type: 'timestamptz', nullable: true })
    fechaPublicacion: Date | null;

    @Column({ name: 'editado_por', type: 'int', nullable: true })
    editadoPorId: number | null;

    @ManyToOne(() => Usuario, { nullable: false })
    @JoinColumn({ name: 'autor_id' })
    autor: Usuario;

    @ManyToOne(() => Usuario, { nullable: true })
    @JoinColumn({ name: 'editado_por' })
    editadoPor: Usuario | null;

    @OneToMany(() => PublicacionImagen, (img) => img.publicacion, { cascade: true })
    imagenes: PublicacionImagen[];
}
