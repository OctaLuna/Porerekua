import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { Repository } from 'typeorm';
import { MyJwtConfig } from 'src/infrastructure/config/services/jwt.config';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { MyUnauthorizedException } from 'src/shared/exceptions/my-unauthorized.exception';
import { Usuario } from '../entities/usuario.entity';

const COOKIE_NAME = 'porerekua_token';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly jwtConfig: MyJwtConfig,
        @InjectRepository(Usuario)
        private readonly usuarioRepo: Repository<Usuario>,
    ) {
        const config = jwtConfig.get();
        super({
            // Prioridad: cookie httpOnly primero (browser), luego Bearer header (API clients/Swagger)
            jwtFromRequest: ExtractJwt.fromExtractors([
                (req: Request) => req?.cookies?.[COOKIE_NAME] ?? null,
                ExtractJwt.fromAuthHeaderAsBearerToken(),
            ]),
            ignoreExpiration: false,
            secretOrKey: config.secret,
        });
    }

    async validate(payload: JwtPayload): Promise<JwtPayload> {
        // 1. Verificar expiración de acceso del investigador (campo en el payload)
        if (payload.fechaExpiracion) {
            if (new Date() > new Date(payload.fechaExpiracion)) {
                throw new MyUnauthorizedException('Tu acceso como investigador ha expirado');
            }
        }

        // 2. Verificar en BD que el usuario sigue activo y que el token no fue revocado
        const usuario = await this.usuarioRepo.findOne({
            where: { id: payload.sub },
            select: ['id', 'activo', 'tokenValidFrom'],
        });

        if (!usuario || !usuario.activo) {
            throw new MyUnauthorizedException('Cuenta desactivada o no encontrada');
        }

        // 3. Si tokenValidFrom está definido, verificar que el token fue emitido después
        // payload.iat está en segundos (epoch); tokenValidFrom es un Date
        if (usuario.tokenValidFrom && payload.iat !== undefined) {
            const tokenEmitidoEn = payload.iat * 1000; // convertir a ms
            if (tokenEmitidoEn < usuario.tokenValidFrom.getTime()) {
                throw new MyUnauthorizedException('Token revocado. Vuelve a iniciar sesión.');
            }
        }

        return payload;
    }
}
