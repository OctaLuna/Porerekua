import { ConservacionAgricola } from "src/modules/gestion-conservacion/conservacion-agricolas/entities/conservacion-agricola.entity";
import { Proyecto } from "src/modules/gestion-proyectos/proyectos/entities/proyecto.entity";
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany } from "typeorm";

@Entity('practicas_agricolas')
export class PracticaAgricola {
    @PrimaryGeneratedColumn({ name: 'id_practica' })
    id: number;

    @Column({ name: 'nombre', type: 'varchar', length: 100, unique: true })
    nombre: string;

    @Column({ name: 'es_propio', type: 'boolean', default: true })
    esPropio: boolean;

    @OneToMany(() => ConservacionAgricola, (conservacion) => conservacion.practica)
    conservacionAgricolas: ConservacionAgricola[];

    @ManyToMany(() => Proyecto,(proyecto) => proyecto.practicasAgricolas)
    proyectos: Proyecto[]
}