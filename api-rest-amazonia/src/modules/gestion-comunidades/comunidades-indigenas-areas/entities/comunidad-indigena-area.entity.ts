import { AreaDesarrollo } from "src/modules/catalogos/areas-desarrollo/entities/area-desarrollo.entity";
import { Proyecto } from "src/modules/gestion-proyectos/proyectos/entities/proyecto.entity";
import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from "typeorm";

@Entity('comunidades_indigenas_areas')
export class ComunidadIndigenaArea {
    @PrimaryColumn({ name: 'id_proyecto', type: 'int' })
    idProyecto: number;

    @PrimaryColumn({ name: 'id_area', type: 'int' })
    idArea: number;

    @ManyToOne(() => Proyecto, (proyecto) => proyecto.comunidadesIndigenasAreas)
    @JoinColumn({ name: 'id_proyecto' })
    proyecto?: Proyecto;

    @ManyToOne(() => AreaDesarrollo, (area) => area.comunidadesIndigenasAreas)
    @JoinColumn({ name: 'id_area' })
    area?: AreaDesarrollo;
}