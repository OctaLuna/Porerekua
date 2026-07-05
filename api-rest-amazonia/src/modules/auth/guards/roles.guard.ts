import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { RoleEnum } from 'src/shared/enums/role.enum';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { MyForbiddenException } from 'src/shared/exceptions';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<RoleEnum[]>(
            ROLES_KEY,
            [context.getHandler(), context.getClass()],
        );

        if (!requiredRoles || requiredRoles.length === 0) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user: JwtPayload = request.user;

        if (!user) {
            throw new MyForbiddenException('Sin permisos para este recurso');
        }

        // Jerarquía: Superadmin(1) > Admin(2) > Investigador(3)
        // user.rol <= rolRequerido → el usuario tiene suficientes permisos
        const hasPermission = requiredRoles.some(
            (requiredRole) => user.rol <= requiredRole,
        );

        if (!hasPermission) {
            throw new MyForbiddenException(
                `Este endpoint requiere rol ${requiredRoles.map((r) => RoleEnum[r]).join(' o ')} o superior`,
            );
        }

        return true;
    }
}
