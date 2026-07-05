import { AyudaProyecto } from "src/modules/gestion-proyectos/ayudas-proyectos/entities/ayuda-proyecto.entity";
import { Proyecto } from "src/modules/gestion-proyectos/proyectos/entities/proyecto.entity";
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany } from "typeorm";

@Entity('ayudas')
export class Ayuda {
    @PrimaryGeneratedColumn({ name: 'id_ayuda' })
    id: number;

    @Column({ name: 'nombre', length: 150 })
    nombre: string;

    @Column({ name: 'es_propio', default: true })
    esPropio: boolean;

    @OneToMany(() => AyudaProyecto, (ayudaProyecto) => ayudaProyecto.ayuda)
    ayudasProyectos: AyudaProyecto[];

    @ManyToMany(() => Proyecto, (proyecto) => proyecto.ayudas)
    proyectos: Proyecto[]
}