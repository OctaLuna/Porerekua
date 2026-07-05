import { ApiProperty } from "@nestjs/swagger";

export class AyudaFormsDto {
    @ApiProperty({
        description: 'Id de la ayuda',
        type: Number
    })
    id: number

    @ApiProperty({
        description: 'Nombre de la ayuda',
        type: String
    })
    nombre: string
}