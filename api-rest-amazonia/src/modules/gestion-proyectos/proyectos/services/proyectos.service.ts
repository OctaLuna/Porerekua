import { Injectable } from '@nestjs/common';
import { CreateProyectoDto } from '../dto/create-proyecto.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Proyecto } from '../entities/proyecto.entity';
import { ProyectoImagen } from '../entities/proyecto-imagen.entity';
import { EntityManager, Repository } from 'typeorm';
import { TiposProyectosService } from 'src/modules/catalogos/tipos-proyectos/services/tipos-proyectos.service';
import { LocalidadesProyectosService } from '../../localidades-proyectos/services/localidades-proyectos.service';
import { AyudasProyectosService } from '../../ayudas-proyectos/services/ayudas-proyectos.service';
import { ActoresProyectosService } from '../../actores-proyectos/services/actores-proyectos.service';
import { ConservacionAnimalesService } from 'src/modules/gestion-conservacion/conservacion-animales/services/conservacion-animales.service';
import { AreasEnum } from 'src/shared/enums/areas.enum';
import { CreateConservacionDto } from '../dto/create-conservacion.dto';
import { CreateComunidadesIndigenasAreaDto } from 'src/modules/gestion-comunidades/comunidades-indigenas-areas/dto/create-comunidades-indigenas-area.dto';
import { MyBadRequestException, MyNotFoundException } from 'src/shared/exceptions';
import { ConservacionAgricolasService } from 'src/modules/gestion-conservacion/conservacion-agricolas/services/conservacion-agricolas.service';
import { ComunidadesIndigenasAreasService } from 'src/modules/gestion-comunidades/comunidades-indigenas-areas/services/comunidades-indigenas-areas.service';
import { buildPagination } from 'src/shared/utils';
import { UploadService } from 'src/shared/upload/upload.service';
import { GeorefService } from 'src/modules/georef/georef.service';
import { GeoRefResponse } from 'src/modules/georef/georef.dto';

interface CacheEntry { data: unknown; expiresAt: number; }

/**
 * Región pre-resuelta por GeoRef. `null` = sin coordenadas o resolución fallida.
 * Se pasa a `create()` para que la llamada HTTP a GeoRef ocurra FUERA de la
 * transacción de BD (AUDIT-009).
 */
export type ResolvedRegion = GeoRefResponse | null;

@Injectable()
export class ProyectosService {
	private readonly cache = new Map<string, CacheEntry>();

	constructor(
		@InjectRepository(Proyecto)
		private readonly proyectoRepository: Repository<Proyecto>,
		@InjectRepository(ProyectoImagen)
		private readonly imagenRepository: Repository<ProyectoImagen>,
		private readonly tiposProyectosService: TiposProyectosService,
		private readonly localidadesProyectosService: LocalidadesProyectosService,
		private readonly ayudasProyectosService: AyudasProyectosService,
		private readonly actoresProyectosService: ActoresProyectosService,
		private readonly conservacionAnimalesService: ConservacionAnimalesService,
		private readonly conservacionAgricolasService: ConservacionAgricolasService,
		private readonly comunidadesIndigenasAreasService: ComunidadesIndigenasAreasService,
		private readonly uploadService: UploadService,
		private readonly georefService: GeorefService,
	){}

	async findOne(id: number) {
		const proyecto = await this.proyectoRepository.findOne({
			where: { id },
			relations: {
				area: true,
				tipo: true,
				ayudas: true,
				actoresMunicipales: true,
				especiesAnimales: true,
				practicasAgricolas: true,
				areasDesarrollo: true,
				localidadesProyectos: {
					municipio: true,
					comunidad: true,
				},
				imagenes: true,
				proyectosEmpresas: { empresa: true },
				proyectosOrganizaciones: { organizacion: true },
			},
		});
		if (!proyecto) {
			throw new MyNotFoundException(`Proyecto con id ${id} no encontrado`);
		}
		return proyecto;
	}

