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

import { EmpresasService } from '../services/empresas.service';
import { FilterEmpresasDto } from '../dto/filter-empresas.dto';
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

@Controller('empresas')
export class EmpresasController {
    constructor(private readonly empresasService: EmpresasService) {}

    // ── Público ────────────────────────────────────────────────────────────────

    @ApiTags('Empresas — Público')
    @Get('filtros-disponibles')
    @ApiOperation({ summary: 'Valores únicos disponibles para filtros de empresas. Sin autenticación. Caché 300 s.' })
    @ApiOkResponse({ description: 'Formas jurídicas y departamentos disponibles' })
    async filtrosDisponibles(@Res() res: Response) {
        const result = await this.empresasService.findFiltrosDisponibles();
        return OkRes(res, result);
    }

    @ApiTags('Empresas — Público')
    @Get()
    @UseGuards(OptionalJwtAuthGuard)
    @ApiSecurity('bearer')
    @ApiOperation({
        summary: 'Listar empresas con filtros y paginación',
        description:
            'Token opcional. Sin token → devuelve datos resumidos (card). Con token válido → devuelve objeto completo.',
    })
    @ApiOkResponse({ type: PaginationResponseDto, description: 'Listado paginado. Shape varía según autenticación.' })
    async findAll(@Query() params: FilterEmpresasDto, @Req() req: Request, @Res() res: Response) {
        const result = await this.empresasService.findAll(params);
        const isAuth = !!(req as any).user;

        if (isAuth) {
            return OkRes(res, result);
        }

        const cards = (result.data as any[]).map((e) => ({
            id: e.id,
            nombre: e.nombre,
            formaJuridica: e.formaJuridica ? { id: e.formaJuridica.id, nombre: e.formaJuridica.nombre } : null,
            logoUrl: e.logoUrl,
            departamento: e.departamentos?.[0]?.nombre ?? null,
        }));

        return OkRes(res, { ...result, data: cards });
    }

    // ── Autenticado ────────────────────────────────────────────────────────────

    @ApiTags('Empresas — Autenticado')
    @Get(':id')
    @UseGuards(JwtAuthGuard)
    @ApiSecurity('bearer')
    @ApiOperation({ summary: '🔒 Detalle completo de una empresa. Requiere token JWT.' })
    @ApiOkResponse({ description: 'Empresa con formaJuridica, departamentos, apoyos, motivos, ODS, organizaciones y proyectos' })
    @ApiUnauthorizedResponse({ description: 'Sin token o token inválido' })
    async findOne(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
        const empresa = await this.empresasService.findOne(id);
        return OkRes(res, { empresa });
    }

    @ApiTags('Empresas — Autenticado')
    @Post(':id/logo')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(uploadInterceptor)
    @ApiSecurity('bearer')
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ summary: '🔒 Subir o reemplazar logo de empresa (máx 2 MB, JPEG/PNG/WebP → WebP 400×400)' })
    @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
    @ApiOkResponse({ description: '{ logoUrl: string }' })
    async uploadLogo(
        @Param('id', ParseIntPipe) id: number,
        @UploadedFile() file: Express.Multer.File,
        @Res() res: Response,
    ) {
        const result = await this.empresasService.uploadLogo(id, file);
        return CreatedRes(res, result);
    }

    @ApiTags('Empresas — Autenticado')
    @Delete(':id/logo')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiSecurity('bearer')
    @ApiOperation({ summary: '🔒 Eliminar logo de empresa' })
    @ApiNoContentResponse({ description: 'Logo eliminado' })
    async deleteLogo(@Param('id', ParseIntPipe) id: number) {
        await this.empresasService.deleteLogo(id);
    }
}
