import { ApiProperty } from "@nestjs/swagger";

export class ActorMunicipalFormsDto {
    @ApiProperty({
        description: 'Id del actor',
        type: Number
    })
    id: number

    @ApiProperty({
        description: 'Nombre del actor',
        type: String
    })
    nombre: string
}