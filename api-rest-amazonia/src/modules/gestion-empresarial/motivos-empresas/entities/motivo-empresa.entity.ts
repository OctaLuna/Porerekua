import { Motivo } from "src/modules/catalogos/motivos/entities/motivo.entity";
import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from "typeorm";
import { Empresa } from "../../empresas/entities/empresa.entity";

@Entity('motivos_empresas')
export class MotivoEmpresa {
    @PrimaryColumn({ name: 'id_empresa', type: 'int' })
    idEmpresa: number;

    @PrimaryColumn({ name: 'id_motivo', type: 'int' })
    idMotivo: number;

    @ManyToOne(() => Empresa, (empresa) => empresa.motivosEmpresas)
    @JoinColumn({ name: 'id_empresa' })
    empresa?: Empresa;

    @ManyToOne(() => Motivo, (motivo) => motivo.empresasMotivos)
    @JoinColumn({ name: 'id_motivo' })
    motivo?: Motivo;
}