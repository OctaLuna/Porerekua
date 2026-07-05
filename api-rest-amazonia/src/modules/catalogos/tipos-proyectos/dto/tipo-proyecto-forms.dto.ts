import { ApiProperty } from "@nestjs/swagger";

export class TipoProyectoFormsDto {
    @ApiProperty({
        description: 'Id del tipo de proyecto',
        type: Number
    })
    id: number

    @ApiProperty({
        description: 'Nombre del tipo de proyecto',
        type: String
    })
    nombre: string
}