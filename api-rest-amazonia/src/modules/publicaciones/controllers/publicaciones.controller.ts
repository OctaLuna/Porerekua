import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    Post,
    Query,
    Req,
    Res,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Request, Response } from 'express';
import {
    ApiBearerAuth,
    ApiBody,
    ApiConsumes,
    ApiCreatedResponse,
    ApiForbiddenResponse,
    ApiNoContentResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { PublicacionesService } from '../services/publicaciones.service';
import { CreatePublicacionDto } from '../dto/create-publicacion.dto';
import { UpdatePublicacionDto } from '../dto/update-publicacion.dto';
import { FilterPublicacionesDto } from '../dto/filter-publicaciones.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { JwtPayload } from 'src/modules/auth/interfaces/jwt-payload.interface';
import {
    OkRes,
    CreatedRes,
    SwaggerBadRequestCommon,
    SwaggerForbiddenCommon,
    SwaggerNotFoundCommon,
    SwaggerUnauthorizedCommon,
} from 'src/shared/utils';

const uploadInterceptor = FileInterceptor('file', {
    storage: memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/webp'];
        cb(
            allowed.includes(file.mimetype) ? null : new Error('Solo se permiten imágenes JPEG, PNG o WebP'),
            allowed.includes(file.mimetype),
        );
    },
});

@Controller('publicaciones')
export class PublicacionesController {
    constructor(private readonly publicacionesService: PublicacionesService) {}

    // ── Escritura (solo investigadores) ─────────────────────────────────────────

    @ApiTags('Publicaciones')
    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @ApiOperation({
        summary: '🔒 Crear publicación',
        description:
            'Solo usuarios con rol **Investigador** pueden crear publicaciones. El slug se genera automáticamente del título.',
    })
    @ApiBody({ type: CreatePublicacionDto })
    @ApiCreatedResponse({ description: 'Publicación creada. Devuelve el objeto completo incluyendo id y slug.' })
    @ApiUnauthorizedResponse(SwaggerUnauthorizedCommon())
    @ApiForbiddenResponse(SwaggerForbiddenCommon())
    async create(@Body() dto: CreatePublicacionDto, @Req() req: Request, @Res() res: Response) {
        const user = (req as any).user as JwtPayload;
        return CreatedRes(res, await this.publicacionesService.create(dto, user));
    }

    // ── Rutas estáticas ANTES de /:slug para evitar colisión ────────────────────

    @ApiTags('Publicaciones')
    @Get('mias')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @ApiOperation({
        summary: '🔒 Mis publicaciones (borradores + publicadas)',
        description:
            'Solo para usuarios con rol **Investigador**. Devuelve todas sus publicaciones incluidos borradores. DEBE declararse antes de /:slug.',
    })
    @ApiQuery({ name: 'estado', required: false, enum: ['borrador', 'publicado'], description: 'Filtrar por estado' })
    @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
    @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
    @ApiOkResponse({ description: 'Listado paginado de publicaciones propias (borradores incluidos)' })
    @ApiUnauthorizedResponse(SwaggerUnauthorizedCommon())
    @ApiForbiddenResponse(SwaggerForbiddenCommon())
    async findMias(@Query() params: FilterPublicacionesDto, @Req() req: Request, @Res() res: Response) {
        const user = (req as any).user as JwtPayload;
        return OkRes(res, await this.publicacionesService.findMias(user, params));
    }

    // ── Lectura pública ─────────────────────────────────────────────────────────

    @ApiTags('Publicaciones — Público')
    @Get()
    @ApiOperation({
        summary: 'Listado público de publicaciones',
        description: 'Sin autenticación. Solo devuelve publicaciones en estado **publicado**, paginadas por fecha descendente.',
    })
    @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
    @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
    @ApiOkResponse({ description: 'Listado paginado de publicaciones publicadas' })
    async findAll(@Query() params: FilterPublicacionesDto, @Res() res: Response) {
        return OkRes(res, await this.publicacionesService.findAll(params));
    }

