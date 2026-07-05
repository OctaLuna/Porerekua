import { Empresa } from "src/modules/gestion-empresarial/empresas/entities/empresa.entity";
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Proyecto } from "../../proyectos/entities/proyecto.entity";

@Entity('proyectos_empresas')
export class ProyectoEmpresa {
    @PrimaryGeneratedColumn({ name: 'id_participacion', type: 'int' })
    idParticipacion: number;

    @Column({ name: 'id_empresa', type: 'int', nullable: false })
    idEmpresa: number;

    @Column({ name: 'id_proyecto', type: 'int', nullable: false })
    idProyecto: number;

    @Column({ name: 'fecha_inicio', type: 'date', nullable: false })
    fechaInicio: Date;

    @Column({ name: 'fecha_fin', type: 'date', nullable: true })
    fechaFin?: Date;

    @ManyToOne(() => Empresa, (empresa) => empresa.proyectosEmpresas)
    @JoinColumn({ name: 'id_empresa' })
    empresa?: Empresa;

    @ManyToOne(() => Proyecto, (proyecto) => proyecto.proyectosEmpresas)
    @JoinColumn({ name: 'id_proyecto' })
    proyecto?: Proyecto;
}