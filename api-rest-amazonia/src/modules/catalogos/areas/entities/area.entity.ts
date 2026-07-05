import { Proyecto } from "src/modules/gestion-proyectos/proyectos/entities/proyecto.entity";
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";

@Entity('areas')
export class Area {
    @PrimaryGeneratedColumn({ name: 'id_area' })
    id: number;

    @Column({ name: 'nombre', type: 'varchar', length: 100, nullable: false })
    nombre: string;

    @OneToMany(() => Proyecto,(proyecto) => proyecto.area)
    proyectos: Proyecto[]
}