import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from "typeorm";
import { Empresa } from "../../empresas/entities/empresa.entity";
import { Ods } from "src/modules/catalogos/ods/entities/ods.entity";

@Entity('ods_empresas')
export class OdsEmpresa {
    @PrimaryColumn({ name: 'id_ods' })
    idOds: number;

    @PrimaryColumn({ name: 'id_empresa' })
    idEmpresa: number;

    @ManyToOne(() => Ods, (ods) => ods.empresasOds)
    @JoinColumn({ name: 'id_ods' })
    ods?: Ods;

    @ManyToOne(() => Empresa, (empresa) => empresa.odsEmpresas)
    @JoinColumn({ name: 'id_empresa' })
    empresa?: Empresa;
}