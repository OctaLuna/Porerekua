import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseCreated } from 'src/infrastructure/database/base.entity';
import { Publicacion } from './publicacion.entity';

@Entity('publicacion_imagenes')
export class PublicacionImagen extends BaseCreated {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'id_publicacion', type: 'uuid' })
    idPublicacion: string;

    @Column({ type: 'text' })
    url: string;

    @Column({ type: 'text' })
    path: string;

    @Column({ type: 'text', nullable: true })
    descripcion: string | null;

    @Column({ type: 'int', default: 0 })
    orden: number;

    @ManyToOne(() => Publicacion, (p) => p.imagenes, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id_publicacion' })
    publicacion: Publicacion;
}
