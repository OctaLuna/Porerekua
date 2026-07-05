import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from './entities/usuario.entity';
import { SolicitudAcceso } from './entities/solicitud-acceso.entity';
import { AuthService } from './services/auth.service';
import { SolicitudesService } from './services/solicitudes.service';
import { AuthController } from './controllers/auth.controller';
import { SolicitudesController } from './controllers/solicitudes.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { OptionalJwtAuthGuard } from './guards/optional-jwt.guard';
import { MyJwtConfig } from 'src/infrastructure/config/services/jwt.config';

@Module({
    imports: [
        TypeOrmModule.forFeature([Usuario, SolicitudAcceso]),
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.registerAsync({
            inject: [MyJwtConfig],
            useFactory: (jwtConfig: MyJwtConfig) => {
                const config = jwtConfig.get();
                return {
                    secret: config.secret,
                    signOptions: { expiresIn: config.expiresIn as any },
                };
            },
        }),
    ],
    controllers: [AuthController, SolicitudesController],
    providers: [AuthService, SolicitudesService, JwtStrategy, JwtAuthGuard, RolesGuard, OptionalJwtAuthGuard],
    exports: [JwtAuthGuard, RolesGuard, OptionalJwtAuthGuard, AuthService],
})
export class AuthModule {}
