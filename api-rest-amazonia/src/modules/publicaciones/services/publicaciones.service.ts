import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { Publicacion } from '../entities/publicacion.entity';
import { PublicacionImagen } from '../entities/publicacion-imagen.entity';
import { CreatePublicacionDto } from '../dto/create-publicacion.dto';
import { UpdatePublicacionDto } from '../dto/update-publicacion.dto';
import { FilterPublicacionesDto } from '../dto/filter-publicaciones.dto';
import { JwtPayload } from 'src/modules/auth/interfaces/jwt-payload.interface';
import { RoleEnum } from 'src/shared/enums/role.enum';
import { UploadService } from 'src/shared/upload/upload.service';
import { PaginationResponseDto } from 'src/shared/dto/pagination-response.dto';
import { buildPagination } from 'src/shared/utils/pagination.util';
import { LogsService } from 'src/modules/logs/services/logs.service';
import {
    MyNotFoundException,
    MyForbiddenException,
    MyBadRequestException,
} from 'src/shared/exceptions';

const MAX_SIZE_IMAGEN = 5 * 1024 * 1024;

function generarSlug(titulo: string, id: string): string {
    const base = titulo
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .substring(0, 200);
    return `${base}-${id.substring(0, 8)}`;
}

@Injectable()
export class PublicacionesService {
    constructor(
        @InjectRepository(Publicacion)
        private readonly publicacionRepo: Repository<Publicacion>,
        @InjectRepository(PublicacionImagen)
        private readonly imagenRepo: Repository<PublicacionImagen>,
        private readonly uploadService: UploadService,
        private readonly logsService: LogsService,
    ) {}

    async create(dto: CreatePublicacionDto, user: JwtPayload): Promise<Publicacion> {
        if (user.rol !== RoleEnum.Investigador) {
            throw new MyForbiddenException('Solo los investigadores pueden crear publicaciones');
        }

        const id = randomUUID();
        const slug = generarSlug(dto.titulo, id);
        const ahora = new Date();

        const pub = this.publicacionRepo.create({
            id,
            autorId: user.sub,
            titulo: dto.titulo,
            slug,
            contenido: dto.contenido,
            estado: dto.estado ?? 'borrador',
            fechaCreacion: ahora,
            fechaPublicacion: dto.estado === 'publicado' ? ahora : null,
        });

        return this.publicacionRepo.save(pub);
    }

    async findAll(params: FilterPublicacionesDto): Promise<PaginationResponseDto<Publicacion>> {
        const { page, limit } = params;

        const qb = this.publicacionRepo
            .createQueryBuilder('p')
            .leftJoin('p.autor', 'autor')
            .addSelect(['autor.id', 'autor.nombre'])
            .orderBy('p.fechaCreacion', 'DESC');

        // El listado público solo muestra publicados
        qb.andWhere('p.estado = :estado', { estado: 'publicado' });

        const [data, total] = await qb
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();

        return buildPagination(data, total, page, limit);
    }

    async findMias(user: JwtPayload, params: FilterPublicacionesDto): Promise<PaginationResponseDto<Publicacion>> {
        if (user.rol !== RoleEnum.Investigador) {
            throw new MyForbiddenException('Solo los investigadores pueden consultar sus publicaciones');
        }

        const { page, limit, estado } = params;

        const qb = this.publicacionRepo
            .createQueryBuilder('p')
            .where('p.autor_id = :autorId', { autorId: user.sub })
            .orderBy('p.fechaCreacion', 'DESC');

        if (estado) {
            qb.andWhere('p.estado = :estado', { estado });
        }

        const [data, total] = await qb
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();

        return buildPagination(data, total, page, limit);
    }

    async findBySlug(slug: string): Promise<Publicacion> {
        const pub = await this.publicacionRepo.findOne({
            where: { slug, estado: 'publicado' },
            relations: ['autor', 'imagenes'],
        });
        if (!pub) {
            throw new MyNotFoundException('Publicación no encontrada');
        }
        return pub;
    }

