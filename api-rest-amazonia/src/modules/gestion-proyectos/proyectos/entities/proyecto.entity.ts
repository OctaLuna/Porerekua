import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, ManyToMany, JoinTable } from 'typeorm';
import { ProyectoImagen } from './proyecto-imagen.entity';
import { ProyectoEmpresa } from '../../proyectos-empresas/entities/proyecto-empresa.entity';
import { Area } from 'src/modules/catalogos/areas/entities/area.entity';
import { TipoProyecto } from 'src/modules/catalogos/tipos-proyectos/entities/tipo-proyecto.entity';
import { ProyectoOrganizacion } from '../../proyectos-organizaciones/entities/proyecto-organizacion.entity';
import { LocalidadProyecto } from '../../localidades-proyectos/entities/localidad-proyecto.entity';
import { ActorProyecto } from '../../actores-proyectos/entities/actor-proyecto.entity';
import { AyudaProyecto } from '../../ayudas-proyectos/entities/ayuda-proyecto.entity';
import { ConservacionAnimal } from 'src/modules/gestion-conservacion/conservacion-animales/entities/conservacion-animal.entity';
import { ConservacionAgricola } from 'src/modules/gestion-conservacion/conservacion-agricolas/entities/conservacion-agricola.entity';
import { ComunidadIndigenaArea } from 'src/modules/gestion-comunidades/comunidades-indigenas-areas/entities/comunidad-indigena-area.entity';
import { Ayuda } from 'src/modules/catalogos/ayudas/entities/ayuda.entity';
import { ActorMunicipal } from 'src/modules/catalogos/actores-municipales/entities/actor-municipal.entity';
import { EspecieAnimal } from 'src/modules/catalogos/especies-animales/entities/especie-animal.entity';
import { PracticaAgricola } from 'src/modules/catalogos/practicas-agricolas/entities/practica-agricola.entity';
import { AreaDesarrollo } from 'src/modules/catalogos/areas-desarrollo/entities/area-desarrollo.entity';

@Entity('proyectos')
export class Proyecto {
    @PrimaryGeneratedColumn({ name: 'id_proyecto' })
    id: number;

    @Column({ name: 'id_area', type: 'int', nullable: false })
    idArea: number;

    @Column({ name: 'nombre', type: 'varchar', length: 300, nullable: false })
    nombre: string;

    @Column({ name: 'descripcion', type: 'text', nullable: true })
    descripcion?: string;

    @Column({ name: 'id_tipo', type: 'int', nullable: false })
    idTipo: number;

    @Column({ name: 'anio_inicio', type: 'int', nullable: false })
    anioInicio: number;

    @Column({ name: 'anio_fin', type: 'int', nullable: true })
    anioFin?: number;

    @Column({ name: 'imagen_principal_url', type: 'text', nullable: true })
    imagenPrincipalUrl: string | null;

    @Column({ name: 'imagen_principal_path', type: 'text', nullable: true })
    imagenPrincipalPath: string | null;

    @Column({ name: 'lat', type: 'decimal', precision: 10, scale: 7, nullable: true })
    lat: number | null;

    @Column({ name: 'lng', type: 'decimal', precision: 10, scale: 7, nullable: true })
    lng: number | null;

    @Column({ name: 'department', type: 'varchar', length: 100, nullable: true })
    department: string | null;

    @Column({ name: 'municipality', type: 'varchar', length: 150, nullable: true })
    municipality: string | null;

    @Column({ name: 'georef_resolved_at', type: 'timestamp', nullable: true })
    georefResolvedAt: Date | null;

    @Column({ name: 'georef_failed', type: 'boolean', default: false })
    georefFailed: boolean;

    @ManyToOne(() => Area, (area) => area.proyectos)
    @JoinColumn({ name: 'id_area' })
    area: Area;

    @ManyToOne(() => TipoProyecto, (tipo) => tipo.proyectos)
    @JoinColumn({ name: 'id_tipo' })
    tipo: TipoProyecto;

    @ManyToMany(() => Ayuda, (ayuda) => ayuda.proyectos)
    @JoinTable({
        name: 'ayudas_proyectos',
        joinColumn: { name: 'id_proyecto', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'id_ayuda', referencedColumnName: 'id' }
    })
    ayudas: Ayuda[]

    @ManyToMany(() => ActorMunicipal, (actor) => actor.proyectos)
    @JoinTable({
        name: 'actores_proyectos',
        joinColumn: { name: 'id_proyecto', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'id_actor', referencedColumnName: 'id' }
    })
    actoresMunicipales: ActorMunicipal[]

    @ManyToMany(() => EspecieAnimal,(especie) => especie.proyectos)
    @JoinTable({
        name: 'conservacion_animales',
        joinColumn: {name: 'id_proyecto', referencedColumnName: 'id'},
        inverseJoinColumn: { name: 'id_especie', referencedColumnName: 'id'}
    })
    especiesAnimales: EspecieAnimal[]

    @ManyToMany(() => PracticaAgricola,(practica) => practica.proyectos)
    @JoinTable({
        name: 'conservacion_agricolas',
        joinColumn: { name: 'id_proyecto', referencedColumnName: 'id'},
        inverseJoinColumn: { name: 'id_practica', referencedColumnName: 'id'}
    })
    practicasAgricolas: PracticaAgricola[]

    @ManyToMany(() => AreaDesarrollo,(area) => area.proyectos)
    @JoinTable({
        name: 'comunidades_indigenas_areas',
        joinColumn: { name: 'id_proyecto', referencedColumnName: 'id'},
        inverseJoinColumn: { name: 'id_area', referencedColumnName: 'id'}
    })
    areasDesarrollo: AreaDesarrollo[]

    @OneToMany(() => ProyectoEmpresa, (pe) => pe.proyecto)
    proyectosEmpresas: ProyectoEmpresa[];

    @OneToMany(() => ProyectoOrganizacion, (po) => po.proyecto)
    proyectosOrganizaciones: ProyectoOrganizacion[];

    @OneToMany(() => LocalidadProyecto, (lp) => lp.proyecto)
    localidadesProyectos: LocalidadProyecto[];

    @OneToMany(() => ActorProyecto, (ap) => ap.proyecto)
    actoresProyectos: ActorProyecto[];

    @OneToMany(() => AyudaProyecto, (ayp) => ayp.proyecto)
    ayudasProyectos: AyudaProyecto[];

    @OneToMany(() => ConservacionAnimal, (ca) => ca.proyecto)
    conservacionAnimales: ConservacionAnimal[];

    @OneToMany(() => ConservacionAgricola, (ca) => ca.proyecto)
    conservacionAgricolas: ConservacionAgricola[];

    @OneToMany(() => ComunidadIndigenaArea, (cia) => cia.proyecto)
    comunidadesIndigenasAreas: ComunidadIndigenaArea[];

    @OneToMany(() => ProyectoImagen, (img) => img.proyecto)
    imagenes: ProyectoImagen[];
}
