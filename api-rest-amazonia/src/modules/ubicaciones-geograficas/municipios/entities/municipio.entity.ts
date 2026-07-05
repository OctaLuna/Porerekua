import { LocalidadProyecto } from "src/modules/gestion-proyectos/localidades-proyectos/entities/localidad-proyecto.entity";
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, ManyToMany, JoinTable } from "typeorm";
import { Departamento } from "../../departamentos/entities/departamento.entity";
import { ComunidadIndigena } from "../../comunidades-indigenas/entities/comunidad-indigena.entity";

@Entity('municipios')
export class Municipio {
    @PrimaryGeneratedColumn({ name: 'id_municipio' })
    id: number;

    @Column({ name: 'nombre', type: 'varchar', length: 100, nullable: false })
    nombre: string;

    @Column({ name: 'id_departamento', type: 'int', nullable: false })
    idDepartamento: number;

    @ManyToOne(() => Departamento, (departamento) => departamento.municipios)
    @JoinColumn({ name: 'id_departamento' })
    departamento: Departamento;

    @OneToMany(() => ComunidadIndigena, (comunidad) => comunidad.comunidadesMunicipios)
    comunidadesMunicipios: ComunidadIndigena[];

    @OneToMany(() => LocalidadProyecto, (localidad) => localidad.municipio)
    localidadesProyectos: LocalidadProyecto[];

    @ManyToMany(() => ComunidadIndigena,(comunidad) => comunidad.municipios)
    @JoinTable({
        name: 'comunidades_municipios',
        joinColumn: { name: 'id_municipio', referencedColumnName: 'id'},
        inverseJoinColumn: { name: 'id_comunidad', referencedColumnName: 'id'}
    })
    comunidadesIndigenas: ComunidadIndigena[]
}