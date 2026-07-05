import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
    @ApiProperty({
        description: 'Correo electrónico del usuario',
        type: String,
        example: 'admin@kaaiya.bo',
    })
    @IsEmail({}, { message: 'email debe ser un correo electrónico válido' })
    @IsNotEmpty({ message: 'email es obligatorio' })
    email: string;

    @ApiProperty({
        description: 'Contraseña del usuario',
        type: String,
        example: 'MiPassword1!',
    })
    @IsString({ message: 'password debe ser un texto' })
    @IsNotEmpty({ message: 'password es obligatorio' })
    @MinLength(6, { message: 'password debe tener al menos 6 caracteres' })
    password: string;
}
