import { Empresa } from "src/modules/gestion-empresarial/empresas/entities/empresa.entity";
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Organizacion } from "../../organizaciones/entities/organizacion.entity";

@Entity('organizaciones_empresas')
export class OrganizacionEmpresa {
    @PrimaryGeneratedColumn({ name: 'id_orga_empresa' })
    id: number;

    @Column({ name: 'id_organizacion', type: 'int', nullable: true })
    idOrganizacion?: number;

    @Column({ name: 'id_empresa', type: 'int' })
    idEmpresa: number;

    @Column({ name: 'nombre', type: 'varchar', length: 300, nullable: true })
    nombre: string;

    @ManyToOne(() => Organizacion, (organizacion) => organizacion.organizacionesEmpresas)
    @JoinColumn({ name: 'id_organizacion' })
    organizacion?: Organizacion;

    @ManyToOne(() => Empresa, (empresa) => empresa.organizacionesEmpresas)
    @JoinColumn({ name: 'id_empresa' })
    empresa?: Empresa;
}