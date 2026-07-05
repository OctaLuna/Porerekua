import { ApiProperty } from "@nestjs/swagger";
import { FormaJuridicaFormsDto } from "../forma-juridica-forms.dto";

export class FindAllFormasJuridicasFormsDto {
    @ApiProperty({
        description: 'Lista de formas juridicas',
        type: [FormaJuridicaFormsDto]
    })
    formasJuridicas: FormaJuridicaFormsDto[]
}