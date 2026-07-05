import { ApiProperty } from "@nestjs/swagger";
import { DepartamentoDto } from "./departamento.dto";

export class FindAllDepartamentosDto {
    @ApiProperty({
        description: 'Lista de departamentos',
        type: [DepartamentoDto]
    })
    departamentos: DepartamentoDto[]
}