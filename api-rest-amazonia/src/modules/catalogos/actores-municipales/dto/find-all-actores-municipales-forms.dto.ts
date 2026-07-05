import { ApiProperty } from "@nestjs/swagger";
import { ActorMunicipalFormsDto } from "./actor-municipal-forms.dto";

export class FindAllActoresMunicipalesFormsDto {
    @ApiProperty({
        description: 'Lista de actores',
        type: [ActorMunicipalFormsDto]
    })
    actoresMunicipales: ActorMunicipalFormsDto
}