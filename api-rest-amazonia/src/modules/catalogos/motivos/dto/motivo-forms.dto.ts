import { ApiProperty } from "@nestjs/swagger";

export class MotivoFormsDto {
    @ApiProperty({
        description: 'Id del motivo',
        type: Number
    })
    id: number

    @ApiProperty({
        description: 'Nombre del motivo',
        type: String
    })
    nombre: String
}