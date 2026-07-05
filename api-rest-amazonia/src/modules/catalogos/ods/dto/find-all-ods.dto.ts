import { ApiProperty } from "@nestjs/swagger";
import { OdsDto } from "./ods.dto";

export class FindAllOdsDto {
    @ApiProperty({
        description: 'Lista de ods',
        type: [OdsDto]
    })
    ods: OdsDto[]
}