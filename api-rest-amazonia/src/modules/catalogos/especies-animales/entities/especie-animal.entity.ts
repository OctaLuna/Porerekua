import { ConservacionAnimal } from "src/modules/gestion-conservacion/conservacion-animales/entities/conservacion-animal.entity";
import { Proyecto } from "src/modules/gestion-proyectos/proyectos/entities/proyecto.entity";
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany } from "typeorm";

@Entity('especies_animales')
export class EspecieAnimal {
    @PrimaryGeneratedColumn({ name: 'id_especie' })
    id: number;

    @Column({ name: 'nombre', type: 'varchar', length: 100 })
    nombre: string;

    @Column({ name: 'es_propio', type: 'boolean', default: true })
    esPropio: boolean;

    @OneToMany(() => ConservacionAnimal, (conservacion) => conservacion.especie)
    conservacionAnimales: ConservacionAnimal[];

    @ManyToMany(() => Proyecto,(proyecto) => proyecto.especiesAnimales)
    proyectos: Proyecto
}