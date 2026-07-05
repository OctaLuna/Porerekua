import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ActorMunicipal } from '../entities/actor-municipal.entity';
import { EntityManager, FindManyOptions, In, Repository } from 'typeorm';
import { MyBadRequestException } from 'src/shared/exceptions';

@Injectable()
export class ActoresMunicipalesService {
	constructor(
		@InjectRepository(ActorMunicipal)
		private readonly actorMunicipalRepository: Repository<ActorMunicipal>
	){}

	async findAll(selectTemplate: FindManyOptions<ActorMunicipal>){
		const actoresMunicipales = await this.actorMunicipalRepository.find({
			...selectTemplate
		})
		return actoresMunicipales;
	}

	async findAllByIds(ids: number[]){
		const actores = await this.actorMunicipalRepository.find({
			where: {
				id: In(ids)
			},
			select: {
				id: true,
				nombre: true
			}
		})
		if (actores.length !== ids.length){
			throw new MyBadRequestException('Solo se aceptan actores municipales con IDs validos')
		}
		return actores;
	}

	async createMany(otros: string[],manager?: EntityManager){
		const repo = manager ? manager.getRepository(ActorMunicipal) : this.actorMunicipalRepository;
		const actores = otros.map((o) => ({
			nombre: o,
			esPropio: true
		}))
		return await repo.save(actores);
	}
}
