import { PracticaAgricola } from "src/modules/catalogos/practicas-agricolas/entities/practica-agricola.entity";
import { Proyecto } from "src/modules/gestion-proyectos/proyectos/entities/proyecto.entity";
import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from "typeorm";

@Entity('conservacion_agricolas')
export class ConservacionAgricola {
    @PrimaryColumn({ name: 'id_practica', type: 'int' })
    idPractica: number;

    @PrimaryColumn({ name: 'id_proyecto', type: 'int' })
    idProyecto: number;

    @ManyToOne(() => PracticaAgricola, (practica) => practica.conservacionAgricolas)
    @JoinColumn({ name: 'id_practica' })
    practica?: PracticaAgricola;

    @ManyToOne(() => Proyecto, (proyecto) => proyecto.conservacionAgricolas)
    @JoinColumn({ name: 'id_proyecto' })
    proyecto?: Proyecto;
}