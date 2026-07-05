import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';

export class ChangePasswordDto {
    @ApiProperty({
        description: 'Contraseña actual del usuario',
        type: String,
        example: 'MiPasswordActual1!',
    })
    @IsString({ message: 'currentPassword debe ser un texto' })
    @IsNotEmpty({ message: 'currentPassword es obligatorio' })
    currentPassword: string;

    @ApiProperty({
        description: 'Nueva contraseña (mínimo 8 caracteres, debe incluir mayúscula, número y símbolo)',
        type: String,
        example: 'NuevoPassword2!',
    })
    @IsString({ message: 'newPassword debe ser un texto' })
    @IsNotEmpty({ message: 'newPassword es obligatorio' })
    @MinLength(8, { message: 'newPassword debe tener al menos 8 caracteres' })
    // OWASP: requiere al menos una mayúscula, un número y un carácter especial
    @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d])/, {
        message: 'newPassword debe contener al menos una mayúscula, un número y un símbolo',
    })
    newPassword: string;
}
