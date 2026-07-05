import { ApiProperty } from "@nestjs/swagger";

export class AreaDto {
    @ApiProperty({
        description: 'Id del area de proyecto',
        type: Number
    })
    id: number

    @ApiProperty({
        description: 'Nombre del area',
        type: String
    })
    nombre: string
}