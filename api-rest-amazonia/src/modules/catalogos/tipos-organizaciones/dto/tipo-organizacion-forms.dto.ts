import { ApiProperty } from "@nestjs/swagger";

export class TipoOrganizacionFomsDto {
    @ApiProperty({
        description: 'Id del tipo de organizaciones',
        type: Number
    })
    id: number

    @ApiProperty({
        description: 'Nombre de tipo de organizacion',
        type: String
    })
    nombre: string
}