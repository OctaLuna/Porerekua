import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as ms from 'ms';
import { Usuario } from '../entities/usuario.entity';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { LoginDto } from '../dto/login.dto';
import { RegisterUsuarioDto } from '../dto/register-usuario.dto';
import { UpdateUsuarioDto } from '../dto/update-usuario.dto';
import { UpdatePerfilPropioDto } from '../dto/update-perfil-propio.dto';
import { TokenResponseDto } from '../dto/token-response.dto';
import { UsuarioResponseDto } from '../dto/usuario-response.dto';
import { PaginationResponseDto } from 'src/shared/dto/pagination-response.dto';
import { FilterUsuariosDto } from '../dto/filter-usuarios.dto';
import { RoleEnum } from 'src/shared/enums/role.enum';
import { MyJwtConfig } from 'src/infrastructure/config/services/jwt.config';
import {
    MyUnauthorizedException,
    MyConflictException,
    MyNotFoundException,
    MyForbiddenException,
} from 'src/shared/exceptions';
import { comparePassword, hashPassword } from 'src/shared/utils/crypto.util';
import { buildPagination } from 'src/shared/utils/pagination.util';
import { LogsService } from 'src/modules/logs/services/logs.service';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(Usuario)
        private readonly usuarioRepo: Repository<Usuario>,
        private readonly jwtService: JwtService,
        private readonly jwtConfig: MyJwtConfig,
        private readonly logsService: LogsService,
    ) {}

    // Dummy hash para prevenir timing attacks (OWASP A07 - user enumeration)
    private readonly DUMMY_HASH = '$2b$12$dummyhashfortimingattackprevention.XXXXXXXXXXXXXXXXXX';

    async login(dto: LoginDto): Promise<TokenResponseDto> {
        const usuario = await this.usuarioRepo.findOne({
            where: { email: dto.email },
            select: ['id', 'email', 'passwordHash', 'nombre', 'rol', 'activo', 'fechaExpiracion'],
        });

        // Siempre ejecutar comparePassword para que el tiempo de respuesta sea constante
        // y no revelar si el email existe o no (OWASP A07 - user enumeration prevention)
        const hashToCompare = usuario ? usuario.passwordHash : this.DUMMY_HASH;
        const passwordValido = await comparePassword(dto.password, hashToCompare);

        if (!usuario || !passwordValido) {
            this.logsService.registrar({
                tipo: 'seguridad',
                severidad: 'warn',
                accion: 'LOGIN_FALLIDO',
                detalle: { email: dto.email },
            });
            throw new MyUnauthorizedException('Credenciales inválidas');
        }

        if (!usuario.activo) {
            this.logsService.registrar({
                tipo: 'seguridad',
                severidad: 'warn',
                accion: 'LOGIN_CUENTA_DESACTIVADA',
                usuarioId: usuario.id,
                detalle: { email: dto.email },
            });
            throw new MyUnauthorizedException('Cuenta desactivada');
        }

        if (usuario.fechaExpiracion && new Date() > new Date(usuario.fechaExpiracion)) {
            this.logsService.registrar({
                tipo: 'seguridad',
                severidad: 'warn',
                accion: 'LOGIN_ACCESO_EXPIRADO',
                usuarioId: usuario.id,
                detalle: { email: dto.email },
            });
            throw new MyUnauthorizedException('Tu acceso ha expirado');
        }

        const payload: JwtPayload = {
            sub: usuario.id,
            email: usuario.email,
            rol: usuario.rol,
            nombre: usuario.nombre,
            fechaExpiracion: usuario.fechaExpiracion
                ? usuario.fechaExpiracion.toISOString()
                : null,
        };

        const accessToken = this.jwtService.sign(payload);
        const config = this.jwtConfig.get();

        this.logsService.registrar({
            tipo: 'seguridad',
            severidad: 'info',
            accion: 'LOGIN_EXITOSO',
            usuarioId: usuario.id,
            detalle: { email: usuario.email, rol: usuario.rol },
        });

        return {
            accessToken,
            tipo: 'Bearer',
            expiresIn: config.expiresIn,
        };
    }

    async me(payload: JwtPayload): Promise<UsuarioResponseDto> {
        const usuario = await this.usuarioRepo.findOne({ where: { id: payload.sub } });
        if (!usuario) {
            throw new MyNotFoundException('Usuario no encontrado');
        }
        return this.toResponse(usuario);
    }

    async register(dto: RegisterUsuarioDto, currentUser: JwtPayload): Promise<UsuarioResponseDto> {
        // Admin solo puede crear Admin; Superadmin puede crear cualquier rol
        if (currentUser.rol === RoleEnum.Admin && dto.rol === RoleEnum.Superadmin) {
            throw new MyForbiddenException('Un Admin no puede crear usuarios con rol Superadmin');
        }

        const existente = await this.usuarioRepo.findOne({ where: { email: dto.email } });
        if (existente) {
            throw new MyConflictException(`Ya existe un usuario con el email ${dto.email}`);
        }

        const passwordHash = await hashPassword(dto.password);
        const usuario = this.usuarioRepo.create({
            email: dto.email,
            nombre: dto.nombre,
            passwordHash,
            rol: dto.rol,
            activo: true,
            fechaExpiracion: null,
        });

        const guardado = await this.usuarioRepo.save(usuario);

        this.logsService.registrar({
            tipo: 'seguridad',
            severidad: 'info',
            accion: 'USUARIO_CREADO',
            usuarioId: currentUser.sub,
            detalle: { emailNuevo: guardado.email, rolNuevo: guardado.rol, creadoPor: currentUser.email },
        });

        return this.toResponse(guardado);
    }

    async findAll(params: FilterUsuariosDto): Promise<PaginationResponseDto<UsuarioResponseDto>> {
        const { page, limit } = params;

        const qb = this.usuarioRepo
            .createQueryBuilder('u')
            .orderBy('u.createdAt', 'DESC');

        if (params.rol !== undefined) {
            qb.andWhere('u.rol = :rol', { rol: params.rol });
        }

        if (params.activo !== undefined) {
            qb.andWhere('u.activo = :activo', { activo: params.activo });
        }

        if (params.search) {
            qb.andWhere(
                '(u.nombre ILIKE :search OR u.email ILIKE :search)',
                { search: `%${params.search}%` },
            );
        }

        const [usuarios, total] = await qb
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();

        return buildPagination(usuarios.map((u) => this.toResponse(u)), total, page, limit);
    }

    async findOneById(id: number): Promise<UsuarioResponseDto> {
        const usuario = await this.usuarioRepo.findOne({ where: { id } });
        if (!usuario) {
            throw new MyNotFoundException('Usuario no encontrado');
        }
        return this.toResponse(usuario);
    }

    async update(id: number, dto: UpdateUsuarioDto, currentUser: JwtPayload): Promise<UsuarioResponseDto> {
        const usuario = await this.usuarioRepo.findOne({ where: { id } });
        if (!usuario) {
            throw new MyNotFoundException('Usuario no encontrado');
        }

        if (dto.rol === RoleEnum.Superadmin && currentUser.rol !== RoleEnum.Superadmin) {
            throw new MyForbiddenException('Solo un Superadmin puede asignar el rol Superadmin');
        }

        if (dto.nombre !== undefined) usuario.nombre = dto.nombre;
        if (dto.rol !== undefined) usuario.rol = dto.rol;

        const rolAnterior = usuario.rol;
        const activoAnterior = usuario.activo;

        if (dto.activo !== undefined) {
            // Si se desactiva la cuenta, revocar todos los tokens anteriores
            if (dto.activo === false && usuario.activo === true) {
                usuario.tokenValidFrom = new Date();
            }
            usuario.activo = dto.activo;
        }

        const actualizado = await this.usuarioRepo.save(usuario);

        if (dto.rol !== undefined && dto.rol !== rolAnterior) {
            this.logsService.registrar({
                tipo: 'seguridad',
                severidad: 'critico',
                accion: 'ROL_CAMBIADO',
                usuarioId: currentUser.sub,
                detalle: { usuarioAfectado: id, rolAnterior, rolNuevo: dto.rol, cambiadoPor: currentUser.email },
            });
        }

        if (dto.activo !== undefined && dto.activo !== activoAnterior) {
            this.logsService.registrar({
                tipo: 'seguridad',
                severidad: dto.activo ? 'info' : 'critico',
                accion: dto.activo ? 'CUENTA_ACTIVADA' : 'CUENTA_DESACTIVADA',
                usuarioId: currentUser.sub,
                detalle: { usuarioAfectado: id, cambiadoPor: currentUser.email },
            });
        }

        return this.toResponse(actualizado);
    }

    async updateMe(dto: UpdatePerfilPropioDto, currentUser: JwtPayload): Promise<UsuarioResponseDto> {
        const usuario = await this.usuarioRepo.findOne({ where: { id: currentUser.sub } });
        if (!usuario) {
            throw new MyNotFoundException('Usuario no encontrado');
        }
        // El usuario no puede cambiar su propio rol desde este endpoint
        if (dto.nombre !== undefined) usuario.nombre = dto.nombre;
        const actualizado = await this.usuarioRepo.save(usuario);
        return this.toResponse(actualizado);
    }

    async changePassword(currentPasswordPlain: string, newPasswordPlain: string, currentUser: JwtPayload): Promise<void> {
        const usuario = await this.usuarioRepo.findOne({
            where: { id: currentUser.sub },
            select: ['id', 'passwordHash', 'tokenValidFrom'],
        });
        if (!usuario) {
            throw new MyNotFoundException('Usuario no encontrado');
        }

        // Verificar contraseña actual antes de cambiarla
        const passwordValido = await comparePassword(currentPasswordPlain, usuario.passwordHash);
        if (!passwordValido) {
            throw new MyUnauthorizedException('La contraseña actual es incorrecta');
        }

        usuario.passwordHash = await hashPassword(newPasswordPlain);
        // Revocar todos los tokens anteriores al cambio de contraseña
        usuario.tokenValidFrom = new Date();
        await this.usuarioRepo.save(usuario);
    }

    async delete(id: number, currentUser: JwtPayload): Promise<void> {
        if (id === currentUser.sub) {
            throw new MyForbiddenException('No puedes eliminar tu propia cuenta');
        }

        const usuario = await this.usuarioRepo.findOne({ where: { id } });
        if (!usuario) {
            throw new MyNotFoundException('Usuario no encontrado');
        }

        await this.usuarioRepo.remove(usuario);

        this.logsService.registrar({
            tipo: 'seguridad',
            severidad: 'critico',
            accion: 'USUARIO_ELIMINADO',
            usuarioId: currentUser.sub,
            detalle: { usuarioEliminado: id, email: usuario.email, eliminadoPor: currentUser.email },
        });
    }

    parseExpiresInMs(expiresIn: string): number {
        return ms(expiresIn as Parameters<typeof ms>[0]) ?? 86400000;
    }

    private toResponse(usuario: Usuario): UsuarioResponseDto {
        return {
            id: usuario.id,
            email: usuario.email,
            nombre: usuario.nombre,
            rol: usuario.rol,
            activo: usuario.activo,
            fechaExpiracion: usuario.fechaExpiracion,
            createdAt: usuario.createdAt,
            updatedAt: usuario.updatedAt,
        };
    }
}
