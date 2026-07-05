import { ApiProperty } from "@nestjs/swagger";

export class ComunidadIndigenaDto {
    @ApiProperty({
        description: 'Id de la comunidad indigena',
        type: Number
    })
    id: number

    @ApiProperty({
        description: 'Nombre de la comunidad',
        type: String
    })
    nombre: string
}