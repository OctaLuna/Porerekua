import { ApiProperty } from "@nestjs/swagger";

export class AreaDesarrolloDto {
    @ApiProperty({
        description: 'Id del area de desarrollo',
        type: Number
    })
    id: number

    @ApiProperty({
        description: 'Nombre de area de desarrollo',
        type: String
    })
    nombre: String
}