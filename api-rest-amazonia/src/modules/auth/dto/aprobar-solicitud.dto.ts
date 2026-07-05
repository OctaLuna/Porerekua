import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class AprobarSolicitudDto {
    @ApiProperty({
        description: 'Fecha y hora de expiración del acceso del investigador (ISO 8601)',
        type: String,
        example: '2027-06-30T23:59:59Z',
    })
    @IsNotEmpty({ message: 'fechaExpiracionAcceso es obligatorio' })
    @Type(() => Date)
    @IsDate({ message: 'fechaExpiracionAcceso debe ser una fecha válida (ISO 8601)' })
    fechaExpiracionAcceso: Date;

    @ApiProperty({
        description: 'Contraseña temporal asignada al investigador (mínimo 8 caracteres)',
        type: String,
        example: 'TempPass2024!',
    })
    @IsString({ message: 'passwordTemporal debe ser un texto' })
    @IsNotEmpty({ message: 'passwordTemporal es obligatorio' })
    @MinLength(8, { message: 'passwordTemporal debe tener al menos 8 caracteres' })
    @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d])/, {
        message: 'passwordTemporal debe contener al menos una mayúscula, un número y un símbolo',
    })
    passwordTemporal: string;
}
