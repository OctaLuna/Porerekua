import { ApiProperty } from "@nestjs/swagger";
import { AreaDto } from "./area.dto";

export class FindAllAreasDto {
    @ApiProperty({
        description: 'Lista de areas',
        type: [AreaDto]
    })
    areas: AreaDto[]
}