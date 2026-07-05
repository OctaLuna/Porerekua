import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsInt, IsOptional, IsString, Length, Min } from "class-validator";

export class RegisterApoyosDto {
    @ApiProperty({
        description: 'IDs de los apoyos seleccionados por la empresa',
        type: [Number],
        nullable: true
    })
    @IsOptional()
    @IsArray({ message: 'empresa.apoyos.seleccionados debe ser un array' })
    @IsInt({ each: true, message: 'cada elemento de empresa.apoyos.seleccionados debe ser un número entero' })
    @Min(1, { each: true, message: 'cada elemento de empresa.apoyos.seleccionados debe ser mayor o igual a 1' })
    seleccionados?: number[];

    @ApiProperty({
        description: 'Otros apoyos escritos por la empresa',
        type: [String],
        nullable: true
    })
    @IsOptional()
    @IsArray({ message: 'empresa.apoyos.otros debe ser un array' })
    @IsString({ each: true, message: 'cada elemento de empresa.apoyos.otros debe ser un texto' })
    @Length(3, 100, { each: true, message: 'cada elemento de empresa.apoyos.otros debe tener entre 3 y 100 caracteres' })
    otros?: string[];
}