import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MyJwtConfig } from 'src/infrastructure/config/services/jwt.config';
import { MyUnauthorizedException } from 'src/shared/exceptions';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
    constructor(private readonly jwtConfig: MyJwtConfig) {
        super();
    }

    canActivate(context: ExecutionContext) {
        if (!this.jwtConfig.get().isActive) {
            return true;
        }
        const request = context.switchToHttp().getRequest<{ headers: { authorization?: string } }>();
        if (!request.headers.authorization) {
            return true;
        }
        return super.canActivate(context);
    }

    handleRequest(err: any, user: any) {
        if (err || !user) {
            throw new MyUnauthorizedException('Token inválido o expirado');
        }
        return user;
    }
}
