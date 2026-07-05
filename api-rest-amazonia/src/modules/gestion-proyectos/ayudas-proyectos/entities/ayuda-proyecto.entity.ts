import { Ayuda } from "src/modules/catalogos/ayudas/entities/ayuda.entity";
import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from "typeorm";
import { Proyecto } from "../../proyectos/entities/proyecto.entity";

@Entity('ayudas_proyectos')
export class AyudaProyecto {
    @PrimaryColumn({ name: 'id_proyecto' })
    idProyecto: number;

    @PrimaryColumn({ name: 'id_ayuda' })
    idAyuda: number;

    @ManyToOne(() => Proyecto, (proyecto) => proyecto.ayudasProyectos)
    @JoinColumn({ name: 'id_proyecto' })
    proyecto?: Proyecto;

    @ManyToOne(() => Ayuda, (ayuda) => ayuda.ayudasProyectos)
    @JoinColumn({ name: 'id_ayuda' })
    ayuda?: Ayuda;
}