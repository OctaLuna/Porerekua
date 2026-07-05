import { ApiProperty } from "@nestjs/swagger";
import { MunicipioDto } from "../../municipios/dto/municipio.dto";

export class DepartamentoDto {
    @ApiProperty({
        description: 'Id del departamento',
        type: Number
    })
    id: number

    @ApiProperty({
        description: 'NOmbre del departamento',
        type: String
    })
    nombre: string

    @ApiProperty({
        description: 'Municipios de departamentos',
        type: [MunicipioDto]
    })
    municipios: MunicipioDto[]
}