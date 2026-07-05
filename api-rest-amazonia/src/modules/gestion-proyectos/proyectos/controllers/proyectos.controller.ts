import {
    Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe,
    Post, Put, Query, Req, Res, UploadedFile, UseGuards, UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Request, Response } from 'express';
import {
    ApiBadRequestResponse, ApiBody, ApiConsumes, ApiNoContentResponse,
    ApiOkResponse, ApiOperation, ApiSecurity, ApiTags, ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { ProyectosService } from '../services/proyectos.service';
import { FilterProyectosDto } from '../dto/filter-proyectos.dto';
import { PaginationResponseDto } from 'src/shared/dto/pagination-response.dto';
import { OkRes, CreatedRes, SwaggerBadRequestCommon } from 'src/shared/utils';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from 'src/modules/auth/guards/optional-jwt.guard';

const MAX_SIZE_PROYECTO = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'];

const uploadInterceptor = FileInterceptor('file', {
    storage: memoryStorage(),
    limits: { fileSize: MAX_SIZE_PROYECTO },
    fileFilter: (_req, file, cb) => {
        cb(
            ALLOWED_MIME.includes(file.mimetype) ? null : new Error('Solo se permiten imágenes JPEG, PNG o WebP'),
            ALLOWED_MIME.includes(file.mimetype),
        );
    },
});

@Controller('proyectos')
export class ProyectosController {
    constructor(private readonly proyectosService: ProyectosService) {}

    // ── Público ────────────────────────────────────────────────────────────────

    @ApiTags('Proyectos — Público')
    @Get('filtros-disponibles')
    @ApiOperation({ summary: 'Valores únicos disponibles para construir filtros dinámicos. Sin autenticación. Caché 300 s.' })
    @ApiOkResponse({ description: 'Áreas, tipos, departamentos, municipios y años disponibles' })
    async filtrosDisponibles(@Res() res: Response) {
        const result = await this.proyectosService.findFiltrosDisponibles();
        return OkRes(res, result);
    }

    @ApiTags('Proyectos — Público')
    @Get()
    @UseGuards(OptionalJwtAuthGuard)
    @ApiSecurity('bearer')
    @ApiOperation({
        summary: 'Listar proyectos con filtros y paginación',
        description:
            'Token opcional. Sin token → devuelve datos resumidos (card). Con token válido → devuelve objeto completo con todas las relaciones.',
    })
    @ApiOkResponse({ type: PaginationResponseDto, description: 'Listado paginado. Shape varía según autenticación.' })
    async findAll(@Query() params: FilterProyectosDto, @Req() req: Request, @Res() res: Response) {
        const result = await this.proyectosService.findAll(params);
        const isAuth = !!(req as any).user;

        if (isAuth) {
            return OkRes(res, result);
        }

        const cards = (result.data as any[]).map((p) => ({
            id: p.id,
            nombre: p.nombre,
            descripcionCorta: p.descripcion ? (p.descripcion as string).substring(0, 150) : null,
            imagenPrincipalUrl: p.imagenPrincipalUrl,
            tipo: p.tipo ? { id: p.tipo.id, nombre: p.tipo.nombre } : null,
            area: p.area ? { id: p.area.id, nombre: p.area.nombre } : null,
            departamento: p.localidadesProyectos?.[0]?.municipio?.departamento?.nombre ?? null,
        }));

        return OkRes(res, { ...result, data: cards });
    }

    @ApiTags('Proyectos — Público')
    @Get('map')
    @UseGuards(OptionalJwtAuthGuard)
    @ApiOperation({ summary: 'Proyectos con coordenadas para renderizar en el mapa (MapLibre GL). Solo proyectos que tienen lat/lng.' })
    @ApiOkResponse({ description: 'Array de proyectos con lat, lng, department, municipality y datos del actor principal.' })
    async findForMap(@Res() res: Response) {
        const result = await this.proyectosService.findForMap();
        return OkRes(res, result);
    }

    // ── Autenticado ────────────────────────────────────────────────────────────

    @ApiTags('Proyectos — Autenticado')
    @Get(':id')
    @UseGuards(JwtAuthGuard)
    @ApiSecurity('bearer')
    @ApiOperation({ summary: '🔒 Detalle completo de un proyecto. Requiere token JWT.' })
    @ApiOkResponse({ description: 'Proyecto con todas sus relaciones, galería e imagen principal' })
    @ApiUnauthorizedResponse({ description: 'Sin token o token inválido — {"error":"AUTHENTICATION_REQUIRED","message":"...","login_url":"/api/auth/login"}' })
    @ApiBadRequestResponse(SwaggerBadRequestCommon())
    async findOne(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
        const proyecto = await this.proyectosService.findOne(id);
        return OkRes(res, { proyecto });
    }

    @ApiTags('Proyectos — Autenticado')
    @Post(':id/imagen-principal')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(uploadInterceptor)
    @ApiSecurity('bearer')
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ summary: '🔒 Subir o reemplazar imagen principal del proyecto (máx 5 MB, JPEG/PNG/WebP → WebP 1200×800)' })
    @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
    @ApiOkResponse({ description: '{ imagenPrincipalUrl: string }' })
    async uploadImagenPrincipal(
        @Param('id', ParseIntPipe) id: number,
        @UploadedFile() file: Express.Multer.File,
        @Res() res: Response,
    ) {
        const result = await this.proyectosService.uploadImagenPrincipal(id, file);
        return CreatedRes(res, result);
    }

    @ApiTags('Proyectos — Autenticado')
    @Delete(':id/imagen-principal')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiSecurity('bearer')
    @ApiOperation({ summary: '🔒 Eliminar imagen principal del proyecto' })
    @ApiNoContentResponse({ description: 'Imagen eliminada' })
    async deleteImagenPrincipal(@Param('id', ParseIntPipe) id: number) {
        await this.proyectosService.deleteImagenPrincipal(id);
    }

    @ApiTags('Proyectos — Autenticado')
    @Post(':id/galeria')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(uploadInterceptor)
    @ApiSecurity('bearer')
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ summary: '🔒 Añadir imagen a la galería del proyecto (máx 5 MB, JPEG/PNG/WebP → WebP 1200×800)' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: { type: 'string', format: 'binary' },
                descripcion: { type: 'string', description: 'Descripción opcional de la imagen' },
            },
        },
    })
    @ApiOkResponse({ description: 'Imagen de galería creada con id, url y orden' })
    async uploadGaleria(
        @Param('id', ParseIntPipe) id: number,
        @UploadedFile() file: Express.Multer.File,
        @Body('descripcion') descripcion: string,
        @Res() res: Response,
    ) {
        const imagen = await this.proyectosService.uploadGaleria(id, file, descripcion);
        return CreatedRes(res, imagen);
    }

    @ApiTags('Proyectos — Autenticado')
    @Delete(':id/galeria/:imagenId')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiSecurity('bearer')
    @ApiOperation({ summary: '🔒 Eliminar imagen de la galería' })
    @ApiNoContentResponse({ description: 'Imagen eliminada' })
    async deleteGaleriaImagen(
        @Param('id', ParseIntPipe) id: number,
        @Param('imagenId') imagenId: string,
    ) {
        await this.proyectosService.deleteGaleriaImagen(id, imagenId);
    }

    @ApiTags('Proyectos — Autenticado')
    @Put(':id/galeria/orden')
    @UseGuards(JwtAuthGuard)
    @ApiSecurity('bearer')
    @ApiOperation({ summary: '🔒 Reordenar imágenes de la galería. Body: [{id: string, orden: number}]' })
    @ApiOkResponse({ description: 'Orden actualizado' })
    async reordenarGaleria(
        @Param('id', ParseIntPipe) id: number,
        @Body() orden: { id: string; orden: number }[],
        @Res() res: Response,
    ) {
        await this.proyectosService.reordenarGaleria(id, orden);
        return OkRes(res, { message: 'Orden actualizado correctamente' });
    }
}
