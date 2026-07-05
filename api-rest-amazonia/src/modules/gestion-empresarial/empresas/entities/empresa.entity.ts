import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, ManyToMany, JoinTable } from "typeorm";
import { DepartamentoEmpresa } from "../../departamentos-empresas/entities/departamento-empresa.entity";
import { FormaJuridica } from "src/modules/catalogos/formas-juridicas/entities/forma-juridica.entity";
import { MotivoEmpresa } from "../../motivos-empresas/entities/motivo-empresa.entity";
import { ApoyoEmpresa } from "../../apoyos-empresas/entities/apoyo-empresa.entity";
import { OdsEmpresa } from "../../ods-empresas/entities/ods-empresa.entity";
import { ProyectoEmpresa } from "src/modules/gestion-proyectos/proyectos-empresas/entities/proyecto-empresa.entity";
import { OrganizacionEmpresa } from "src/modules/gestion-organizacional/organizaciones-empresas/entities/organizacion-empresa.entity";
import { Motivo } from "src/modules/catalogos/motivos/entities/motivo.entity";
import { Apoyo } from "src/modules/catalogos/apoyos/entities/apoyo.entity";
import { Ods } from "src/modules/catalogos/ods/entities/ods.entity";
import { Departamento } from "src/modules/ubicaciones-geograficas/departamentos/entities/departamento.entity";

@Entity('empresas')
export class Empresa {
    @PrimaryGeneratedColumn({ name: 'id_empresa' })
    id: number;

    @Column({ name: 'nombre', type: 'varchar', length: 255 })
    nombre: string;

    @Column({ name: 'id_forma_juridica', type: 'int' })
    idFormaJuridica: number;

    @Column({ name: 'anio_inicio_apoyo', type: 'int' })
    anioInicioApoyo: number;

    @Column({ name: 'logo_url', type: 'text', nullable: true })
    logoUrl: string | null;

    @Column({ name: 'logo_path', type: 'text', nullable: true })
    logoPath: string | null;

    @ManyToOne(() => FormaJuridica, (forma) => forma.empresas)
    @JoinColumn({ name: 'id_forma_juridica' })
    formaJuridica: FormaJuridica;

    @ManyToMany(() => Motivo, (motivo) => motivo.empresas)
    @JoinTable({
        name: 'motivos_empresas',
        joinColumn: { name: 'id_empresa', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'id_motivo', referencedColumnName: 'id' }
    })
    motivos: Motivo[]

    @ManyToMany(() => Apoyo, (apoyo) => apoyo.empresas)
    @JoinTable({
        name: 'apoyos_empresas',
        joinColumn: { name: 'id_empresa', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'id_apoyo', referencedColumnName: 'id' }
    })
    apoyos: Apoyo[]

    @ManyToMany(() => Ods, (ods) => ods.empresas)
    @JoinTable({
        name: 'ods_empresas',
        joinColumn: { name: 'id_empresa', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'id_ods', referencedColumnName: 'id' }
    })
    ods: Ods[]

    @ManyToMany(() => Departamento, (depa) => depa.empresas)
    @JoinTable({
        name: 'departamentos_empresas',
        joinColumn: { name: 'id_empresa', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'id_departamento', referencedColumnName: 'id' }
    })
    departamentos: Departamento[]

    @OneToMany(() => MotivoEmpresa, (motivos) => motivos.empresa)
    motivosEmpresas: MotivoEmpresa[];

    @OneToMany(() => ApoyoEmpresa, (apoyos) => apoyos.empresa)
    apoyosEmpresas: ApoyoEmpresa[];

    @OneToMany(() => OdsEmpresa, (ods) => ods.empresa)
    odsEmpresas: OdsEmpresa[];

    @OneToMany(() => DepartamentoEmpresa, (dep) => dep.empresa)
    departamentosEmpresas: DepartamentoEmpresa[];

    @OneToMany(() => ProyectoEmpresa, (proy) => proy.empresa)
    proyectosEmpresas: ProyectoEmpresa[];

    @OneToMany(() => OrganizacionEmpresa, (orga) => orga.empresa)
    organizacionesEmpresas: OrganizacionEmpresa[];
}