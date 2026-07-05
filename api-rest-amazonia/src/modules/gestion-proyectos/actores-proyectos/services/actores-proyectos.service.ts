import { Injectable } from '@nestjs/common';
import { CreateActoresProyectoDto } from '../dto/create-actores-proyecto.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ActorProyecto } from '../entities/actor-proyecto.entity';
import { EntityManager, Repository } from 'typeorm';
import { ActoresMunicipalesService } from 'src/modules/catalogos/actores-municipales/services/actores-municipales.service';

@Injectable()
export class ActoresProyectosService {
	constructor(
		@InjectRepository(ActorProyecto)
		private readonly actoreProyectoRepository: Repository<ActorProyecto>,
		private readonly actoresMunicipalesService: ActoresMunicipalesService
	){}

	async createMany(idProyecto: number,data: CreateActoresProyectoDto,manager?: EntityManager){
		const repo = manager ? manager.getRepository(ActorProyecto) : this.actoreProyectoRepository;
		const toSave: ActorProyecto[] = [];
		if (data.seleccionados){
			const actores = await this.actoresMunicipalesService.findAllByIds(data.seleccionados);
			actores.map((a) => {
				toSave.push({
					idProyecto: idProyecto,
					idActor: a.id
				})
			})
		}
		if (data.otros){
			const actores = await this.actoresMunicipalesService.createMany(data.otros,manager);
			actores.map((a) => {
				toSave.push({
					idProyecto: idProyecto,
					idActor: a.id
				})
			})
		}
		return await repo.save(toSave);
	}
}