    async update(id: string, dto: UpdatePublicacionDto, user: JwtPayload): Promise<Publicacion> {
        const pub = await this.publicacionRepo.findOne({ where: { id } });
        if (!pub) {
            throw new MyNotFoundException('Publicación no encontrada');
        }

        const esAutor = pub.autorId === user.sub;
        const esAdmin = user.rol === RoleEnum.Admin || user.rol === RoleEnum.Superadmin;

        if (!esAutor && !esAdmin) {
            throw new MyForbiddenException('No tienes permiso para editar esta publicación');
        }

        if (dto.titulo !== undefined) {
            pub.titulo = dto.titulo;
            pub.slug = generarSlug(dto.titulo, pub.id);
        }
        if (dto.contenido !== undefined) pub.contenido = dto.contenido;

        if (dto.estado !== undefined) {
            pub.estado = dto.estado;
            if (dto.estado === 'publicado' && !pub.fechaPublicacion) {
                pub.fechaPublicacion = new Date();
            }
        }

        pub.fechaUltimaEdicion = new Date();

        // Si un admin edita contenido de otro autor, registrar quién editó
        if (esAdmin && !esAutor) {
            pub.editadoPorId = user.sub;
            this.logsService.registrar({
                tipo: 'seguridad',
                severidad: 'warn',
                accion: 'PUBLICACION_EDITADA_POR_ADMIN',
                usuarioId: user.sub,
                detalle: { publicacionId: id, autorId: pub.autorId, editadoPor: user.email },
            });
        }

        return this.publicacionRepo.save(pub);
    }

    async remove(id: string, user: JwtPayload): Promise<void> {
        const pub = await this.publicacionRepo.findOne({ where: { id } });
        if (!pub) {
            throw new MyNotFoundException('Publicación no encontrada');
        }

        const esAutor = pub.autorId === user.sub && user.rol === RoleEnum.Investigador;
        const esAdmin = user.rol === RoleEnum.Admin || user.rol === RoleEnum.Superadmin;

        if (!esAutor && !esAdmin) {
            throw new MyForbiddenException('No tienes permiso para eliminar esta publicación');
        }

        await this.publicacionRepo.remove(pub);

        if (esAdmin) {
            this.logsService.registrar({
                tipo: 'seguridad',
                severidad: 'warn',
                accion: 'PUBLICACION_ELIMINADA_POR_ADMIN',
                usuarioId: user.sub,
                detalle: { publicacionId: id, autorId: pub.autorId, eliminadaPor: user.email },
            });
        }
    }

    async uploadImagen(
        id: string,
        file: Express.Multer.File,
        descripcion: string | undefined,
        user: JwtPayload,
    ): Promise<PublicacionImagen> {
        const pub = await this.publicacionRepo.findOne({ where: { id } });
        if (!pub) {
            throw new MyNotFoundException('Publicación no encontrada');
        }

        const esAutor = pub.autorId === user.sub;
        const esAdmin = user.rol === RoleEnum.Admin || user.rol === RoleEnum.Superadmin;

        if (!esAutor && !esAdmin) {
            throw new MyForbiddenException('No tienes permiso para añadir imágenes a esta publicación');
        }

        if (!file) {
            throw new MyBadRequestException('Debes adjuntar un archivo de imagen');
        }

        if (file.size > MAX_SIZE_IMAGEN) {
            throw new MyBadRequestException('La imagen supera el límite de 5 MB');
        }

        const { url, path } = await this.uploadService.saveImage(
            file.buffer,
            'publicaciones',
            1200,
            800,
        );

        const orden = await this.imagenRepo.count({ where: { idPublicacion: id } });

        const imagen = this.imagenRepo.create({
            idPublicacion: id,
            url,
            path,
            descripcion: descripcion ?? null,
            orden,
        });

        return this.imagenRepo.save(imagen);
    }
}
