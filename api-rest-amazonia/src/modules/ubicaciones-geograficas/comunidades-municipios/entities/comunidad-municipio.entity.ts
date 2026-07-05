import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { Municipio } from "../../municipios/entities/municipio.entity";
import { ComunidadIndigena } from "../../comunidades-indigenas/entities/comunidad-indigena.entity";

@Entity('comunidades_municipios')
export class ComunidadMunicipio {
    @PrimaryColumn({ name: 'id_municipio', type: 'int'})
    idMunicipio: number

    @PrimaryColumn({ name: 'id_comunidad', type: 'int'})
    idComunidad: number

    @ManyToOne(() => Municipio,(municipio) => municipio.comunidadesMunicipios)
    @JoinColumn({ name: 'id_municipio'})
    municipio: Municipio

    @ManyToOne(() => ComunidadIndigena,(comunidad) => comunidad.comunidadesMunicipios)
    @JoinColumn({ name: 'id_comunidad'})
    comunidadIndigena: ComunidadIndigena
}
