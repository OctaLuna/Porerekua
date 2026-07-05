import { ComunidadIndigenaArea } from "src/modules/gestion-comunidades/comunidades-indigenas-areas/entities/comunidad-indigena-area.entity";
import { Proyecto } from "src/modules/gestion-proyectos/proyectos/entities/proyecto.entity";
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany } from "typeorm";

@Entity('areas_desarrollo')
export class AreaDesarrollo {
    @PrimaryGeneratedColumn({ name: 'id_area' })
    id: number;

    @Column({ name: 'nombre', type: 'varchar', length: 100, unique: true })
    nombre: string;

    @OneToMany(() => ComunidadIndigenaArea, (cia) => cia.area)
    comunidadesIndigenasAreas: ComunidadIndigenaArea[];

    @ManyToMany(() => Proyecto,(proyecto) => proyecto.areasDesarrollo)
    proyectos: Proyecto[]
}