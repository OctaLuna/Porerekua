import { ApiProperty } from "@nestjs/swagger";
import { IsDefined, IsInt, IsOptional, IsString, IsNotEmpty, Length, Min } from "class-validator";

export class RegisterTipoDto {
    @ApiProperty({
        description: 'ID del tipo seleccionado (si se elige uno existente)',
        type: Number,
        nullable: true
    })
    @IsOptional()
    @IsInt({ message: 'proyecto.tipo.id debe ser un número entero' })
    @Min(1, { message: 'proyecto.tipo.id debe ser mayor a 0' })
    id?: number

    @ApiProperty({
        description: 'Otro tipo de proyecto (si no se selecciona un ID existente)',
        type: String,
        nullable: true
    })
    @IsOptional()
    @IsString({ message: 'proyecto.tipo.otros debe ser un string' })
    @IsNotEmpty({ message: 'proyecto.tipo.otros no puede estar vacío si se proporciona' })
    @Length(3, 100, { message: 'proyecto.tipo.otros debe tener entre 3 y 100 caracteres' })
    otros?: string
}
