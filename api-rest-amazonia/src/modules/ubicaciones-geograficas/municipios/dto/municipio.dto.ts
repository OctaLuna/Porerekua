import { ApiProperty } from "@nestjs/swagger";
import { ComunidadIndigenaDto } from "../../comunidades-indigenas/dto/comunidad-indigena.dto";

export class MunicipioDto {
    @ApiProperty({
        description: 'Id del municipio',
        type: Number
    })
    id: number

    @ApiProperty({
        description: 'Nombre del municipio',
        type: String
    })
    nombre: string

    @ApiProperty({
        description: 'Lista de las comunidades indigenas del municipio',
        type: [ComunidadIndigenaDto]
    })
    comunidadesIndigenas: ComunidadIndigenaDto[]
}