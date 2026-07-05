import { ApiProperty } from "@nestjs/swagger";
import { IsDefined, IsOptional, ValidateNested } from "class-validator";
import { Type } from 'class-transformer';
import { RegisterConservacionEspeciesDto } from "./register-conservacion-especies.dto";
import { RegisterConservacionPracticasDto } from "./register-conservacion-practicas.dto";

export class RegisterConservacionDto {
    @ApiProperty({
        description: 'Especies bandera seleccionadas en el proyecto de conservación',
        type: RegisterConservacionEspeciesDto,
        nullable: false
    })
    @IsDefined({ message: 'proyecto.conservacion.especies es obligatorio' })
    @ValidateNested()
    @Type(() => RegisterConservacionEspeciesDto)
    especies: RegisterConservacionEspeciesDto

    @ApiProperty({
        description: 'Prácticas agrícolas seleccionadas en el proyecto de conservación',
        type: RegisterConservacionPracticasDto,
        nullable: false
    })
    @IsDefined({ message: 'proyecto.conservacion.practicasAgricolas es obligatorio' })
    @ValidateNested()
    @Type(() => RegisterConservacionPracticasDto)
    practicasAgricolas: RegisterConservacionPracticasDto
}
