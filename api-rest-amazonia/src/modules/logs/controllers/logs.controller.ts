import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import {
    ApiBearerAuth,
    ApiForbiddenResponse,
    ApiOkResponse,
    ApiOperation,
    ApiQuery,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { LogsService } from '../services/logs.service';
import { FilterLogsDto } from '../dto/filter-logs.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';
import { RoleEnum } from 'src/shared/enums/role.enum';
import { OkRes, SwaggerForbiddenCommon, SwaggerUnauthorizedCommon } from 'src/shared/utils';

@Controller('admin/logs')
export class LogsController {
    constructor(private readonly logsService: LogsService) {}

    @ApiTags('Admin — Logs')
    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleEnum.Admin)
    @ApiBearerAuth('access-token')
    @ApiOperation({
        summary: '🔒 Consultar logs de aplicación y seguridad (Admin/Superadmin)',
        description:
            'Devuelve el historial de logs paginado con filtros por tipo, severidad, usuario y rango de fechas. ' +
            'Retención mínima: 2 años (ISO 27001:2022 control 8.15). ' +
            'Límite máximo por página: 200.',
    })
    @ApiQuery({ name: 'tipo', required: false, enum: ['aplicacion', 'seguridad'], description: 'Categoría del log' })
    @ApiQuery({ name: 'severidad', required: false, enum: ['info', 'warn', 'error', 'critico'], description: 'Nivel de severidad' })
    @ApiQuery({ name: 'usuario_id', required: false, type: Number, description: 'ID del usuario que generó el evento' })
    @ApiQuery({ name: 'fecha_desde', required: false, type: String, example: '2026-01-01', description: 'Inicio del rango (ISO 8601)' })
    @ApiQuery({ name: 'fecha_hasta', required: false, type: String, example: '2026-12-31', description: 'Fin del rango (ISO 8601)' })
    @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
    @ApiQuery({ name: 'limit', required: false, type: Number, example: 50, description: 'Máximo 200' })
    @ApiOkResponse({
        description: 'Listado paginado de logs',
        schema: {
            example: {
                data: [
                    {
                        id: 'uuid',
                        tipo: 'seguridad',
                        severidad: 'warn',
                        usuarioId: null,
                        accion: 'LOGIN_FALLIDO',
                        detalle: { email: 'alguien@ejemplo.com' },
                        ipOrigen: '192.168.1.1',
                        createdAt: '2026-06-29T12:00:00Z',
                    },
                ],
                page: 1,
                limit: 50,
                total: 1,
                pages: 1,
                has_next: false,
                has_prev: false,
            },
        },
    })
    @ApiUnauthorizedResponse(SwaggerUnauthorizedCommon())
    @ApiForbiddenResponse(SwaggerForbiddenCommon())
    async findAll(@Query() params: FilterLogsDto, @Res() res: Response) {
        return OkRes(res, await this.logsService.findAll(params));
    }
}