	/**
	 * Resuelve la región (departamento/provincia) de unas coordenadas vía GeoRef.
	 * Debe llamarse ANTES de abrir la transacción de BD (AUDIT-009) para no
	 * retener conexiones durante la latencia HTTP. Devuelve `null` si no hay
	 * coordenadas o si GeoRef no responde (degradación elegante).
	 */
	async resolveRegionFor(data: Pick<CreateProyectoDto, 'lat' | 'lng'>): Promise<ResolvedRegion> {
		if (data.lat == null || data.lng == null) return null;
		return this.georefService.resolveCoordinates({ lat: data.lat, lng: data.lng });
	}

	async create(data: CreateProyectoDto, manager?: EntityManager, preResolved?: { region: ResolvedRegion }){
		const repo = manager ? manager.getRepository(Proyecto) : this.proyectoRepository;
		const tipoProyecto = await this.tiposProyectosService.findOneOrCreate(data.tipo, manager);
		const proyecto = new Proyecto();
		proyecto.nombre = data.nombre;
		proyecto.descripcion = data.descripcion;
		proyecto.anioInicio = data.anioInicio;
		if (proyecto.anioFin){
			proyecto.anioFin = data.anioFin;
		}
		proyecto.idArea = data.area;
		proyecto.idTipo = tipoProyecto.id;

		// Store raw coordinates; georef enrichment runs after save
		if (data.lat != null) proyecto.lat = data.lat;
		if (data.lng != null) proyecto.lng = data.lng;

		const proyectoSaved = await repo.save(proyecto);
		await this.localidadesProyectosService.createMany(proyecto.id, data.municipiosTrabajo, manager);
		await this.ayudasProyectosService.createMany(proyectoSaved.id, data.ayudas, manager);
		await this.actoresProyectosService.createMany(proyectoSaved.id, data.actores, manager);
		switch (proyectoSaved.idArea) {
			case AreasEnum.conservacion:
				await this.createConservacion(proyectoSaved.id, data.conservacion, manager);
				break;
			case AreasEnum.desarrollo:
				await this.createDesarrollo(proyectoSaved.id, data.desarrollo, manager);
				break;
			default:
				throw new MyBadRequestException('Ingrese una area especifica del proyecto');
		}

		// Enrich with GeoRef department/municipality if coordinates were provided.
		// AUDIT-009: si `preResolved` viene dado, se usa la región ya resuelta
		// FUERA de la transacción; si no, se resuelve aquí (compatibilidad).
		if (data.lat != null && data.lng != null) {
			const region = preResolved !== undefined
				? preResolved.region
				: await this.georefService.resolveCoordinates({ lat: data.lat, lng: data.lng });
			const georefUpdate: Partial<Proyecto> = region
				? {
					department: region.department,
					municipality: region.municipality,
					georefFailed: !region.found,
					georefResolvedAt: new Date(),
				}
				: { georefFailed: true };
			await repo.update(proyectoSaved.id, georefUpdate);
		}

		return proyectoSaved;
	}

	async createConservacion(idProyecto: number, data?: CreateConservacionDto, manager?: EntityManager){
		if (!data){
			throw new MyBadRequestException('Si elije un proyecto del area de Conservacion, debe tener este apartado obligatorio');
		}
		await this.conservacionAnimalesService.createMany(idProyecto, data.especies, manager);
		await this.conservacionAgricolasService.createMany(idProyecto, data.practicasAgricolas, manager);
	}

	async createDesarrollo(idProyecto: number, data?: CreateComunidadesIndigenasAreaDto, manager?: EntityManager){
		if (!data){
			throw new MyBadRequestException('Si elije un proyecto del area de Desarrollo, debe tener este apartado obligatorio');
		}
		await this.comunidadesIndigenasAreasService.createMany(idProyecto, data, manager);
	}

