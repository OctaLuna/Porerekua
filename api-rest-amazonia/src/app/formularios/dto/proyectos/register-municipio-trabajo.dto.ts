import { ApiProperty } from "@nestjs/swagger";
import { IsDefined, IsInt, IsOptional, Min } from "class-validator";

export class RegisterMunicipioTrabajoDto {
    @ApiProperty({
        description: 'ID del municipio donde se ejecuta el proyecto',
        type: Number,
        nullable: false
    })
    @IsDefined({ message: 'proyecto.municipiosTrabajo.idMunicipio es obligatorio' })
    @IsInt({ message: 'proyecto.municipiosTrabajo.idMunicipio debe ser un número entero' })
    @Min(1, { message: 'proyecto.municipiosTrabajo.idMunicipio debe ser mayor a 0' })
    idMunicipio: number

    @ApiProperty({
        description: 'ID de la comunidad indígena dentro del municipio (opcional)',
        type: Number,
        nullable: true
    })
    @IsOptional()
    @IsInt({ message: 'proyecto.municipiosTrabajo.idComunidadIndigena debe ser un número entero' })
    @Min(1, { message: 'proyecto.municipiosTrabajo.idComunidadIndigena debe ser mayor a 0' })
    idComunidadIndigena?: number
}