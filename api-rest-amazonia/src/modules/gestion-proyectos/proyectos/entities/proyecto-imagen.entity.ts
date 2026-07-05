import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseCreated } from 'src/infrastructure/database/base.entity';
import { Proyecto } from './proyecto.entity';

@Entity('proyecto_imagenes')
export class ProyectoImagen extends BaseCreated {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'id_proyecto', type: 'int' })
    idProyecto: number;

    @Column({ type: 'text' })
    url: string;

    @Column({ type: 'text' })
    path: string;

    @Column({ type: 'text', nullable: true })
    descripcion: string | null;

    @Column({ type: 'int', default: 0 })
    orden: number;

    @ManyToOne(() => Proyecto, (p) => p.imagenes, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id_proyecto' })
    proyecto: Proyecto;
}
