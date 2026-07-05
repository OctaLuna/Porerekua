import { ApiProperty } from "@nestjs/swagger";
import { TipoProyectoFormsDto } from "./tipo-proyecto-forms.dto";

export class FindAllTiposProyectosFormsDto {
    @ApiProperty({
        description: 'Lista de tipos de proyectos',
        type: [TipoProyectoFormsDto]
    })
    tiposProyectos: TipoProyectoFormsDto[]
}