	async findAll(params?: {
		page?: number; limit?: number; area?: number; departamento?: number;
		tipo?: number; anio?: number; municipio?: number; anio_desde?: number;
		anio_hasta?: number; search?: string; sort?: string;
	}) {
		const page = params?.page ?? 1;
		const limit = params?.limit ?? 10;

		const [sortField, sortDir] = (params?.sort ?? 'id:asc').split(':');
		const sortMap: Record<string, string> = { nombre: 'p.nombre', anioInicio: 'p.anioInicio', id: 'p.id' };
		const orderField = sortMap[sortField] ?? 'p.id';
		const orderDir = (sortDir?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC') as 'ASC' | 'DESC';

		const qb = this.proyectoRepository
			.createQueryBuilder('p')
			.leftJoinAndSelect('p.area', 'area')
			.leftJoinAndSelect('p.tipo', 'tipo')
			.leftJoinAndSelect('p.ayudas', 'ayudas')
			.leftJoinAndSelect('p.actoresMunicipales', 'actoresMunicipales')
			.leftJoinAndSelect('p.localidadesProyectos', 'localidades')
			.leftJoinAndSelect('localidades.municipio', 'municipio')
			.leftJoinAndSelect('municipio.departamento', 'departamento')
			.leftJoinAndSelect('p.imagenes', 'imagenes')
			.orderBy(orderField, orderDir);

		if (params?.search) {
			qb.andWhere('(p.nombre ILIKE :search OR p.descripcion ILIKE :search)', { search: `%${params.search}%` });
		}
		if (params?.area) {
			qb.andWhere('p.idArea = :area', { area: params.area });
		}
		if (params?.tipo) {
			qb.andWhere('p.idTipo = :tipo', { tipo: params.tipo });
		}
		if (params?.anio) {
			qb.andWhere('p.anioInicio = :anio', { anio: params.anio });
		}
		if (params?.anio_desde) {
			qb.andWhere('p.anioInicio >= :anio_desde', { anio_desde: params.anio_desde });
		}
		if (params?.anio_hasta) {
			qb.andWhere('(p.anioFin <= :anio_hasta OR p.anioFin IS NULL)', { anio_hasta: params.anio_hasta });
		}
		if (params?.departamento) {
			qb.andWhere('departamento.id = :departamento', { departamento: params.departamento });
		}
		if (params?.municipio) {
			qb.andWhere('municipio.id = :municipio', { municipio: params.municipio });
		}

		const [proyectos, total] = await qb
			.skip((page - 1) * limit)
			.take(limit)
			.getManyAndCount();

		return buildPagination(proyectos, total, page, limit);
	}

	async findForMap() {
		return this.proyectoRepository
			.createQueryBuilder('p')
			.leftJoin('p.proyectosEmpresas', 'pe')
			.leftJoin('pe.empresa', 'e')
			.leftJoin('p.proyectosOrganizaciones', 'po')
			.leftJoin('po.organizacion', 'o')
			.leftJoin('p.area', 'a')
			.leftJoin('p.tipo', 't')
			.where('p.lat IS NOT NULL AND p.lng IS NOT NULL')
			.select([
				'p.id',
				'p.nombre',
				'p.descripcion',
				'p.lat',
				'p.lng',
				'p.department',
				'p.municipality',
				'p.anioInicio',
				'p.anioFin',
				'p.imagenPrincipalUrl',
				'a.id',
				'a.nombre',
				't.id',
				't.nombre',
				'e.id',
				'e.nombre',
				'o.id',
				'o.nombre',
			])
			.getMany();
	}

	async findFiltrosDisponibles() {
		const cached = this.cache.get('filtros');
		if (cached && Date.now() < cached.expiresAt) return cached.data;

		const [tipos, departamentos, municipios, aniosRaw] = await Promise.all([
			this.proyectoRepository
				.createQueryBuilder('p')
				.innerJoin('p.tipo', 'tipo')
				.select(['tipo.id AS id', 'tipo.nombre AS nombre'])
				.where('tipo.id IS NOT NULL')
				.groupBy('tipo.id, tipo.nombre')
				.orderBy('tipo.nombre', 'ASC')
				.getRawMany(),
			this.proyectoRepository
				.createQueryBuilder('p')
				.innerJoin('p.localidadesProyectos', 'lp')
				.innerJoin('lp.municipio', 'municipio')
				.innerJoin('municipio.departamento', 'dep')
				.select(['dep.id AS id', 'dep.nombre AS nombre'])
				.groupBy('dep.id, dep.nombre')
				.orderBy('dep.nombre', 'ASC')
				.getRawMany(),
			this.proyectoRepository
				.createQueryBuilder('p')
				.innerJoin('p.localidadesProyectos', 'lp')
				.innerJoin('lp.municipio', 'mun')
				.select(['mun.id AS id', 'mun.nombre AS nombre', 'mun.idDepartamento AS "idDepartamento"'])
				.groupBy('mun.id, mun.nombre, mun.idDepartamento')
				.orderBy('mun.nombre', 'ASC')
				.getRawMany(),
			this.proyectoRepository
				.createQueryBuilder('p')
				.select('p.anioInicio', 'anio')
				.where('p.anioInicio IS NOT NULL')
				.distinct(true)
				.orderBy('p.anioInicio', 'ASC')
				.getRawMany(),
		]);

		const areas = [
			{ id: AreasEnum.conservacion, nombre: 'Conservación' },
			{ id: AreasEnum.desarrollo, nombre: 'Desarrollo Comunitario' },
		];
		const anios = aniosRaw.map((r) => r.anio as number);

		const result = { areas, tipos, departamentos, municipios, anios };
		this.cache.set('filtros', { data: result, expiresAt: Date.now() + 300_000 });
		return result;
	}

	// --- Image management ---

	async uploadImagenPrincipal(id: number, file: Express.Multer.File): Promise<{ imagenPrincipalUrl: string }> {
		const proyecto = await this.proyectoRepository.findOne({ where: { id }, select: ['id', 'imagenPrincipalPath'] });
		if (!proyecto) throw new MyNotFoundException(`Proyecto con id ${id} no encontrado`);

		if (proyecto.imagenPrincipalPath) {
			await this.uploadService.deleteImage(proyecto.imagenPrincipalPath);
		}

		const { url, path } = await this.uploadService.saveImage(file.buffer, 'proyectos/principal', 1200, 800);
		await this.proyectoRepository.update(id, { imagenPrincipalUrl: url, imagenPrincipalPath: path });
		this.cache.clear();
		return { imagenPrincipalUrl: url };
	}

	async deleteImagenPrincipal(id: number): Promise<void> {
		const proyecto = await this.proyectoRepository.findOne({ where: { id }, select: ['id', 'imagenPrincipalPath'] });
		if (!proyecto) throw new MyNotFoundException(`Proyecto con id ${id} no encontrado`);
		if (proyecto.imagenPrincipalPath) {
			await this.uploadService.deleteImage(proyecto.imagenPrincipalPath);
		}
		await this.proyectoRepository.update(id, { imagenPrincipalUrl: null, imagenPrincipalPath: null });
		this.cache.clear();
	}

	async uploadGaleria(id: number, file: Express.Multer.File, descripcion?: string): Promise<ProyectoImagen> {
		const proyecto = await this.proyectoRepository.findOne({ where: { id }, select: ['id'] });
		if (!proyecto) throw new MyNotFoundException(`Proyecto con id ${id} no encontrado`);

		const { url, path } = await this.uploadService.saveImage(file.buffer, `proyectos/galeria/${id}`, 1200, 800);
		const imagen = this.imagenRepository.create({ idProyecto: id, url, path, descripcion: descripcion ?? null, orden: 0 });
		return this.imagenRepository.save(imagen);
	}

	async deleteGaleriaImagen(id: number, imagenId: string): Promise<void> {
		const imagen = await this.imagenRepository.findOne({ where: { id: imagenId, idProyecto: id } });
		if (!imagen) throw new MyNotFoundException(`Imagen no encontrada`);
		await this.uploadService.deleteImage(imagen.path);
		await this.imagenRepository.delete(imagenId);
	}

	async reordenarGaleria(id: number, orden: { id: string; orden: number }[]): Promise<void> {
		const proyecto = await this.proyectoRepository.findOne({ where: { id }, select: ['id'] });
		if (!proyecto) throw new MyNotFoundException(`Proyecto con id ${id} no encontrado`);
		await Promise.all(
			orden.map((item) => this.imagenRepository.update({ id: item.id, idProyecto: id }, { orden: item.orden })),
		);
	}
}
