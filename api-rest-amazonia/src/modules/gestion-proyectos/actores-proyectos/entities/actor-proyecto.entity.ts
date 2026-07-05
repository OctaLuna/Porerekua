import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Proyecto } from '../../proyectos/entities/proyecto.entity';
import { ActorMunicipal } from 'src/modules/catalogos/actores-municipales/entities/actor-municipal.entity';


@Entity('actores_proyectos')
export class ActorProyecto {
    @PrimaryColumn({ name: 'id_proyecto', type: 'int' })
    idProyecto: number;

    @PrimaryColumn({ name: 'id_actor', type: 'int' })
    idActor: number;

    @ManyToOne(() => Proyecto, (proyecto) => proyecto.actoresProyectos)
    @JoinColumn({ name: 'id_proyecto' })
    proyecto?: Proyecto;

    @ManyToOne(() => ActorMunicipal, (actor) => actor.proyectos)
    @JoinColumn({ name: 'id_actor' })
    actor?: ActorMunicipal;
}