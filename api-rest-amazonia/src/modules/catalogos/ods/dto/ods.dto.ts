import { ApiProperty } from "@nestjs/swagger";

export class OdsDto {
    @ApiProperty({
        description: 'Id del ods',
        type: Number
    })
    id: number

    @ApiProperty({
        description: 'Nombre del ods',
        type: String
    })
    nombre: string
}