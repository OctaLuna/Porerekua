import { ApiProperty } from "@nestjs/swagger";
import { IsDefined, IsInt, IsNotEmpty, IsOptional, IsString, Length, Min } from "class-validator";


export class RegisterFormaJuridicaDto {
    @ApiProperty({
        description: 'ID de la forma jurídica seleccionada (si se elige una existente)',
        type: Number,
        nullable: true
    })
    @IsOptional()
    @IsInt({ message: 'empresa.formaJuridica.id debe ser un número entero' })
    @Min(1, { message: 'empresa.formaJuridica.id debe ser mayor o igual a 1' })
    id?: number;

    @ApiProperty({
        description: 'Otra forma jurídica si no se selecciona una existente',
        type: String,
        nullable: true
    })
    @IsOptional()
    @IsString({ message: 'empresa.formaJuridica.otro debe ser un texto' })
    @Length(3, 100, { message: 'empresa.formaJuridica.otro debe tener entre 3 y 100 caracteres' })
    otro?: string;
}