import { Injectable } from '@nestjs/common';
import { CreateConservacionAgricolaDto } from '../dto/create-conservacion-agricola.dto';
import { UpdateConservacionAgricolaDto } from '../dto/update-conservacion-agricola.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ConservacionAgricola } from '../entities/conservacion-agricola.entity';
import { EntityManager, Repository } from 'typeorm';
import { AreasDesarrolloService } from 'src/modules/catalogos/areas-desarrollo/services/areas-desarrollo.service';
import { PracticasAgricolasService } from 'src/modules/catalogos/practicas-agricolas/services/practicas-agricolas.service';
import { MyBadRequestException } from 'src/shared/exceptions';

@Injectable()
export class ConservacionAgricolasService {
	constructor(
		@InjectRepository(ConservacionAgricola)
		private readonly conservacionAgricolaRepository: Repository<ConservacionAgricola>,
		private readonly practicasAgricolasService: PracticasAgricolasService 
	){}

	async createMany(idProyecto: number,data: CreateConservacionAgricolaDto,manager?: EntityManager){
		const repo = manager ? manager.getRepository(ConservacionAgricola) : this.conservacionAgricolaRepository;
		const toSave: ConservacionAgricola[] = [];
		if (data.seleccionados){
			const practicas = await this.practicasAgricolasService.findAllByIds(data.seleccionados);
			practicas.map((p) => {
				toSave.push({
					idProyecto: idProyecto,
					idPractica: p.id
				})
			})
		}
		if (data.otros){
			const practicas = await this.practicasAgricolasService.createMany(data.otros,manager);
			practicas.map((p) => {
				toSave.push({
					idProyecto: idProyecto,
					idPractica: p.id
				})
			})
		}
		if (toSave.length === 0){
			throw new MyBadRequestException('Se de de ingresar almeno seleccionar o ingresar una practica agricola');
		}
		return repo.save(toSave)
	}
}
