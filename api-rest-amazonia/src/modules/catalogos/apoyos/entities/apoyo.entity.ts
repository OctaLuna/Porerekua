import { ApoyoEmpresa } from "src/modules/gestion-empresarial/apoyos-empresas/entities/apoyo-empresa.entity";
import { Empresa } from "src/modules/gestion-empresarial/empresas/entities/empresa.entity";
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany } from "typeorm";

@Entity('apoyos')
export class Apoyo {
    @PrimaryGeneratedColumn({ name: 'id_apoyo' })
    id: number;

    @Column({ name: 'nombre', type: 'varchar', length: 100, nullable: false })
    nombre: string;

    @Column({ name: 'es_propio', type: 'boolean', default: true, nullable: false })
    esPropio: boolean;

    @OneToMany(() => ApoyoEmpresa, (apoyosEmpresas) => apoyosEmpresas.apoyo)
    empresasApoyos?: ApoyoEmpresa[];

    @ManyToMany(() => Empresa,(empresa) => empresa.apoyos)
    empresas?: Empresa[]
}