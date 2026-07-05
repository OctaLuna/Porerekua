import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany } from "typeorm";
import { Municipio } from "../../municipios/entities/municipio.entity";
import { Organizacion } from "src/modules/gestion-organizacional/organizaciones/entities/organizacion.entity";
import { DepartamentoEmpresa } from "src/modules/gestion-empresarial/departamentos-empresas/entities/departamento-empresa.entity";
import { Empresa } from "src/modules/gestion-empresarial/empresas/entities/empresa.entity";

@Entity('departamentos')
export class Departamento {
    @PrimaryGeneratedColumn({ name: 'id_departamento' })
    id: number;

    @Column({ type: 'varchar', length: 100 })
    nombre: string;

    @Column({ type: 'boolean' })
    amazonico: boolean;

    @OneToMany(() => Municipio, (municipio) => municipio.departamento)
    municipios: Municipio[];

    @OneToMany(() => Organizacion, (organizacion) => organizacion.departamento)
    organizaciones: Organizacion[];

    @OneToMany(() => DepartamentoEmpresa, (departamentoEmpresa) => departamentoEmpresa.departamento)
    departamentosEmpresas: DepartamentoEmpresa[];

    @ManyToMany(() => Empresa,(empresa) => empresa.departamentos)
    empresas: Empresa[]
}