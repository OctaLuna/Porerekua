import { ApiProperty } from "@nestjs/swagger";
import { AreaDesarrolloDto } from "./area-desarrollo.dto";

export class FindAllAreaDesarrolloDto {
    @ApiProperty({
        description: 'lista de areas de desarrollo',
        type: [AreaDesarrolloDto]
    })
    areasDesarrollo: AreaDesarrolloDto[]
}