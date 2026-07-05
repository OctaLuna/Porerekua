import { Municipio } from "src/modules/ubicaciones-geograficas/municipios/entities/municipio.entity";
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Proyecto } from "../../proyectos/entities/proyecto.entity";
import { ComunidadIndigena } from "src/modules/ubicaciones-geograficas/comunidades-indigenas/entities/comunidad-indigena.entity";

@Entity('localidades_proyectos')
export class LocalidadProyecto {
    @PrimaryGeneratedColumn({ name: 'id_localidad' })
    id: number;

    @Column({ name: 'id_proyecto', type: 'int', nullable: false })
    idProyecto: number;

    @Column({ name: 'id_municipio', type: 'int', nullable: false })
    idMunicipio: number;

    @Column({ name: 'id_comunidad', type: 'int', nullable: true })
    idComunidad?: number;

    @ManyToOne(() => Proyecto, (proyecto) => proyecto.localidadesProyectos)
    @JoinColumn({ name: 'id_proyecto' })
    proyecto?: Proyecto;

    @ManyToOne(() => Municipio, (municipio) => municipio.localidadesProyectos)
    @JoinColumn({ name: 'id_municipio' })
    municipio?: Municipio;

    @ManyToOne(() => ComunidadIndigena, (comunidad) => comunidad.localidadesProyectos)
    @JoinColumn({ name: 'id_comunidad' })
    comunidad?: ComunidadIndigena;
}