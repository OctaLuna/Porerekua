import { ApiProperty } from "@nestjs/swagger";
import { ArrayMinSize, ArrayNotEmpty, IsArray, IsDefined, IsInt, IsNotEmpty, IsObject, IsOptional, IsString, Length, Min, ValidateNested } from "class-validator";
import { RegisterFormaJuridicaDto } from "./register-forma-juridica.dto";
import { RegisterApoyosDto } from "./register-apoyos.dto";
import { RegisterMotivosApoyosDto } from "./register-motivos-apoyos.dto";
import { RegisterProyectosDto } from "../proyectos/register-proyectos.dto";
import { LinkProyectoDto } from "../proyectos/link-proyecto.dto";
import { Type } from "class-transformer";

export class RegisterFormularioEmpresaDto {

    @ApiProperty({
        description: 'Nombre de la empresa',
        type: String,
        nullable: false,
    })
    @IsDefined({ message: 'empresa.nombre es obligatorio' })
    @IsString({ message: 'empresa.nombre debe ser un texto' })
    @IsNotEmpty({ message: 'empresa.nombre no puede estar vacío' })
    @Length(5, 100, { message: 'empresa.nombre debe tener entre 5 y 100 caracteres' })
    nombre: string;

    @ApiProperty({
        description: 'Forma juridica',
        type: RegisterFormaJuridicaDto,
        nullable: false,
    })
    @IsDefined({ message: 'empresa.formaJuridica es obligatorio' })
    @ValidateNested({ message: 'empresa.formaJuridica contiene errores internos' })
    @Type(() => RegisterFormaJuridicaDto)
    formaJuridica: RegisterFormaJuridicaDto;

    @ApiProperty({
        description: 'Ids de departamentos',
        type: [Number],
        nullable: false
    })
    @IsArray({ message: 'empresa.departamentos debe ser un array' })
    @ArrayNotEmpty({ message: 'empresa.departamentos no puede estar vacío' })
    @IsInt({ each: true, message: 'cada elemento de empresa.departamentos debe ser un número entero' })
    departamentos: number[];

    @ApiProperty({
        description: 'Anio en que se inicio de apoyo a la amazonia',
        type: Number,
        nullable: false
    })
    @IsDefined({ message: 'empresa.anioInicioApoyo es obligatorio' })
    @IsInt({ message: 'empresa.anioInicioApoyo debe ser un número entero' })
    @Min(1, { message: 'empresa.anioInicioApoyo debe ser mayor o igual a 1' })
    anioInicioApoyo: number;

    @ApiProperty({
        description: 'Apoyos de la empresa',
        type: RegisterApoyosDto,
        nullable: false
    })
    @IsDefined({ message: 'empresa.apoyos es obligatorio' })
    @ValidateNested({ message: 'empresa.apoyos contiene errores internos' })
    @Type(() => RegisterApoyosDto)
    apoyos: RegisterApoyosDto;

    @ApiProperty({
        description: 'Organizaciones con la que tiene alianza',
        type: [String],
        nullable: true,
    })
    @IsOptional()
    @IsArray({ message: 'empresa.organizaciones debe ser un array' })
    @IsString({ each: true, message: 'cada elemento de empresa.organizaciones debe ser un texto' })
    @Length(3, 300, { each: true, message: 'cada elemento de empresa.organizaciones debe tener entre 3 y 300 caracteres' })
    organizaciones?: string[];

    @ApiProperty({
        description: 'Motivos de una empresa para apoyar a una empresa',
        type: RegisterMotivosApoyosDto,
        nullable: true
    })
    @IsDefined({ message: 'empresa.motivosApoyo es obligatorio' })
    @ValidateNested({ message: 'empresa.motivosApoyo contiene errores internos' })
    @Type(() => RegisterMotivosApoyosDto)
    motivosApoyo: RegisterMotivosApoyosDto;

    @ApiProperty({
        description: 'Ids del los ods de la empresa',
        type: [Number],
        nullable: false
    })
    @IsDefined({ message: 'empresa.ods es obligatorio' })
    @IsArray({ message: 'empresa.ods debe ser un array' })
    @ArrayMinSize(1, { message: 'empresa.ods debe tener al menos 1 elemento' })
    @IsInt({ each: true, message: 'cada elemento de empresa.ods debe ser un número entero' })
    @Min(1, { each: true, message: 'cada elemento de empresa.ods debe ser mayor o igual a 1' })
    ods: number[];

    @ApiProperty({
        description: 'Proyectos asociados a la empresa',
        type: [RegisterProyectosDto],
        nullable: true
    })
    @IsOptional()
    @IsArray({ message: 'empresa.proyectos debe ser un array' })
    @ArrayMinSize(1, { message: 'empresa.proyectos debe tener al menos 1 proyecto si se envía' })
    @ValidateNested({  message: 'empresa.proyectos contiene errores internos' })
    @Type(() => RegisterProyectosDto)
    proyectos?: RegisterProyectosDto[];

    @ApiProperty({
        description: 'Proyectos existentes a los que se vincula la empresa (sin crear nuevos)',
        type: [LinkProyectoDto],
        nullable: true
    })
    @IsOptional()
    @IsArray({ message: 'empresa.proyectosExistentes debe ser un array' })
    @ArrayMinSize(1, { message: 'empresa.proyectosExistentes debe tener al menos 1 elemento si se envía' })
    @ValidateNested({ each: true, message: 'empresa.proyectosExistentes contiene errores internos' })
    @Type(() => LinkProyectoDto)
    proyectosExistentes?: LinkProyectoDto[];
}