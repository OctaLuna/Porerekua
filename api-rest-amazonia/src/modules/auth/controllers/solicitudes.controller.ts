import { Body, Controller, Get, HttpStatus, Param, ParseIntPipe, Patch, Post, Query, Res, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
    ApiBearerAuth,
    ApiBadRequestResponse,
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
import { SolicitudesService } from '../services/solicitudes.service';
import { CrearSolicitudDto } from '../dto/crear-solicitud.dto';
import { AprobarSolicitudDto } from '../dto/aprobar-solicitud.dto';
import { RechazarSolicitudDto } from '../dto/rechazar-solicitud.dto';
import { SolicitudResponseDto } from '../dto/solicitud-response.dto';
import { EstadoSolicitudEnum } from '../entities/solicitud-acceso.entity';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';
import { RoleEnum } from 'src/shared/enums/role.enum';
import { PaginationParamsDto } from 'src/shared/dto/pagination-params.dto';
import { PaginationResponseDto } from 'src/shared/dto/pagination-response.dto';
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
export class SolicitudesController {
    constructor(private readonly solicitudesService: SolicitudesService) {}

    // ──────────────────────────────────────────────────────────────
    // GRUPO: Auth — Público
    // ──────────────────────────────────────────────────────────────

    @Post('solicitar-acceso')
    @ApiTags('Auth — Público')
    @Throttle({ default: { limit: 3, ttl: 60000 } })
    @ApiOperation({
        summary: 'Solicitar acceso como investigador',
        description:
            '🔓 **Acceso público — sin token requerido.**\n\n' +
            'Envía una solicitud de acceso temporal como investigador a la plataforma.\n\n' +
            '**Flujo completo:**\n' +
            '1. El solicitante envía este formulario con su nombre, email, institución y propósito de investigación.\n' +
            '2. Un Admin revisa la solicitud en `GET /auth/solicitudes`.\n' +
            '3. Si se aprueba (`PATCH /auth/solicitudes/:id/aprobar`), se crea automáticamente una cuenta de Investigador con acceso temporal hasta la fecha definida por el Admin.\n' +
            '4. El investigador recibe las credenciales y puede hacer login con `POST /auth/login`.\n\n' +
            '**Restricción:** no se puede enviar una nueva solicitud mientras haya una pendiente con el mismo email. Devuelve `409`.\n\n' +
            '**Rate limiting:** máximo 3 solicitudes por IP cada 60 segundos.',
    })
    @ApiCreatedResponse({
        description: 'Solicitud enviada exitosamente. Será revisada por un administrador.',
    })
    @ApiBadRequestResponse(SwaggerBadRequestCommon())
    @ApiConflictResponse({
        description: '409: ya existe una solicitud pendiente con ese correo electrónico.',
    })
    @ApiResponse({ status: HttpStatus.TOO_MANY_REQUESTS, ...SwaggerTooManyRequestsCommon() })
    async solicitar(@Body() dto: CrearSolicitudDto, @Res() res: Response) {
        const result = await this.solicitudesService.crear(dto);
        return CreatedRes(res, result);
    }

    // ──────────────────────────────────────────────────────────────
    // GRUPO: Auth — Admin
    // ──────────────────────────────────────────────────────────────

    @Get('solicitudes')
    @ApiTags('Auth — Admin')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleEnum.Admin)
    @ApiBearerAuth('access-token')
    @ApiOperation({
        summary: 'Listar solicitudes de acceso de investigadores',
        description:
            '🔒 **Requiere rol: Admin o Superadmin.**\n\n' +
            'Devuelve el listado paginado de solicitudes de acceso enviadas por investigadores.\n\n' +
            '**Filtrar por estado:**\n' +
            '- `pendiente` — solicitudes sin revisar (las más relevantes para el admin)\n' +
            '- `aprobada` — solicitudes que ya fueron aprobadas y tienen usuario creado\n' +
            '- `rechazada` — solicitudes rechazadas\n' +
            '- Sin filtro → devuelve todas.\n\n' +
            '**Ejemplo de uso:** `GET /api/auth/solicitudes?estado=pendiente&page=1&limit=20`',
    })
    @ApiQuery({
        name: 'estado',
        enum: EstadoSolicitudEnum,
        required: false,
        description: 'Filtrar solicitudes por estado. Si no se envía, devuelve todas.',
        example: EstadoSolicitudEnum.Pendiente,
    })
    @ApiQuery({ name: 'page', required: false, type: Number, description: 'Número de página (default: 1)', example: 1 })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Resultados por página (default: 10, máximo: 100)', example: 10 })
    @ApiOkResponse({
        type: PaginationResponseDto,
        description: 'Listado paginado de solicitudes con has_next y has_prev.',
    })
    @ApiUnauthorizedResponse(SwaggerUnauthorizedCommon())
    @ApiForbiddenResponse(SwaggerForbiddenCommon())
    async findAll(
        @Query() params: PaginationParamsDto,
        @Query('estado') estado: EstadoSolicitudEnum | undefined,
        @Res() res: Response,
    ) {
        const result = await this.solicitudesService.findAll(params, estado);
        return OkRes(res, result);
    }

    @Patch('solicitudes/:id/aprobar')
    @ApiTags('Auth — Admin')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleEnum.Admin)
    @ApiBearerAuth('access-token')
    @ApiOperation({
        summary: 'Aprobar solicitud y crear usuario investigador',
        description:
            '🔒 **Requiere rol: Admin o Superadmin.**\n\n' +
            'Aprueba la solicitud de acceso e inmediatamente crea una cuenta de Investigador.\n\n' +
            '**Al aprobar, el Admin define:**\n' +
            '- `fechaExpiracionAcceso`: hasta cuándo tendrá acceso el investigador (ISO 8601).\n' +
            '- `passwordTemporal`: contraseña inicial para el investigador (debe cumplir la política de seguridad).\n\n' +
            '**Efecto:**\n' +
            '- Se crea un usuario con rol Investigador (3) y el email de la solicitud.\n' +
            '- La solicitud queda marcada como `aprobada`.\n' +
            '- Esta operación es atómica (transaccional): si falla la creación del usuario, la solicitud no queda aprobada.\n\n' +
            '**Condiciones de error:**\n' +
            '- `400` si la solicitud ya fue procesada (aprobada o rechazada).\n' +
            '- `409` si ya existe un usuario con ese email.',
    })
    @ApiOkResponse({
        description: 'Solicitud aprobada y usuario investigador creado. Devuelve `idUsuario`.',
    })
    @ApiBadRequestResponse(SwaggerBadRequestCommon())
    @ApiUnauthorizedResponse(SwaggerUnauthorizedCommon())
    @ApiForbiddenResponse(SwaggerForbiddenCommon())
    @ApiNotFoundResponse(SwaggerNotFoundCommon())
    @ApiConflictResponse({
        description: '409: ya existe un usuario registrado con el email de la solicitud.',
    })
    async aprobar(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: AprobarSolicitudDto,
        @CurrentUser() user: JwtPayload,
        @Res() res: Response,
    ) {
        const result = await this.solicitudesService.aprobar(id, dto, user);
        return OkRes(res, result);
    }

    @Patch('solicitudes/:id/rechazar')
    @ApiTags('Auth — Admin')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleEnum.Admin)
    @ApiBearerAuth('access-token')
    @ApiOperation({
        summary: 'Rechazar una solicitud de acceso',
        description:
            '🔒 **Requiere rol: Admin o Superadmin.**\n\n' +
            'Rechaza la solicitud de acceso. No se crea ningún usuario.\n\n' +
            '**Opcional:** incluir una `notaRechazo` explicando el motivo (máx. 500 caracteres).\n\n' +
            '**Condición:** la solicitud debe estar en estado `pendiente`. ' +
            'Intentar rechazar una solicitud ya procesada devuelve `400`.',
    })
    @ApiOkResponse({ description: 'Solicitud rechazada exitosamente.' })
    @ApiBadRequestResponse({
        description: '400: parámetros inválidos, o la solicitud ya fue procesada.',
    })
    @ApiUnauthorizedResponse(SwaggerUnauthorizedCommon())
    @ApiForbiddenResponse(SwaggerForbiddenCommon())
    @ApiNotFoundResponse(SwaggerNotFoundCommon())
    async rechazar(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: RechazarSolicitudDto,
        @CurrentUser() user: JwtPayload,
        @Res() res: Response,
    ) {
        const result = await this.solicitudesService.rechazar(id, dto, user);
        return OkRes(res, result);
    }
}
