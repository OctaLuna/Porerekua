import { ApiProperty } from "@nestjs/swagger";
import { PracticaAgricolaFormsDto } from "./practica-agricola-forms.dto";

export class FindAllPracticasAgricolasFormsDto {
    @ApiProperty({
        description: 'Lista de practicas agricolas',
        type: [PracticaAgricolaFormsDto]
    })
    practicasAgricolas: PracticaAgricolaFormsDto[]
}