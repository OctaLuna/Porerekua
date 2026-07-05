import { ApiProperty } from "@nestjs/swagger";

export class FormaJuridicaFormsDto {
    @ApiProperty({
        description: 'Id de la forma juridica',
        type: Number
    })
    id: number

    @ApiProperty({
        description: 'Nombre de la forma juridica',
        type: String
    })
    nombre: string
}