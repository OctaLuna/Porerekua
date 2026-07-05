import { EspecieAnimal } from "src/modules/catalogos/especies-animales/entities/especie-animal.entity";
import { Proyecto } from "src/modules/gestion-proyectos/proyectos/entities/proyecto.entity";
import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from "typeorm";

@Entity('conservacion_animales')
export class ConservacionAnimal {
    @PrimaryColumn({ name: 'id_especie' })
    idEspecie: number;

    @PrimaryColumn({ name: 'id_proyecto' })
    idProyecto: number;

    @ManyToOne(() => EspecieAnimal, (especie) => especie.conservacionAnimales)
    @JoinColumn({ name: 'id_especie' })
    especie?: EspecieAnimal;

    @ManyToOne(() => Proyecto, (proyecto) => proyecto.conservacionAnimales)
    @JoinColumn({ name: 'id_proyecto' })
    proyecto?: Proyecto;
}