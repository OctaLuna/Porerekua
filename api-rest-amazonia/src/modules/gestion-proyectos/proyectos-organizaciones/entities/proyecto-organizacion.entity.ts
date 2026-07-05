import { Organizacion } from "src/modules/gestion-organizacional/organizaciones/entities/organizacion.entity";
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Proyecto } from "../../proyectos/entities/proyecto.entity";

@Entity('proyectos_organizaciones')
export class ProyectoOrganizacion {
    @PrimaryGeneratedColumn({ name: 'id_participacion', type: 'int' })
    idParticipacion: number;

    @Column({ name: 'id_proyecto', type: 'int', nullable: false })
    idProyecto: number;

    @Column({ name: 'id_organizacion', type: 'int', nullable: false })
    idOrganizacion: number;

    @Column({ type: 'date', name: 'fecha_inicio' })
    fechaInicio: Date;

    @Column({ type: 'date', name: 'fecha_fin', nullable: true })
    fechaFin?: Date;

    @ManyToOne(() => Proyecto, (proyecto) => proyecto.proyectosOrganizaciones, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id_proyecto' })
    proyecto?: Proyecto;

    @ManyToOne(() => Organizacion, (organizacion) => organizacion.proyectosOrganizaciones, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id_organizacion' })
    organizacion?: Organizacion;
}