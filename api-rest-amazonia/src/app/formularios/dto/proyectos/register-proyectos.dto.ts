import { ApiProperty } from "@nestjs/swagger";
import { IsDefined, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, IsArray, ArrayNotEmpty, ValidateNested, IsIn, Max, Min, Length, Matches } from "class-validator";
import { Type } from "class-transformer";

import { RegisterTipoDto } from "./register-tipo.dto";
import { RegisterMunicipioTrabajoDto } from "./register-municipio-trabajo.dto";
import { RegisterAyudasDto } from "./register-ayudas.dto";
import { RegisterActoresDto } from "./register-actores.dto";
import { RegisterConservacionDto } from "./register-conservacion.dto";
import { RegisterDesarrolloDto } from "./register-desarrollo.dto";
import { AreasEnum } from "src/shared/enums/areas.enum";

export class RegisterProyectosDto {
    @ApiProperty({
        description: 'Fecha de inicio del proyecto (formato dd-mm-yyyy)',
        example: '27-10-2025',
        type: String,
        nullable: false
    })
    @IsDefined({ message: 'proyecto.fechaInicio es obligatoria' })
    @IsString({ message: 'proyecto.fechaInicio debe ser un string' })
    @Matches(/^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-\d{4}$/, {
        message: 'proyecto.fechaInicio debe tener el formato dd-mm-yyyy'
    })
    fechaInicio: string;

    @ApiProperty({
        description: 'Fecha de finalización del proyecto (formato dd-mm-yyyy, opcional)',
        example: '30-12-2025',
        type: String,
        nullable: true
    })
    @IsOptional()
    @IsString({ message: 'proyecto.fechaFin debe ser un string' })
    @Matches(/^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-\d{4}$/, {
        message: 'proyecto.fechaFin debe tener el formato dd-mm-yyyy'
    })
    fechaFin?: string;

    @ApiProperty({ description: 'Nombre del proyecto', type: String })
    @IsDefined({ message: 'proyecto.nombre es obligatorio' })
    @IsString({ message: 'proyecto.nombre debe ser un string' })
    @IsNotEmpty({ message: 'proyecto.nombre no puede estar vacío' })
    @Length(5, 300, { message: 'proyecto.nombre debe tener entre 5 y 300 caracteres' })
    nombre: string

    @ApiProperty({ description: 'Descripción del proyecto', type: String, nullable: true })
    @IsDefined()
    @IsString({ message: 'proyecto.descripcion debe ser un string' })
    descripcion: string

    @ApiProperty({ description: 'Año de inicio del proyecto', type: Number })
    @IsDefined({ message: 'proyecto.anioInicio es obligatorio' })
    @IsInt({ message: 'proyecto.anioInicio debe ser un número entero' })
    @Min(1, { message: 'proyecto.anioInicio debe ser mayor a 0' })
    anioInicio: number

    @ApiProperty({ description: 'Año de fin del proyecto', type: Number, nullable: true })
    @IsOptional()
    @IsInt({ message: 'proyecto.anioFin debe ser un número entero' })
    @Min(1, { message: 'proyecto.anioFin debe ser mayor a 0' })
    anioFin?: number

    @ApiProperty({ description: 'Tipo del proyecto', type: RegisterTipoDto })
    @IsDefined({ message: 'proyecto.tipo es obligatorio' })
    @ValidateNested()
    @Type(() => RegisterTipoDto)
    tipo: RegisterTipoDto

    @ApiProperty({ description: 'Departamento en el que se ejecuta el proyecto', type: Number })
    @IsDefined({ message: 'proyecto.departamento es obligatorio' })
    @IsInt({ message: 'proyecto.departamento debe ser un número entero' })
    departamento: number

    @ApiProperty({ description: 'Municipios donde se ejecuta el proyecto', type: [RegisterMunicipioTrabajoDto] })
    @IsArray({ message: 'proyecto.municipiosTrabajo debe ser un arreglo' })
    @ArrayNotEmpty({ message: 'proyecto.municipiosTrabajo no puede estar vacío' })
    @ValidateNested({ each: true })
    @Type(() => RegisterMunicipioTrabajoDto)
    municipiosTrabajo: RegisterMunicipioTrabajoDto[]

    @ApiProperty({ description: 'Tipos de ayuda asociados al proyecto', type: RegisterAyudasDto, nullable: true })
    @ValidateNested()
    @Type(() => RegisterAyudasDto)
    ayudas: RegisterAyudasDto

    @ApiProperty({ description: 'Actores locales asociados al proyecto', type: RegisterActoresDto, nullable: true })
    @ValidateNested()
    @Type(() => RegisterActoresDto)
    actores: RegisterActoresDto

    @ApiProperty({ description: 'Área del proyecto', enum: [AreasEnum.conservacion | AreasEnum.desarrollo] })
    @IsDefined({ message: 'proyecto.area es obligatorio' })
    @IsInt()
    @IsIn([AreasEnum.conservacion, AreasEnum.desarrollo], { message: `proyecto.area debe ser: 2 = "desarrollo" o 1 = "conservacion"` })
    area: AreasEnum.conservacion | AreasEnum.desarrollo

    @ApiProperty({ description: 'Datos de conservación (solo si area=conservacion)', type: RegisterConservacionDto, nullable: true })
    @IsOptional()
    @ValidateNested()
    @Type(() => RegisterConservacionDto)
    conservacion?: RegisterConservacionDto

    @ApiProperty({ description: 'Datos de desarrollo (solo si area=desarrollo)', type: RegisterDesarrolloDto, nullable: true })
    @IsOptional()
    @ValidateNested()
    @Type(() => RegisterDesarrolloDto)
    desarrollo?: RegisterDesarrolloDto

    @ApiProperty({ description: 'Latitud WGS84 (rango Bolivia: -23.0 a -9.0)', example: -17.7833, required: false })
    @IsOptional()
    @IsNumber()
    @Min(-23.0)
    @Max(-9.0)
    lat?: number

    @ApiProperty({ description: 'Longitud WGS84 (rango Bolivia: -70.0 a -57.0)', example: -63.1821, required: false })
    @IsOptional()
    @IsNumber()
    @Min(-70.0)
    @Max(-57.0)
    lng?: number
}
