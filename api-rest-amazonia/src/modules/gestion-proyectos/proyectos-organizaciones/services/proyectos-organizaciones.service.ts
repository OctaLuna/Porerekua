import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProyectoOrganizacion } from '../entities/proyecto-organizacion.entity';
import { EntityManager, Repository } from 'typeorm';
import { CreateProyectoDto } from '../../proyectos/dto/create-proyecto.dto';
import { ProyectosService, ResolvedRegion } from '../../proyectos/services/proyectos.service';
import { parse } from 'date-fns';
import { LinkProyectoDto } from 'src/app/formularios/dto/proyectos/link-proyecto.dto';
import { Proyecto } from '../../proyectos/entities/proyecto.entity';
import { MyNotFoundException } from 'src/shared/exceptions';

@Injectable()
export class ProyectosOrganizacionesService {
	constructor(
		@InjectRepository(ProyectoOrganizacion)
		private readonly proyectoOrganizacionRepository: Repository<ProyectoOrganizacion>,
		private readonly proyectosService: ProyectosService,
	) { }

	async createMany(idOrganizacion: number, proyectos: CreateProyectoDto[], manager: EntityManager, regions?: ResolvedRegion[]) {
		const repo = manager ? manager.getRepository(ProyectoOrganizacion) : this.proyectoOrganizacionRepository;

		const proyectosSaved: ProyectoOrganizacion[] = await Promise.all(
			proyectos.map(async (p, i) => {
				const preResolved = regions ? { region: regions[i] } : undefined;
				const proyectoSaved = await this.proyectosService.create(p, manager, preResolved);

				const fechaInicioDate = parse(p.fechaInicio, 'dd-MM-yyyy', new Date());
				const fechaFinDate = p.fechaFin ? parse(p.fechaFin, 'dd-MM-yyyy', new Date()) : undefined;

				return {
					idOrganizacion: idOrganizacion,
					idProyecto: proyectoSaved.id,
					fechaInicio: fechaInicioDate,
					fechaFin: fechaFinDate
				} as ProyectoOrganizacion;
			})
		);
		return await repo.save(proyectosSaved);
	}

	async linkMany(idOrganizacion: number, links: LinkProyectoDto[], manager: EntityManager) {
		const repo = manager ? manager.getRepository(ProyectoOrganizacion) : this.proyectoOrganizacionRepository;
		const proyectoRepo = manager.getRepository(Proyecto);

		const records: ProyectoOrganizacion[] = await Promise.all(
			links.map(async (link) => {
				const exists = await proyectoRepo.findOne({ where: { id: link.idProyecto } });
				if (!exists) {
					throw new MyNotFoundException(`Proyecto con id ${link.idProyecto} no encontrado`);
				}

				const fechaInicioDate = parse(link.fechaInicio, 'dd-MM-yyyy', new Date());
				const fechaFinDate = link.fechaFin ? parse(link.fechaFin, 'dd-MM-yyyy', new Date()) : undefined;

				return {
					idOrganizacion,
					idProyecto: link.idProyecto,
					fechaInicio: fechaInicioDate,
					fechaFin: fechaFinDate,
				} as ProyectoOrganizacion;
			})
		);
		return await repo.save(records);
	}
}
