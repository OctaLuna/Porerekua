import { Empresa } from "src/modules/gestion-empresarial/empresas/entities/empresa.entity";
import { OdsEmpresa } from "src/modules/gestion-empresarial/ods-empresas/entities/ods-empresa.entity";
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany } from "typeorm";

@Entity('ods')
export class Ods {
    @PrimaryGeneratedColumn({ name: 'id_ods' })
    id: number;

    @Column({ name: 'nombre', type: 'varchar', length: 100 })
    nombre: string;

    @OneToMany(() => OdsEmpresa, (odsEmpresas) => odsEmpresas.ods)
    empresasOds: OdsEmpresa[];

    @ManyToMany(() => Empresa,(empresa) => empresa.ods)
    empresas: Empresa[]
}