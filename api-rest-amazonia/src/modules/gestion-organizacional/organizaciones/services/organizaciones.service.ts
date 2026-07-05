import { Injectable } from '@nestjs/common';
import { CreateOrganizacioneDto } from '../dto/create-organizacione.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Organizacion } from '../entities/organizacion.entity';
import { EntityManager, Repository } from 'typeorm';
import { TiposOrganizacionesService } from 'src/modules/catalogos/tipos-organizaciones/services/tipos-organizaciones.service';
import { DepartamentosService } from 'src/modules/ubicaciones-geograficas/departamentos/services/departamentos.service';
import { MyNotFoundException } from 'src/shared/exceptions';
import { buildPagination } from 'src/shared/utils/pagination.util';
import { UploadService } from 'src/shared/upload/upload.service';

interface CacheEntry { data: unknown; expiresAt: number; }

@Injectable()
export class OrganizacionesService {
	private readonly cache = new Map<string, CacheEntry>();

	constructor(
		@InjectRepository(Organizacion)
		private readonly organizacionRepository: Repository<Organizacion>,
		private readonly tiposOrganizacionesService: TiposOrganizacionesService,
		private readonly departamentosService: DepartamentosService,
		private readonly uploadService: UploadService,
	){}

	async findOne(id: number) {
		const organizacion = await this.organizacionRepository.findOne({
			where: { id },
			relations: {
				tipo: true,
				departamento: true,
				proyectosOrganizaciones: { proyecto: true },
				organizacionesEmpresas: { empresa: true },
			},
		});
		if (!organizacion) {
			throw new MyNotFoundException(`Organización con id ${id} no encontrada`);
		}
		return organizacion;
	}

	async create(data: CreateOrganizacioneDto, manager?: EntityManager){
		const repo = manager ? manager.getRepository(Organizacion) : this.organizacionRepository;
		const tipo = await this.tiposOrganizacionesService.findOneOrCreate(data.tipo, manager);
		const departamento = await this.departamentosService.findOne(data.idDepartamento);
		const organizacion = new Organizacion();
		organizacion.nombre = data.nombre;
		organizacion.idDepartamento = departamento.id;
		organizacion.esNacional = data.esNacional;
		organizacion.idTipo = tipo.id;
		organizacion.anioInicioTrabajo = data.anioInicioTrabajo;
		return await repo.save(organizacion);
	}

	async findAll(params?: {
		page?: number; limit?: number; departamento?: number;
		esNacional?: boolean; tipo?: number; search?: string;
	}) {
		const page = params?.page ?? 1;
		const limit = params?.limit ?? 10;

		const qb = this.organizacionRepository
			.createQueryBuilder('o')
			.leftJoinAndSelect('o.tipo', 'tipo')
			.leftJoinAndSelect('o.departamento', 'departamento')
			.orderBy('o.id', 'ASC');

		if (params?.search) {
			qb.andWhere('o.nombre ILIKE :search', { search: `%${params.search}%` });
		}
		if (params?.departamento) {
			qb.andWhere('o.idDepartamento = :departamento', { departamento: params.departamento });
		}
		if (params?.esNacional !== undefined) {
			qb.andWhere('o.esNacional = :esNacional', { esNacional: params.esNacional });
		}
		if (params?.tipo) {
			qb.andWhere('o.idTipo = :tipo', { tipo: params.tipo });
		}

		const [organizaciones, total] = await qb
			.skip((page - 1) * limit)
			.take(limit)
			.getManyAndCount();

		return buildPagination(organizaciones, total, page, limit);
	}

	async findFiltrosDisponibles() {
		const cached = this.cache.get('filtros');
		if (cached && Date.now() < cached.expiresAt) return cached.data;

		const [tipos, departamentos] = await Promise.all([
			this.organizacionRepository
				.createQueryBuilder('o')
				.innerJoin('o.tipo', 'tipo')
				.select(['tipo.id AS id', 'tipo.nombre AS nombre'])
				.groupBy('tipo.id, tipo.nombre')
				.orderBy('tipo.nombre', 'ASC')
				.getRawMany(),
			this.organizacionRepository
				.createQueryBuilder('o')
				.innerJoin('o.departamento', 'dep')
				.select(['dep.id AS id', 'dep.nombre AS nombre'])
				.groupBy('dep.id, dep.nombre')
				.orderBy('dep.nombre', 'ASC')
				.getRawMany(),
		]);

		const result = { tipos, departamentos };
		this.cache.set('filtros', { data: result, expiresAt: Date.now() + 300_000 });
		return result;
	}

	// --- Logo management ---

	async uploadLogo(id: number, file: Express.Multer.File): Promise<{ logoUrl: string }> {
		const org = await this.organizacionRepository.findOne({ where: { id }, select: ['id', 'logoPath'] });
		if (!org) throw new MyNotFoundException(`Organización con id ${id} no encontrada`);

		if (org.logoPath) {
			await this.uploadService.deleteImage(org.logoPath);
		}

		const { url, path } = await this.uploadService.saveImage(file.buffer, 'organizaciones/logos', 400, 400);
		await this.organizacionRepository.update(id, { logoUrl: url, logoPath: path });
		this.cache.clear();
		return { logoUrl: url };
	}

	async deleteLogo(id: number): Promise<void> {
		const org = await this.organizacionRepository.findOne({ where: { id }, select: ['id', 'logoPath'] });
		if (!org) throw new MyNotFoundException(`Organización con id ${id} no encontrada`);
		if (org.logoPath) {
			await this.uploadService.deleteImage(org.logoPath);
		}
		await this.organizacionRepository.update(id, { logoUrl: null, logoPath: null });
		this.cache.clear();
	}
}
