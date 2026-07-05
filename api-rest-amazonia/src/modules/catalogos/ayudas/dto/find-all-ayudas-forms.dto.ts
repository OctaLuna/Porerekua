import { ApiProperty } from "@nestjs/swagger";
import { AyudaFormsDto } from "./ayuda-forms.dto";

export class FindAllAyudasFormsDto {
    @ApiProperty({
        description: 'Lista de ayudas',
        type: [AyudaFormsDto]
    })
    ayudas: AyudaFormsDto[]
}