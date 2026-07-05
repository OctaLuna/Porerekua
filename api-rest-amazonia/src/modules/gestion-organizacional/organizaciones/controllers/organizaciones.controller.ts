import {
    Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe,
    Post, Query, Req, Res, UploadedFile, UseGuards, UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Request, Response } from 'express';
import {
    ApiBody, ApiConsumes, ApiNoContentResponse, ApiOkResponse, ApiOperation,
    ApiSecurity, ApiTags, ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { OrganizacionesService } from '../services/organizaciones.service';
import { FilterOrganizacionesDto } from '../dto/filter-organizaciones.dto';
import { PaginationResponseDto } from 'src/shared/dto/pagination-response.dto';
import { OkRes, CreatedRes } from 'src/shared/utils';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from 'src/modules/auth/guards/optional-jwt.guard';

const MAX_SIZE_LOGO = 2 * 1024 * 1024; // 2 MB
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'];

const uploadInterceptor = FileInterceptor('file', {
    storage: memoryStorage(),
    limits: { fileSize: MAX_SIZE_LOGO },
    fileFilter: (_req, file, cb) => {
        cb(
            ALLOWED_MIME.includes(file.mimetype) ? null : new Error('Solo se permiten imágenes JPEG, PNG o WebP'),
            ALLOWED_MIME.includes(file.mimetype),
        );
    },
});

@Controller('organizaciones')
export class OrganizacionesController {
    constructor(private readonly organizacionesService: OrganizacionesService) {}

    // ── Público ────────────────────────────────────────────────────────────────

    @ApiTags('Organizaciones — Público')
    @Get('filtros-disponibles')
    @ApiOperation({ summary: 'Valores únicos disponibles para filtros de organizaciones. Sin autenticación. Caché 300 s.' })
    @ApiOkResponse({ description: 'Tipos de organización y departamentos disponibles' })
    async filtrosDisponibles(@Res() res: Response) {
        const result = await this.organizacionesService.findFiltrosDisponibles();
        return OkRes(res, result);
    }

    @ApiTags('Organizaciones — Público')
    @Get()
    @UseGuards(OptionalJwtAuthGuard)
    @ApiSecurity('bearer')
    @ApiOperation({
        summary: 'Listar organizaciones con filtros y paginación',
        description:
            'Token opcional. Sin token → devuelve datos resumidos (card). Con token válido → devuelve objeto completo.',
    })
    @ApiOkResponse({ type: PaginationResponseDto, description: 'Listado paginado. Shape varía según autenticación.' })
    async findAll(@Query() params: FilterOrganizacionesDto, @Req() req: Request, @Res() res: Response) {
        const result = await this.organizacionesService.findAll(params);
        const isAuth = !!(req as any).user;

        if (isAuth) {
            return OkRes(res, result);
        }

        const cards = (result.data as any[]).map((o) => ({
            id: o.id,
            nombre: o.nombre,
            tipo: o.tipo ? { id: o.tipo.id, nombre: o.tipo.nombre } : null,
            logoUrl: o.logoUrl,
            departamento: o.departamento?.nombre ?? null,
            esNacional: o.esNacional,
        }));

        return OkRes(res, { ...result, data: cards });
    }

    // ── Autenticado ────────────────────────────────────────────────────────────

    @ApiTags('Organizaciones — Autenticado')
    @Get(':id')
    @UseGuards(JwtAuthGuard)
    @ApiSecurity('bearer')
    @ApiOperation({ summary: '🔒 Detalle completo de una organización. Requiere token JWT.' })
    @ApiOkResponse({ description: 'Organización con tipo, departamento, proyectos y empresas relacionadas' })
    @ApiUnauthorizedResponse({ description: 'Sin token o token inválido' })
    async findOne(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
        const organizacion = await this.organizacionesService.findOne(id);
        return OkRes(res, { organizacion });
    }

    @ApiTags('Organizaciones — Autenticado')
    @Post(':id/logo')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(uploadInterceptor)
    @ApiSecurity('bearer')
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ summary: '🔒 Subir o reemplazar logo de organización (máx 2 MB, JPEG/PNG/WebP → WebP 400×400)' })
    @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
    @ApiOkResponse({ description: '{ logoUrl: string }' })
    async uploadLogo(
        @Param('id', ParseIntPipe) id: number,
        @UploadedFile() file: Express.Multer.File,
        @Res() res: Response,
    ) {
        const result = await this.organizacionesService.uploadLogo(id, file);
        return CreatedRes(res, result);
    }

    @ApiTags('Organizaciones — Autenticado')
    @Delete(':id/logo')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiSecurity('bearer')
    @ApiOperation({ summary: '🔒 Eliminar logo de organización' })
    @ApiNoContentResponse({ description: 'Logo eliminado' })
    async deleteLogo(@Param('id', ParseIntPipe) id: number) {
        await this.organizacionesService.deleteLogo(id);
    }
}
