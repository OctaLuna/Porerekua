import { LocalidadProyecto } from "src/modules/gestion-proyectos/localidades-proyectos/entities/localidad-proyecto.entity";
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany } from "typeorm";
import { ComunidadMunicipio } from "../../comunidades-municipios/entities/comunidad-municipio.entity";
import { Municipio } from "../../municipios/entities/municipio.entity";

@Entity('comunidades_indigenas')
export class ComunidadIndigena {
    @PrimaryGeneratedColumn({ name: 'id_comunidad' })
    id: number;

    @Column({ type: 'varchar', length: 100 })
    nombre: string;

    @OneToMany(() => ComunidadMunicipio, (comunidadMunicipio) => comunidadMunicipio.comunidadIndigena)
    comunidadesMunicipios: ComunidadMunicipio[];

    @OneToMany(() => LocalidadProyecto, (localidadProyecto) => localidadProyecto.comunidad)
    localidadesProyectos: LocalidadProyecto[];

    @ManyToMany(() => Municipio,(municipio) => municipio.comunidadesIndigenas)
    municipios: Municipio[]
}