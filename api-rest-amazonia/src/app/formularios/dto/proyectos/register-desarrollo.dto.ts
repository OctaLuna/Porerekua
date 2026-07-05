import { ApiProperty } from "@nestjs/swagger";
import { IsArray, ArrayMinSize, IsInt, Min, IsOptional, IsString, IsNotEmpty, Length } from "class-validator";

export class RegisterDesarrolloDto {
    @ApiProperty({
        description: 'IDs de las áreas de desarrollo seleccionadas en comunidades indígenas',
        type: [Number],
        nullable: false
    })
    @IsArray({ message: 'proyecto.desarrollo.seleccionados debe ser un array' })
    @ArrayMinSize(1, { message: 'proyecto.desarrollo.seleccionados debe contener al menos un elemento' })
    @IsInt({ each: true, message: 'Cada elemento de proyecto.desarrollo.seleccionados debe ser un número entero' })
    @Min(1, { each: true, message: 'Cada elemento de proyecto.desarrollo.seleccionados debe ser mayor a 0' })
    seleccionados: number[]

    @ApiProperty({
        description: 'Otros nombres de áreas de desarrollo en comunidades indígenas',
        type: [String],
        nullable: false
    })
    @IsArray({ message: 'proyecto.desarrollo.otros debe ser un array' })
    @IsString({ each: true, message: 'Cada elemento de proyecto.desarrollo.otros debe ser un string' })
    @IsNotEmpty({ each: true, message: 'Cada elemento de proyecto.desarrollo.otros no puede estar vacío' })
    @Length(3, 100, { each: true, message: 'Cada elemento de proyecto.desarrollo.otros debe tener entre 3 y 100 caracteres' })
    @IsOptional()
    otros: string[]
}
