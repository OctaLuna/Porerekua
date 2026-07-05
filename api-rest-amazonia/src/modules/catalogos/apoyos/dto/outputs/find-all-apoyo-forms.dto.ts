import { ApiProperty } from "@nestjs/swagger";
import { ApoyoFormsDto } from "../apoyo-forms.dto";

export class FindAllApoyoFormsDto {
    @ApiProperty({
        description: 'Lista de apoyos',
        type: [ApoyoFormsDto]
    })
    apoyos: ApoyoFormsDto[]
}