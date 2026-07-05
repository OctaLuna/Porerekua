import { Departamento } from "src/modules/ubicaciones-geograficas/departamentos/entities/departamento.entity";
import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from "typeorm";
import { Empresa } from "../../empresas/entities/empresa.entity";

@Entity('departamentos_empresas')
export class DepartamentoEmpresa {
    @PrimaryColumn({ name: 'id_departamento' })
    idDepartamento: number;

    @PrimaryColumn({ name: 'id_empresa' })
    idEmpresa: number;

    @ManyToOne(() => Departamento, (departamento) => departamento.departamentosEmpresas)
    @JoinColumn({ name: 'id_departamento' })
    departamento?: Departamento;

    @ManyToOne(() => Empresa, (empresa) => empresa.departamentosEmpresas)
    @JoinColumn({ name: 'id_empresa' })
    empresa?: Empresa;
}