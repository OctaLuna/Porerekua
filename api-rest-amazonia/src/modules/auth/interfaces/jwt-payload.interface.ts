import { RoleEnum } from 'src/shared/enums/role.enum';

export interface JwtPayload {
    sub: number;
    email: string;
    rol: RoleEnum;
    nombre: string;
    fechaExpiracion: string | null;
    iat?: number;
    exp?: number;
}