    @ApiTags('Publicaciones — Público')
    @Get(':slug')
    @ApiOperation({
        summary: 'Detalle público de una publicación por slug',
        description: 'Sin autenticación. Solo retorna publicaciones en estado publicado.',
    })
    @ApiParam({ name: 'slug', description: 'Slug URL-amigable', example: 'el-jaguar-amazonia-a1b2c3d4' })
    @ApiOkResponse({ description: 'Publicación con contenido de bloques e imágenes adjuntas' })
    @ApiNotFoundResponse(SwaggerNotFoundCommon())
    async findBySlug(@Param('slug') slug: string, @Res() res: Response) {
        return OkRes(res, await this.publicacionesService.findBySlug(slug));
    }

    // ── Edición ─────────────────────────────────────────────────────────────────

    @ApiTags('Publicaciones')
    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @ApiOperation({
        summary: '🔒 Editar publicación',
        description:
            'El investigador puede editar solo sus propias publicaciones. Admins/Superadmins pueden editar cualquiera — su id queda registrado en `editado_por` para trazabilidad.',
    })
    @ApiParam({ name: 'id', description: 'UUID de la publicación' })
    @ApiBody({ type: UpdatePublicacionDto })
    @ApiOkResponse({ description: 'Publicación actualizada' })
    @ApiUnauthorizedResponse(SwaggerUnauthorizedCommon())
    @ApiForbiddenResponse(SwaggerForbiddenCommon())
    @ApiNotFoundResponse(SwaggerNotFoundCommon())
    async update(
        @Param('id') id: string,
        @Body() dto: UpdatePublicacionDto,
        @Req() req: Request,
        @Res() res: Response,
    ) {
        const user = (req as any).user as JwtPayload;
        return OkRes(res, await this.publicacionesService.update(id, dto, user));
    }

    // ── Eliminación ─────────────────────────────────────────────────────────────

    @ApiTags('Publicaciones')
    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({
        summary: '🔒 Eliminar publicación',
        description:
            'El investigador puede eliminar solo sus propias publicaciones. Admins/Superadmins pueden eliminar cualquiera.',
    })
    @ApiParam({ name: 'id', description: 'UUID de la publicación' })
    @ApiNoContentResponse({ description: 'Publicación eliminada exitosamente' })
    @ApiUnauthorizedResponse(SwaggerUnauthorizedCommon())
    @ApiForbiddenResponse(SwaggerForbiddenCommon())
    @ApiNotFoundResponse(SwaggerNotFoundCommon())
    async remove(@Param('id') id: string, @Req() req: Request) {
        const user = (req as any).user as JwtPayload;
        await this.publicacionesService.remove(id, user);
    }

    // ── Imágenes ─────────────────────────────────────────────────────────────────

    @ApiTags('Publicaciones')
    @Post(':id/imagenes')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(uploadInterceptor)
    @ApiBearerAuth('access-token')
    @ApiConsumes('multipart/form-data')
    @ApiOperation({
        summary: '🔒 Subir imagen asociada a una publicación (máx 5 MB, JPEG/PNG/WebP → WebP 1200×800)',
        description:
            'El investigador solo puede subir imágenes a sus propias publicaciones. Admins/Superadmins pueden hacerlo en cualquiera.',
    })
    @ApiParam({ name: 'id', description: 'UUID de la publicación' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: { type: 'string', format: 'binary', description: 'Imagen (JPEG, PNG o WebP, máx 5 MB)' },
                descripcion: { type: 'string', description: 'Texto alternativo / descripción accesible (opcional)' },
            },
            required: ['file'],
        },
    })
    @ApiCreatedResponse({ description: 'Imagen subida. Devuelve { id, url, orden }' })
    @ApiUnauthorizedResponse(SwaggerUnauthorizedCommon())
    @ApiForbiddenResponse(SwaggerForbiddenCommon())
    @ApiNotFoundResponse(SwaggerNotFoundCommon())
    async uploadImagen(
        @Param('id') id: string,
        @UploadedFile() file: Express.Multer.File,
        @Body('descripcion') descripcion: string,
        @Req() req: Request,
        @Res() res: Response,
    ) {
        const user = (req as any).user as JwtPayload;
        return CreatedRes(res, await this.publicacionesService.uploadImagen(id, file, descripcion, user));
    }
}
