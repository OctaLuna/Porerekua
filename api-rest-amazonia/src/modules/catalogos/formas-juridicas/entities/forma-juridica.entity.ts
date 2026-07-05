import { Empresa } from "src/modules/gestion-empresarial/empresas/entities/empresa.entity";
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";

@Entity('formas_juridicas')
export class FormaJuridica {
    @PrimaryGeneratedColumn({ name: 'id_forma' })
    id: number;

    @Column({ name: 'nombre', type: 'varchar', length: 100 })
    nombre: string;

    @Column({ name: 'es_propio', type: 'boolean', default: true })
    esPropio: boolean;

    @OneToMany(() => Empresa, (empresa) => empresa.formaJuridica)
    empresas: Empresa[];
}