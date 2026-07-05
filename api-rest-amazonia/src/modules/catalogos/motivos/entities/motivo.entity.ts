import { Empresa } from "src/modules/gestion-empresarial/empresas/entities/empresa.entity";
import { MotivoEmpresa } from "src/modules/gestion-empresarial/motivos-empresas/entities/motivo-empresa.entity";
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany } from "typeorm";

@Entity('motivos')
export class Motivo {
    @PrimaryGeneratedColumn({ name: 'id_motivo' })
    id: number;

    @Column({ name: 'nombre', type: 'varchar', length: 100 })
    nombre: string;

    @Column({ name: 'es_propio', type: 'boolean', default: true })
    esPropio: boolean;

    @OneToMany(() => MotivoEmpresa, (motivosEmpresas) => motivosEmpresas.motivo)
    empresasMotivos?: MotivoEmpresa[];

    @ManyToMany(() => Empresa,(empresa) => empresa.motivos)
    empresas?: Empresa[]
}