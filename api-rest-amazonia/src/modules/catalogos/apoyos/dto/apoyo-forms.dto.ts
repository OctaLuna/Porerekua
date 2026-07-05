import { ApiProperty } from "@nestjs/swagger";
import { string } from "joi";

export class ApoyoFormsDto {
    @ApiProperty({
        description: 'Id del apoyo',
        type: Number
    })
    id: number

    @ApiProperty({
        description: 'Nombre del apoyo',
        type: String
    })
    nombre: string
}