import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PracticaAgricola } from '../entities/practica-agricola.entity';
import { EntityManager, FindManyOptions, In, Repository } from 'typeorm';
import { MyBadRequestException } from 'src/shared/exceptions';

@Injectable()
export class PracticasAgricolasService {
	constructor(
		@InjectRepository(PracticaAgricola)
		private readonly practicaAgricolaRepository: Repository<PracticaAgricola>
	){}

	async findAll(selectTemplate: FindManyOptions<PracticaAgricola>){
		const practicasAgricolas = await this.practicaAgricolaRepository.find({
			...selectTemplate
		})
		return practicasAgricolas;
	}

	async findAllByIds(ids: number[]){
		const practicas = await this.practicaAgricolaRepository.find({
			where: {
				id: In(ids)
			},
			select: {
				id: true,
				nombre: true
			}
		})
		if (practicas.length !== ids.length){
			throw new MyBadRequestException('Sol se aceptan IDs de practicas agricolas validas')
		}
		return practicas;
	}

	async createMany(otros: string[],manager?: EntityManager){
		const repo = manager ? manager.getRepository(PracticaAgricola) : this.practicaAgricolaRepository;
		const practicas = otros.map((p) => ({
			nombre: p,
			esPropio: true
		}))
		return await repo.save(practicas);
	}
}
