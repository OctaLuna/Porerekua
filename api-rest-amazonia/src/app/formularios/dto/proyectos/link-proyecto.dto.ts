import { ApiProperty } from "@nestjs/swagger";
import { IsDefined, IsInt, IsOptional, IsString, Matches, Min } from "class-validator";

export class LinkProyectoDto {
    @ApiProperty({
        description: 'ID del proyecto existente al que se desea vincular',
        type: Number,
        nullable: false
    })
    @IsDefined({ message: 'linkProyecto.idProyecto es obligatorio' })
    @IsInt({ message: 'linkProyecto.idProyecto debe ser un número entero' })
    @Min(1, { message: 'linkProyecto.idProyecto debe ser mayor a 0' })
    idProyecto: number;

    @ApiProperty({
        description: 'Fecha de inicio de participación en el proyecto (formato dd-MM-yyyy)',
        example: '01-01-2024',
        type: String,
        nullable: false
    })
    @IsDefined({ message: 'linkProyecto.fechaInicio es obligatoria' })
    @IsString({ message: 'linkProyecto.fechaInicio debe ser un string' })
    @Matches(/^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-\d{4}$/, {
        message: 'linkProyecto.fechaInicio debe tener el formato dd-MM-yyyy'
    })
    fechaInicio: string;

    @ApiProperty({
        description: 'Fecha de fin de participación en el proyecto (formato dd-MM-yyyy, opcional)',
        example: '31-12-2024',
        type: String,
        nullable: true
    })
    @IsOptional()
    @IsString({ message: 'linkProyecto.fechaFin debe ser un string' })
    @Matches(/^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-\d{4}$/, {
        message: 'linkProyecto.fechaFin debe tener el formato dd-MM-yyyy'
    })
    fechaFin?: string;
}
