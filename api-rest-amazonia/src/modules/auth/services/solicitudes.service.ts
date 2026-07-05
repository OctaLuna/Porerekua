import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { SolicitudAcceso, EstadoSolicitudEnum } from '../entities/solicitud-acceso.entity';
import { Usuario } from '../entities/usuario.entity';
import { CrearSolicitudDto } from '../dto/crear-solicitud.dto';
import { AprobarSolicitudDto } from '../dto/aprobar-solicitud.dto';
import { RechazarSolicitudDto } from '../dto/rechazar-solicitud.dto';
import { SolicitudResponseDto } from '../dto/solicitud-response.dto';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { PaginationParamsDto } from 'src/shared/dto/pagination-params.dto';
import { PaginationResponseDto } from 'src/shared/dto/pagination-response.dto';
import { RoleEnum } from 'src/shared/enums/role.enum';
import {
    MyBadRequestException,
    MyConflictException,
    MyNotFoundException,
} from 'src/shared/exceptions';
import { hashPassword } from 'src/shared/utils/crypto.util';
import { buildPagination } from 'src/shared/utils/pagination.util';

@Injectable()
export class SolicitudesService {
    constructor(
        @InjectRepository(SolicitudAcceso)
        private readonly solicitudRepo: Repository<SolicitudAcceso>,
        @InjectRepository(Usuario)
        private readonly usuarioRepo: Repository<Usuario>,
        private readonly dataSource: DataSource,
    ) {}

    async crear(dto: CrearSolicitudDto): Promise<{ message: string }> {
        const pendiente = await this.solicitudRepo.findOne({
            where: {
                emailSolicitante: dto.emailSolicitante,
                estado: EstadoSolicitudEnum.Pendiente,
            },
        });

        if (pendiente) {
            throw new MyConflictException(
                'Ya existe una solicitud pendiente con ese correo electrónico',
            );
        }

        const solicitud = this.solicitudRepo.create({
            nombreSolicitante: dto.nombreSolicitante,
            emailSolicitante: dto.emailSolicitante,
            institucion: dto.institucion,
            proposito: dto.proposito,
            estado: EstadoSolicitudEnum.Pendiente,
        });

        await this.solicitudRepo.save(solicitud);
        return { message: 'Solicitud enviada. Será revisada por un administrador.' };
    }

    async findAll(
        params: PaginationParamsDto,
        estado?: EstadoSolicitudEnum,
    ): Promise<PaginationResponseDto<SolicitudResponseDto>> {
        const { page, limit } = params;

        const qb = this.solicitudRepo
            .createQueryBuilder('s')
            .orderBy('s.createdAt', 'DESC');

        if (estado) {
            qb.where('s.estado = :estado', { estado });
        }

        const [solicitudes, total] = await qb
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();

        return buildPagination(solicitudes.map((s) => this.toResponse(s)), total, page, limit);
    }

    async aprobar(id: number, dto: AprobarSolicitudDto, revisor: JwtPayload): Promise<{ message: string; idUsuario: number }> {
        return this.dataSource.transaction(async (manager) => {
            const solicitudRepo = manager.getRepository(SolicitudAcceso);
            const usuarioRepo = manager.getRepository(Usuario);

            const solicitud = await solicitudRepo.findOne({ where: { id } });
            if (!solicitud) {
                throw new MyNotFoundException('Solicitud no encontrada');
            }

            if (solicitud.estado !== EstadoSolicitudEnum.Pendiente) {
                throw new MyBadRequestException('Esta solicitud ya fue procesada');
            }

            const usuarioExistente = await usuarioRepo.findOne({
                where: { email: solicitud.emailSolicitante },
            });

            if (usuarioExistente) {
                throw new MyConflictException(
                    `Ya existe un usuario con el email ${solicitud.emailSolicitante}`,
                );
            }

            const passwordHash = await hashPassword(dto.passwordTemporal);
            const usuario = usuarioRepo.create({
                email: solicitud.emailSolicitante,
                nombre: solicitud.nombreSolicitante,
                passwordHash,
                rol: RoleEnum.Investigador,
                activo: true,
                fechaExpiracion: dto.fechaExpiracionAcceso,
            });

            const usuarioGuardado = await usuarioRepo.save(usuario);

            solicitud.estado = EstadoSolicitudEnum.Aprobada;
            solicitud.idRevisor = revisor.sub;
            solicitud.idUsuarioCreado = usuarioGuardado.id;
            solicitud.fechaExpiracionAcceso = dto.fechaExpiracionAcceso;
            solicitud.fechaRevision = new Date();

            await solicitudRepo.save(solicitud);

            return {
                message: 'Solicitud aprobada. Usuario investigador creado.',
                idUsuario: usuarioGuardado.id,
            };
        });
    }

    async rechazar(id: number, dto: RechazarSolicitudDto, revisor: JwtPayload): Promise<{ message: string }> {
        const solicitud = await this.solicitudRepo.findOne({ where: { id } });
        if (!solicitud) {
            throw new MyNotFoundException('Solicitud no encontrada');
        }

        if (solicitud.estado !== EstadoSolicitudEnum.Pendiente) {
            throw new MyBadRequestException('Esta solicitud ya fue procesada');
        }

        solicitud.estado = EstadoSolicitudEnum.Rechazada;
        solicitud.idRevisor = revisor.sub;
        solicitud.notaRechazo = dto.notaRechazo ?? null;
        solicitud.fechaRevision = new Date();

        await this.solicitudRepo.save(solicitud);
        return { message: 'Solicitud rechazada.' };
    }

    private toResponse(s: SolicitudAcceso): SolicitudResponseDto {
        return {
            id: s.id,
            nombreSolicitante: s.nombreSolicitante,
            emailSolicitante: s.emailSolicitante,
            institucion: s.institucion,
            proposito: s.proposito,
            estado: s.estado,
            fechaExpiracionAcceso: s.fechaExpiracionAcceso,
            idRevisor: s.idRevisor,
            idUsuarioCreado: s.idUsuarioCreado,
            notaRechazo: s.notaRechazo,
            fechaRevision: s.fechaRevision,
            createdAt: s.createdAt,
        };
    }
}
