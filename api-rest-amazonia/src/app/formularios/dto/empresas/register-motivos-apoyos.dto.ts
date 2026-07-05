import { ApiProperty } from "@nestjs/swagger";
import { ArrayMinSize, IsArray, isArray, IsInt, IsOptional, IsString, Length, Min } from "class-validator";


export class RegisterMotivosApoyosDto {
    @ApiProperty({
        description: 'Ids de los motivos seleccionados por la empresa',
        type: [Number],
        nullable: true
    })
    @IsOptional()
    @IsArray({ message: 'empresa.motivosApoyo.seleccionados debe ser un array' })
    @IsInt({ each: true, message: 'cada elemento de empresa.motivosApoyo.seleccionados debe ser un número entero' })
    @Min(1, { each: true, message: 'cada elemento de empresa.motivosApoyo.seleccionados debe ser mayor o igual a 1' })
    seleccionados?: number[];

    @ApiProperty({
        description: 'Otros motivos escritos por la empresa',
        type: [String],
        nullable: true
    })
    @IsOptional()
    @IsArray({ message: 'empresa.motivosApoyo.otros debe ser un array' })
    @IsString({ each: true, message: 'cada elemento de empresa.motivosApoyo.otros debe ser un texto' })
    @Length(3, 100, { each: true, message: 'cada elemento de empresa.motivosApoyo.otros debe tener entre 3 y 100 caracteres' })
    otros?: string[];
}