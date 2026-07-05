import { Apoyo } from "src/modules/catalogos/apoyos/entities/apoyo.entity";
import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from "typeorm";
import { Empresa } from "../../empresas/entities/empresa.entity";

@Entity('apoyos_empresas')
export class ApoyoEmpresa {
    @PrimaryColumn({ name: 'id_apoyo', type: 'int' })
    idApoyo: number;

    @PrimaryColumn({ name: 'id_empresa', type: 'int' })
    idEmpresa: number;

    @ManyToOne(() => Apoyo, (apoyo) => apoyo.empresasApoyos)
    @JoinColumn({ name: 'id_apoyo' })
    apoyo?: Apoyo;

    @ManyToOne(() => Empresa, (empresa) => empresa.apoyosEmpresas)
    @JoinColumn({ name: 'id_empresa' })
    empresa?: Empresa;
}