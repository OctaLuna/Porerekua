import { ApiProperty } from "@nestjs/swagger";
import { IsDefined, IsInt, IsNotEmpty, IsString, Length, Min, IsBoolean, ValidateNested, IsOptional, IsArray, ArrayMinSize } from "class-validator";
import { RegisterProyectosDto } from "../proyectos/register-proyectos.dto";
import { LinkProyectoDto } from "../proyectos/link-proyecto.dto";
import { Type } from "class-transformer";

export class RegisterTipoDto {
    @ApiProperty({
        description: 'ID del tipo de organización',
        type: Number,
        nullable: true
    })
    @IsOptional()
    @IsInt({ message: 'organizacion.tipo.id debe ser un número entero' })
    @Min(1, { message: 'organizacion.tipo.id debe ser mayor a 0' })
    id?: number

    @ApiProperty({
        description: 'Otro tipo de organización si no se selecciona un ID',
        type: String,
        nullable: true
    })
    @IsOptional()
    @IsString({ message: 'organizacion.tipo.otro debe ser un string' })
    @IsNotEmpty({ message: 'organizacion.tipo.otro no puede estar vacío' })
    @Length(3, 100, { message: 'organizacion.tipo.otro debe tener entre 3 y 100 caracteres' })
    otro?: string
}

export class RegisterFormularioOrganizacionDto {
    @ApiProperty({
        description: 'Nombre de la organización',
        type: String,
        nullable: false
    })
    @IsDefined()
    @IsString({ message: 'organizacion.nombre debe ser un string' })
    @IsNotEmpty({ message: 'organizacion.nombre no puede estar vacío' })
    @Length(3, 100, { message: 'organizacion.nombre debe tener entre 3 y 100 caracteres' })
    nombre: string

    @ApiProperty({
        description: 'ID del departamento que es sede central',
        type: Number,
        nullable: false
    })
    @IsDefined()
    @IsInt({ message: 'organizacion.idDepartamento debe ser un número entero' })
    @Min(1, { message: 'organizacion.idDepartamento debe ser mayor a 0' })
    idDepartamento: number

    @ApiProperty({
        description: 'Indica si es nacional (true) o internacional (false)',
        type: Boolean,
        nullable: false
    })
    @IsDefined()
    @IsBoolean({ message: 'organizacion.esNacional debe ser booleano' })
    esNacional: boolean

    @ApiProperty({
        description: 'Tipo de organización',
        type: RegisterTipoDto,
        nullable: false
    })
    @IsDefined()
    @ValidateNested()
    tipo: RegisterTipoDto

    @ApiProperty({
        description: 'Año en que se inició el trabajo de la organización',
        type: Number,
        nullable: false
    })
    @IsDefined()
    @IsInt({ message: 'organizacion.anioInicioTrabajo debe ser un número entero' })
    @Min(1900, { message: 'organizacion.anioInicioTrabajo no puede ser menor a 1900' })
    anioInicioTrabajo: number

    @ApiProperty({
        description: 'Proyectos asociados a la organización',
        type: [RegisterProyectosDto],
        nullable: true
    })
    @IsOptional()
    @IsArray({ message: 'organizacion.proyectos debe ser un array' })
    @ValidateNested({ each: true })
    @Type(() => RegisterProyectosDto)
    proyectos?: RegisterProyectosDto[]

    @ApiProperty({
        description: 'Proyectos existentes a los que se vincula la organización (sin crear nuevos)',
        type: [LinkProyectoDto],
        nullable: true
    })
    @IsOptional()
    @IsArray({ message: 'organizacion.proyectosExistentes debe ser un array' })
    @ArrayMinSize(1, { message: 'organizacion.proyectosExistentes debe tener al menos 1 elemento si se envía' })
    @ValidateNested({ each: true, message: 'organizacion.proyectosExistentes contiene errores internos' })
    @Type(() => LinkProyectoDto)
    proyectosExistentes?: LinkProyectoDto[]
}
