import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsString, Length, Matches, MinLength } from 'class-validator';
import { RoleEnum } from 'src/shared/enums/role.enum';

export class RegisterUsuarioDto {
    @ApiProperty({
        description: 'Correo electrónico del nuevo usuario',
        type: String,
        example: 'nuevo.admin@kaaiya.bo',
    })
    @IsEmail({}, { message: 'email debe ser un correo electrónico válido' })
    @IsNotEmpty({ message: 'email es obligatorio' })
    email: string;

    @ApiProperty({
        description: 'Nombre completo del usuario',
        type: String,
        example: 'Juan Pérez',
    })
    @IsString({ message: 'nombre debe ser un texto' })
    @IsNotEmpty({ message: 'nombre es obligatorio' })
    @Length(2, 150, { message: 'nombre debe tener entre 2 y 150 caracteres' })
    nombre: string;

    @ApiProperty({
        description: 'Contraseña inicial del usuario',
        type: String,
        example: 'Password123!',
    })
    @IsString({ message: 'password debe ser un texto' })
    @IsNotEmpty({ message: 'password es obligatorio' })
    @MinLength(8, { message: 'password debe tener al menos 8 caracteres' })
    // OWASP: requiere al menos una mayúscula, un número y un carácter especial
    @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d])/, {
        message: 'password debe contener al menos una mayúscula, un número y un símbolo',
    })
    password: string;

    @ApiProperty({
        description: 'Rol asignado al usuario. Admin solo puede crear Admin (2). Superadmin puede crear cualquier rol.',
        enum: RoleEnum,
        example: RoleEnum.Admin,
    })
    @IsEnum(RoleEnum, { message: 'rol debe ser un valor válido del enum RoleEnum' })
    rol: RoleEnum;
}
