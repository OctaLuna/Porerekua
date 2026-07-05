import { Organizacion } from "src/modules/gestion-organizacional/organizaciones/entities/organizacion.entity";
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";

@Entity('tipos_organizaciones')
export class TipoOrganizacion {
    @PrimaryGeneratedColumn({ name: 'id_tipo' })
    id: number;

    @Column({ name: 'nombre', type: 'varchar', length: 100, unique: true })
    nombre: string;

    @Column({ name: 'es_propio', type: 'boolean', default: true })
    esPropio: boolean;

    @OneToMany(() => Organizacion, (organizacion) => organizacion.tipo)
    organizaciones: Organizacion[];
}