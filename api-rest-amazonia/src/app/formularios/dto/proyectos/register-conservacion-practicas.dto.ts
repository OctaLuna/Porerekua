import { ApiProperty } from "@nestjs/swagger";
import { IsArray, ArrayMinSize, IsInt, Min, IsOptional, IsString, IsNotEmpty, Length } from "class-validator";

export class RegisterConservacionPracticasDto {
    @ApiProperty({
        description: 'IDs de prácticas agrícolas seleccionadas',
        type: [Number],
        nullable: false
    })
    @IsArray({ message: 'proyecto.conservacion.practicasAgricolas.seleccionados debe ser un array' })
    @ArrayMinSize(1, { message: 'proyecto.conservacion.practicasAgricolas.seleccionados debe contener al menos un elemento' })
    @IsInt({ each: true, message: 'Cada elemento de proyecto.conservacion.practicasAgricolas.seleccionados debe ser un número entero' })
    @Min(1, { each: true, message: 'Cada elemento de proyecto.conservacion.practicasAgricolas.seleccionados debe ser mayor a 0' })
    seleccionados: number[]

    @ApiProperty({
        description: 'Otros nombres de prácticas agrícolas',
        type: [String],
        nullable: false
    })
    @IsArray({ message: 'proyecto.conservacion.practicasAgricolas.otros debe ser un array' })
    @IsString({ each: true, message: 'Cada elemento de proyecto.conservacion.practicasAgricolas.otros debe ser un string' })
    @IsNotEmpty({ each: true, message: 'Cada elemento de proyecto.conservacion.practicasAgricolas.otros no puede estar vacío' })
    @Length(3, 100, { each: true, message: 'Cada elemento de proyecto.conservacion.practicasAgricolas.otros debe tener entre 3 y 100 caracteres' })
    @IsOptional()
    otros: string[]
}
