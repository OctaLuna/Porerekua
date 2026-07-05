import { ApiProperty } from "@nestjs/swagger";

export class EspecieAnimalFormsDto {
    @ApiProperty({
        description: 'Id de la especie animal',
        type: Number
    })
    id: number

    @ApiProperty({
        description: 'NOmbre de la especie animal',
        type: String
    })
    nombre: string
}