import { Injectable } from '@nestjs/common';
import { CreateEmpresaDto } from '../dto/create-empresa.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Empresa } from '../entities/empresa.entity';
import { EntityManager, Repository } from 'typeorm';
import { FormasJuridicasService } from 'src/modules/catalogos/formas-juridicas/services/formas-juridicas.service';
import { DepartamentosEmpresasService } from '../../departamentos-empresas/services/departamentos-empresas.service';
import { ApoyosEmpresasService } from '../../apoyos-empresas/services/apoyos-empresas.service';
import { OrganizacionesEmpresasService } from 'src/modules/gestion-organizacional/organizaciones-empresas/services/organizaciones-empresas.service';
import { MotivosEmpresasService } from '../../motivos-empresas/services/motivos-empresas.service';
import { OdsEmpresasService } from '../../ods-empresas/services/ods-empresas.service';
import { MyNotFoundException } from 'src/shared/exceptions';
import { buildPagination } from 'src/shared/utils/pagination.util';
import { UploadService } from 'src/shared/upload/upload.service';

interface CacheEntry { data: unknown; expiresAt: number; }

@Injectable()
export class EmpresasService {
	private readonly cache = new Map<string, CacheEntry>();

	constructor(
		@InjectRepository(Empresa)
		private readonly empresaRepository: Repository<Empresa>,
		private readonly formasJuridicasService: FormasJuridicasService,
		private readonly departamentosEmpresasService: DepartamentosEmpresasService,
		private readonly apoyosEmpresasService: ApoyosEmpresasService,
		private readonly organizacionesEmpresasService: OrganizacionesEmpresasService,
		private readonly motivosEmpresasService: MotivosEmpresasService,
		private readonly odsEmpresasService: OdsEmpresasService,
		private readonly uploadService: UploadService,
	){}

	async findOne(id: number) {
		const empresa = await this.empresaRepository.findOne({
			where: { id },
			relations: {
				formaJuridica: true,
				departamentos: true,
				apoyos: true,
				motivos: true,
				ods: true,
				organizacionesEmpresas: { organizacion: true },
				proyectosEmpresas: { proyecto: true },
			},
		});
		if (!empresa) {
			throw new MyNotFoundException(`Empresa con id ${id} no encontrada`);
		}
		return empresa;
	}

	async create(data: CreateEmpresaDto, manager?: EntityManager) {
		const repo = manager ? manager.getRepository(Empresa) : this.empresaRepository;
		const formaJuridica = await this.formasJuridicasService.findOneOrCreate(data.formaJuridica, manager);
		const empresa = new Empresa();
		empresa.nombre = data.nombre;
		empresa.idFormaJuridica = formaJuridica.id;
		empresa.anioInicioApoyo = data.anioInicioApoyo;
		const empresaSaved = await repo.save(empresa);

		await this.departamentosEmpresasService.create(empresaSaved.id, data.departamentos, manager);
		await this.apoyosEmpresasService.create(empresaSaved.id, data.apoyos, manager);
		if (data.organizaciones) {
			await this.organizacionesEmpresasService.create(empresaSaved.id, data.organizaciones, manager);
		}
		await this.motivosEmpresasService.create(empresaSaved.id, data.motivosApoyo, manager);
		await this.odsEmpresasService.create(empresaSaved.id, data.ods, manager);

		return empresaSaved;
	}

	async findAll(params?: {
		page?: number; limit?: number; departamento?: number;
		forma_juridica?: number; search?: string; sort?: string;
	}) {
		const page = params?.page ?? 1;
		const limit = params?.limit ?? 10;

		const [sortField, sortDir] = (params?.sort ?? 'id:asc').split(':');
		const sortMap: Record<string, string> = { nombre: 'e.nombre', anioInicioApoyo: 'e.anioInicioApoyo', id: 'e.id' };
		const orderField = sortMap[sortField] ?? 'e.id';
		const orderDir = (sortDir?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC') as 'ASC' | 'DESC';

		const qb = this.empresaRepository
			.createQueryBuilder('e')
			.leftJoinAndSelect('e.formaJuridica', 'formaJuridica')
			.leftJoinAndSelect('e.departamentos', 'departamentos')
			.leftJoinAndSelect('e.apoyos', 'apoyos')
			.leftJoinAndSelect('e.motivos', 'motivos')
			.leftJoinAndSelect('e.ods', 'ods')
			.leftJoinAndSelect('e.organizacionesEmpresas', 'organizacionesEmpresas')
			.orderBy(orderField, orderDir);

		if (params?.search) {
			qb.andWhere('e.nombre ILIKE :search', { search: `%${params.search}%` });
		}
		if (params?.departamento) {
			qb.andWhere('departamentos.id = :departamento', { departamento: params.departamento });
		}
		if (params?.forma_juridica) {
			qb.andWhere('e.idFormaJuridica = :forma_juridica', { forma_juridica: params.forma_juridica });
		}

		const [empresas, total] = await qb
			.skip((page - 1) * limit)
			.take(limit)
			.getManyAndCount();

		return buildPagination(empresas, total, page, limit);
	}

	async findFiltrosDisponibles() {
		const cached = this.cache.get('filtros');
		if (cached && Date.now() < cached.expiresAt) return cached.data;

		const [formasJuridicas, departamentos] = await Promise.all([
			this.empresaRepository
				.createQueryBuilder('e')
				.innerJoin('e.formaJuridica', 'fj')
				.select(['fj.id AS id', 'fj.nombre AS nombre'])
				.groupBy('fj.id, fj.nombre')
				.orderBy('fj.nombre', 'ASC')
				.getRawMany(),
			this.empresaRepository
				.createQueryBuilder('e')
				.innerJoin('e.departamentos', 'dep')
				.select(['dep.id AS id', 'dep.nombre AS nombre'])
				.groupBy('dep.id, dep.nombre')
				.orderBy('dep.nombre', 'ASC')
				.getRawMany(),
		]);

		const result = { formas_juridicas: formasJuridicas, departamentos };
		this.cache.set('filtros', { data: result, expiresAt: Date.now() + 300_000 });
		return result;
	}

	// --- Logo management ---

	async uploadLogo(id: number, file: Express.Multer.File): Promise<{ logoUrl: string }> {
		const empresa = await this.empresaRepository.findOne({ where: { id }, select: ['id', 'logoPath'] });
		if (!empresa) throw new MyNotFoundException(`Empresa con id ${id} no encontrada`);

		if (empresa.logoPath) {
			await this.uploadService.deleteImage(empresa.logoPath);
		}

		const { url, path } = await this.uploadService.saveImage(file.buffer, 'empresas/logos', 400, 400);
		await this.empresaRepository.update(id, { logoUrl: url, logoPath: path });
		this.cache.clear();
		return { logoUrl: url };
	}

	async deleteLogo(id: number): Promise<void> {
		const empresa = await this.empresaRepository.findOne({ where: { id }, select: ['id', 'logoPath'] });
		if (!empresa) throw new MyNotFoundException(`Empresa con id ${id} no encontrada`);
		if (empresa.logoPath) {
			await this.uploadService.deleteImage(empresa.logoPath);
		}
		await this.empresaRepository.update(id, { logoUrl: null, logoPath: null });
		this.cache.clear();
	}
}
