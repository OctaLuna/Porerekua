import { Proyecto } from "src/modules/gestion-proyectos/proyectos/entities/proyecto.entity";
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";

@Entity('tipos_proyectos')
export class TipoProyecto {
    @PrimaryGeneratedColumn({ name: 'id_tipo' })
    id: number;

    @Column({ name: 'nombre', type: 'varchar', length: 200, nullable: false, unique: true })
    nombre: string;

    @Column({ name: 'es_propio', type: 'boolean', nullable: false, default: true })
    esPropio: boolean;

    @OneToMany(() => Proyecto, (proyecto) => proyecto.tipo)
    proyectos: Proyecto[];
}