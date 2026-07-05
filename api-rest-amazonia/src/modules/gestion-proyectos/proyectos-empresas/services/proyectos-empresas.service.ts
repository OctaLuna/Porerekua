import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProyectoEmpresa } from '../entities/proyecto-empresa.entity';
import { EntityManager, Repository } from 'typeorm';
import { ProyectosService, ResolvedRegion } from '../../proyectos/services/proyectos.service';
import { CreateProyectoDto } from '../../proyectos/dto/create-proyecto.dto';
import { parse } from 'date-fns';
import { LinkProyectoDto } from 'src/app/formularios/dto/proyectos/link-proyecto.dto';
import { Proyecto } from '../../proyectos/entities/proyecto.entity';
import { MyNotFoundException } from 'src/shared/exceptions';

@Injectable()
export class ProyectosEmpresasService {
	constructor(
		@InjectRepository(ProyectoEmpresa)
		private readonly proyectoEmpresaRepository: Repository<ProyectoEmpresa>,
		private readonly proyectosService: ProyectosService,
	) { }

	async createMany(idEmpresa: number, proyectos: CreateProyectoDto[], manager: EntityManager, regions?: ResolvedRegion[]) {
		const repo = manager ? manager.getRepository(ProyectoEmpresa) : this.proyectoEmpresaRepository;

		const proyectosSaved: ProyectoEmpresa[] = await Promise.all(
			proyectos.map(async (p, i) => {
				const preResolved = regions ? { region: regions[i] } : undefined;
				const proyectoSaved = await this.proyectosService.create(p, manager, preResolved);

				const fechaInicioDate = parse(p.fechaInicio, 'dd-MM-yyyy', new Date());
				const fechaFinDate = p.fechaFin ? parse(p.fechaFin, 'dd-MM-yyyy', new Date()) : undefined;

				return {
					idEmpresa: idEmpresa,
					idProyecto: proyectoSaved.id,
					fechaInicio: fechaInicioDate,
					fechaFin: fechaFinDate
				} as ProyectoEmpresa;
			})
		);
		return await repo.save(proyectosSaved);
	}

	async linkMany(idEmpresa: number, links: LinkProyectoDto[], manager: EntityManager) {
		const repo = manager ? manager.getRepository(ProyectoEmpresa) : this.proyectoEmpresaRepository;
		const proyectoRepo = manager.getRepository(Proyecto);

		const records: ProyectoEmpresa[] = await Promise.all(
			links.map(async (link) => {
				const exists = await proyectoRepo.findOne({ where: { id: link.idProyecto } });
				if (!exists) {
					throw new MyNotFoundException(`Proyecto con id ${link.idProyecto} no encontrado`);
				}

				const fechaInicioDate = parse(link.fechaInicio, 'dd-MM-yyyy', new Date());
				const fechaFinDate = link.fechaFin ? parse(link.fechaFin, 'dd-MM-yyyy', new Date()) : undefined;

				return {
					idEmpresa,
					idProyecto: link.idProyecto,
					fechaInicio: fechaInicioDate,
					fechaFin: fechaFinDate,
				} as ProyectoEmpresa;
			})
		);
		return await repo.save(records);
	}
}
