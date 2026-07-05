import { ApiProperty } from "@nestjs/swagger";
import { MotivoFormsDto } from "../motivo-forms.dto";

export class findAllMotivosFormsDto {
    @ApiProperty({
        description: 'Lista de motivos',
        type: [MotivoFormsDto]
    })
    motivos: MotivoFormsDto[]
}