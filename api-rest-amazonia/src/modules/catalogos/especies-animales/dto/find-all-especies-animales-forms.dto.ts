import { ApiProperty } from "@nestjs/swagger";
import { EspecieAnimalFormsDto } from "./especie-animal-forms.dto";

export class FindAllEspeciesAnimalesFormsDto {
    @ApiProperty({
        description: 'lista de especies agricolas',
        type: [EspecieAnimalFormsDto]
    })
    especiesAnimales: EspecieAnimalFormsDto[]
}