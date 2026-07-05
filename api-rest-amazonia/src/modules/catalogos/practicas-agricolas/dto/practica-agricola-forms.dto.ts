import { ApiProperty } from "@nestjs/swagger";

export class PracticaAgricolaFormsDto {
    @ApiProperty({
        description: 'Id de la practica agricola',
        type: Number
    })
    id: number

    @ApiProperty({
        description: 'nombre de la practica agricola',
        type: String
    })
    nombre: string
}