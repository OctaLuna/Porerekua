import { ApiProperty } from "@nestjs/swagger";
import { TipoOrganizacionFomsDto } from "./tipo-organizacion-forms.dto";

export class FindAllTiposOrganizacionesFormsDto {
    @ApiProperty({
        description: 'Llista de tipos de organizaciones',
        type: [TipoOrganizacionFomsDto]
    })
    tiposOrganizaciones: TipoOrganizacionFomsDto[]
}