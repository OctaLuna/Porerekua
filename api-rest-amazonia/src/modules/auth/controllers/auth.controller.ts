import { Body, Controller, Delete, Get, HttpStatus, Param, ParseIntPipe, Patch, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiConflictResponse,
    ApiCreatedResponse,
    ApiForbiddenResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiQuery,
    ApiResponse,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Response } from 'express';
import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dto/login.dto';
import { RegisterUsuarioDto } from '../dto/register-usuario.dto';
import { UpdateUsuarioDto } from '../dto/update-usuario.dto';
import { UpdatePerfilPropioDto } from '../dto/update-perfil-propio.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { TokenResponseDto } from '../dto/token-response.dto';
import { UsuarioResponseDto } from '../dto/usuario-response.dto';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';
import { RoleEnum } from 'src/shared/enums/role.enum';
import { PaginationResponseDto } from 'src/shared/dto/pagination-response.dto';
import { FilterUsuariosDto } from '../dto/filter-usuarios.dto';
import {
    OkRes,
    CreatedRes,
    SwaggerBadRequestCommon,
    SwaggerUnauthorizedCommon,
    SwaggerForbiddenCommon,
    SwaggerNotFoundCommon,
    SwaggerConflictCommon,
    SwaggerTooManyRequestsCommon,
} from 'src/shared/utils';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    // ──────────────────────────────────────────────────────────────
    // GRUPO: Auth — Público
    // ──────────────────────────────────────────────────────────────

    @Post('login')
    @ApiTags('Auth — Público')
    @Throttle({ default: { limit: 5, ttl: 60000 } })
    @ApiOperation({
        summary: 'Iniciar sesión',
        description:
            '🔓 **Acceso público — sin token requerido.**\n\n' +
            'Valida email y contraseña y devuelve un token JWT. Además setea una cookie `porerekua_token` httpOnly + Secure para clientes browser.\n\n' +
            '**Uso del token (clientes no-browser):** incluir `Authorization: Bearer <accessToken>` en peticiones protegidas.\n\n' +
            '**Seguridad:**\n' +
            '- El tiempo de respuesta es constante para prevenir enumeración de usuarios (OWASP A07).\n' +
            '- **Rate limiting:** máximo 5 intentos por IP cada 60 segundos. Superar devuelve `429`.\n' +
            '- La cookie es `httpOnly` (no accesible por JS) y `SameSite=Strict` (protección CSRF).',
    })
    @ApiCreatedResponse({
        type: TokenResponseDto,
        description: 'Login exitoso. Devuelve el token JWT y setea cookie httpOnly.',
    })
    @ApiBadRequestResponse(SwaggerBadRequestCommon())
    @ApiUnauthorizedResponse({
        description: 'Credenciales inválidas, cuenta desactivada o acceso expirado (investigadores).',
    })
    @ApiResponse({ status: HttpStatus.TOO_MANY_REQUESTS, ...SwaggerTooManyRequestsCommon() })
    async login(@Body() dto: LoginDto, @Res() res: Response) {
        const result = await this.authService.login(dto);
        const isProd = process.env.NODE_ENV === 'production';
        const maxAgeMs = this.authService.parseExpiresInMs(result.expiresIn);
        res.cookie('porerekua_token', result.accessToken, {
            httpOnly: true,
            secure: isProd,
            sameSite: 'strict',
            maxAge: maxAgeMs,
            path: '/',
        });
        return CreatedRes(res, result);
    }

    // ──────────────────────────────────────────────────────────────
    // GRUPO: Auth — Usuario Autenticado
    // ──────────────────────────────────────────────────────────────

    @Post('logout')
    @ApiTags('Auth — Usuario Autenticado')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @ApiOperation({
        summary: 'Cerrar sesión',
        description:
            '🔒 **Requiere token válido (cualquier rol).**\n\n' +
            'Limpia la cookie `porerekua_token` del navegador.\n\n' +
            '**Nota:** para clientes no-browser (Bearer header), el token JWT sigue siendo técnicamente válido hasta su expiración natural. ' +
            'Para invalidación inmediata en servidor, usar la funcionalidad de desactivación de cuenta.',
    })
    @ApiOkResponse({ description: 'Sesión cerrada. Cookie eliminada.' })
    @ApiUnauthorizedResponse(SwaggerUnauthorizedCommon())
    async logout(@Res() res: Response) {
        res.clearCookie('porerekua_token', { path: '/' });
        return OkRes(res, { message: 'Sesión cerrada.' });
    }

    @Get('me')
    @ApiTags('Auth — Usuario Autenticado')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @ApiOperation({
        summary: 'Obtener perfil propio',
        description:
            '🔒 **Requiere token válido (cualquier rol).**\n\n' +
            'Devuelve los datos del perfil del usuario autenticado a partir del token JWT.\n\n' +
            '**Campos devueltos:** `id`, `email`, `nombre`, `rol` (1=Superadmin, 2=Admin, 3=Investigador), `activo`, `fechaExpiracion` (null para Superadmin y Admin), `createdAt`, `updatedAt`.\n\n' +
            '**Nunca se devuelve:** `passwordHash` ni ninguna credencial.',
    })
    @ApiOkResponse({
        type: UsuarioResponseDto,
        description: 'Perfil completo del usuario autenticado.',
    })
    @ApiUnauthorizedResponse(SwaggerUnauthorizedCommon())
    async me(@CurrentUser() user: JwtPayload, @Res() res: Response) {
        const result = await this.authService.me(user);
        return OkRes(res, { usuario: result });
    }

    @Put('me')
    @ApiTags('Auth — Usuario Autenticado')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @ApiOperation({
        summary: 'Actualizar perfil propio',
        description:
            '🔒 **Requiere token válido (cualquier rol).**\n\n' +
            'Permite al usuario actualizar su propio perfil.\n\n' +
            '**Restricción:** solo se puede modificar el `nombre`. El `rol` y el estado `activo` no son editables desde este endpoint — esos campos son gestionados exclusivamente por Admin.',
    })
    @ApiOkResponse({
        type: UsuarioResponseDto,
        description: 'Perfil actualizado exitosamente.',
    })
    @ApiBadRequestResponse(SwaggerBadRequestCommon())
    @ApiUnauthorizedResponse(SwaggerUnauthorizedCommon())
    async updateMe(
        @Body() dto: UpdatePerfilPropioDto,
        @CurrentUser() user: JwtPayload,
        @Res() res: Response,
    ) {
        const result = await this.authService.updateMe(dto, user);
        return OkRes(res, { usuario: result });
    }

    @Post('change-password')
    @ApiTags('Auth — Usuario Autenticado')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @ApiOperation({
        summary: 'Cambiar contraseña propia',
        description:
            '🔒 **Requiere token válido (cualquier rol).**\n\n' +
            'Permite cambiar la contraseña verificando primero la contraseña actual.\n\n' +
            '**Reglas de la nueva contraseña:**\n' +
            '- Mínimo 8 caracteres\n' +
            '- Al menos una mayúscula\n' +
            '- Al menos un número\n' +
            '- Al menos un símbolo (por ejemplo: ! @ # $)\n\n' +
            '**Nota:** las sesiones activas con el token anterior siguen siendo válidas hasta que expiren de forma natural (TTL del JWT). ' +
            'Para invalidación inmediata se requiere implementar blacklist de tokens (backlog).',
    })
    @ApiOkResponse({ description: 'Contraseña cambiada exitosamente.' })
    @ApiBadRequestResponse(SwaggerBadRequestCommon())
    @ApiUnauthorizedResponse({
        description: '401: token inválido/expirado, o la contraseña actual es incorrecta.',
    })
    async changePassword(
        @Body() dto: ChangePasswordDto,
        @CurrentUser() user: JwtPayload,
        @Res() res: Response,
    ) {
        await this.authService.changePassword(dto.currentPassword, dto.newPassword, user);
        return OkRes(res, { message: 'Contraseña cambiada exitosamente' });
    }

    // ──────────────────────────────────────────────────────────────
    // GRUPO: Auth — Admin
    // ──────────────────────────────────────────────────────────────

    @Post('register')
    @ApiTags('Auth — Admin')
    @Throttle({ default: { limit: 10, ttl: 60000 } })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleEnum.Admin)
    @ApiBearerAuth('access-token')
    @ApiOperation({
        summary: 'Crear nuevo usuario (Admin o Superadmin)',
        description:
            '🔒 **Requiere rol: Admin o Superadmin.**\n\n' +
            'Crea un nuevo usuario con rol Admin (2) o Superadmin (1).\n\n' +
            '**Reglas de creación de usuarios:**\n' +
            '- Un `Admin` solo puede crear usuarios con rol `Admin` (2). Intentar crear un `Superadmin` devuelve `403`.\n' +
            '- Un `Superadmin` puede crear usuarios con cualquier rol.\n' +
            '- Los `Investigadores` se crean únicamente a través del flujo de solicitud de acceso (`POST /auth/solicitar-acceso` → aprobación).\n\n' +
            '**Reglas de contraseña:**\n' +
            '- Mínimo 8 caracteres, al menos una mayúscula, un número y un símbolo.\n\n' +
            '**Rate limiting:** máximo 10 creaciones por IP cada 60 segundos.',
    })
    @ApiCreatedResponse({
        type: UsuarioResponseDto,
        description: 'Usuario creado exitosamente. Devuelve el perfil sin contraseña.',
    })
    @ApiBadRequestResponse(SwaggerBadRequestCommon())
    @ApiUnauthorizedResponse(SwaggerUnauthorizedCommon())
    @ApiForbiddenResponse({
        description: '403: rol insuficiente, o Admin intentando crear Superadmin.',
    })
    @ApiConflictResponse(SwaggerConflictCommon())
    @ApiResponse({ status: HttpStatus.TOO_MANY_REQUESTS, ...SwaggerTooManyRequestsCommon() })
    async register(
        @Body() dto: RegisterUsuarioDto,
        @CurrentUser() user: JwtPayload,
        @Res() res: Response,
    ) {
        const result = await this.authService.register(dto, user);
        return CreatedRes(res, { usuario: result });
    }

    @Get('usuarios')
    @ApiTags('Auth — Admin')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleEnum.Admin)
    @ApiBearerAuth('access-token')
    @ApiOperation({
        summary: 'Listar usuarios con filtros y paginación',
        description:
            '🔒 **Requiere rol: Admin o Superadmin.**\n\n' +
            'Devuelve el listado paginado de usuarios con filtros opcionales.\n\n' +
            '**Filtros disponibles:**\n' +
            '- `?rol=1` — Superadmin | `?rol=2` — Admin | `?rol=3` — Investigador\n' +
            '- `?activo=true` — solo activos | `?activo=false` — solo inactivos\n' +
            '- `?search=texto` — busca por nombre o email (parcial, insensible a mayúsculas)\n\n' +
            '**Ejemplos:** `?rol=3&activo=true` → investigadores activos · `?search=Juan` → usuarios que contienen "Juan" en nombre o email\n\n' +
            '**Paginación:** `?page=1&limit=10`. Límite máximo: 100.',
    })
    @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
    @ApiQuery({ name: 'limit', required: false, type: Number, example: 10, description: 'Máximo 100' })
    @ApiQuery({ name: 'rol', required: false, enum: RoleEnum, description: '1=Superadmin, 2=Admin, 3=Investigador' })
    @ApiQuery({ name: 'activo', required: false, type: Boolean, description: 'true=activos, false=inactivos' })
    @ApiQuery({ name: 'search', required: false, type: String, description: 'Busca en nombre y email' })
    @ApiOkResponse({ type: PaginationResponseDto, description: 'Listado paginado de usuarios.' })
    @ApiUnauthorizedResponse(SwaggerUnauthorizedCommon())
    @ApiForbiddenResponse(SwaggerForbiddenCommon())
    async findAll(@Query() params: FilterUsuariosDto, @Res() res: Response) {
        const result = await this.authService.findAll(params);
        return OkRes(res, result);
    }

    @Get('usuarios/:id')
    @ApiTags('Auth — Admin')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleEnum.Admin)
    @ApiBearerAuth('access-token')
    @ApiOperation({
        summary: 'Obtener detalle de un usuario por ID',
        description:
            '🔒 **Requiere rol: Admin o Superadmin.**\n\n' +
            'Devuelve el perfil completo de un usuario específico.\n\n' +
            '**Campos devueltos:** `id`, `email`, `nombre`, `rol`, `activo`, `fechaExpiracion`, `createdAt`, `updatedAt`.\n\n' +
            '**Nunca se devuelve:** `passwordHash` ni `tokenValidFrom`.',
    })
    @ApiOkResponse({ type: UsuarioResponseDto, description: 'Perfil del usuario solicitado.' })
    @ApiUnauthorizedResponse(SwaggerUnauthorizedCommon())
    @ApiForbiddenResponse(SwaggerForbiddenCommon())
    @ApiNotFoundResponse(SwaggerNotFoundCommon())
    async findOne(
        @Param('id', ParseIntPipe) id: number,
        @Res() res: Response,
    ) {
        const result = await this.authService.findOneById(id);
        return OkRes(res, { usuario: result });
    }

    @Patch('usuarios/:id')
    @ApiTags('Auth — Admin')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleEnum.Admin)
    @ApiBearerAuth('access-token')
    @ApiOperation({
        summary: 'Actualizar datos de un usuario',
        description:
            '🔒 **Requiere rol: Admin o Superadmin.**\n\n' +
            'Permite modificar `nombre`, `activo` y `rol` de cualquier usuario.\n\n' +
            '**Restricciones:**\n' +
            '- Solo un `Superadmin` puede asignar el rol `Superadmin` (1). Si un `Admin` intenta asignarlo, recibe `403`.\n' +
            '- Cambiar `activo` a `false` desactiva la cuenta. El usuario no podrá hacer login hasta que se reactive.\n' +
            '- Los tokens JWT existentes del usuario desactivado siguen siendo válidos hasta su expiración natural (el logout forzado requiere blacklist — backlog).',
    })
    @ApiOkResponse({
        type: UsuarioResponseDto,
        description: 'Usuario actualizado exitosamente.',
    })
    @ApiBadRequestResponse(SwaggerBadRequestCommon())
    @ApiUnauthorizedResponse(SwaggerUnauthorizedCommon())
    @ApiForbiddenResponse({
        description: '403: rol insuficiente, o Admin intentando asignar rol Superadmin.',
    })
    @ApiNotFoundResponse(SwaggerNotFoundCommon())
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateUsuarioDto,
        @CurrentUser() user: JwtPayload,
        @Res() res: Response,
    ) {
        const result = await this.authService.update(id, dto, user);
        return OkRes(res, { usuario: result });
    }

    @Delete('usuarios/:id')
    @ApiTags('Auth — Admin')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleEnum.Superadmin)
    @ApiBearerAuth('access-token')
    @ApiOperation({
        summary: 'Eliminar usuario permanentemente',
        description:
            '🔒 **Requiere rol: Superadmin exclusivamente.** Admin recibe `403`.\n\n' +
            'Elimina el usuario de forma permanente e irrecuperable de la base de datos.\n\n' +
            '**Restricciones:**\n' +
            '- Un Superadmin no puede eliminarse a sí mismo (`403`).\n' +
            '- Esta acción es irreversible. Para desactivar temporalmente sin perder datos usa `PATCH /auth/usuarios/:id` con `{ "activo": false }`.',
    })
    @ApiOkResponse({ description: 'Usuario eliminado exitosamente.' })
    @ApiUnauthorizedResponse(SwaggerUnauthorizedCommon())
    @ApiForbiddenResponse({
        description: '403: el usuario autenticado no es Superadmin, o intenta eliminarse a sí mismo.',
    })
    @ApiNotFoundResponse(SwaggerNotFoundCommon())
    async delete(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser() user: JwtPayload,
        @Res() res: Response,
    ) {
        await this.authService.delete(id, user);
        return OkRes(res, { message: 'Usuario eliminado exitosamente' });
    }
}
