import { ApiProperty } from "@nestjs/swagger";
import { IsArray, ArrayMinSize, IsInt, Min, IsOptional, IsString, IsNotEmpty, Length } from "class-validator";

export class RegisterAyudasDto {
    @ApiProperty({
        description: 'IDs de los tipos de ayuda seleccionados',
        type: [Number],
        nullable: false
    })
    @IsArray({ message: 'proyecto.ayudas.seleccionados debe ser un array' })
    @ArrayMinSize(1, { message: 'proyecto.ayudas.seleccionados debe contener al menos un elemento' })
    @IsInt({ each: true, message: 'Cada elemento de proyecto.ayudas.seleccionados debe ser un número entero' })
    @Min(1, { each: true, message: 'Cada elemento de proyecto.ayudas.seleccionados debe ser mayor a 0' })
    seleccionados: number[]

    @ApiProperty({
        description: 'Otros tipos de ayuda proporcionados por la empresa',
        type: [String],
        nullable: false
    })
    @IsArray({ message: 'proyecto.ayudas.otros debe ser un array' })
    @IsString({ each: true, message: 'Cada elemento de proyecto.ayudas.otros debe ser un string' })
    @IsNotEmpty({ each: true, message: 'Cada elemento de proyecto.ayudas.otros no puede estar vacío' })
    @Length(3, 100, { each: true, message: 'Cada elemento de proyecto.ayudas.otros debe tener entre 3 y 100 caracteres' })
    @IsOptional()
    otros: string[]
}
