import { Injectable } from '@nestjs/common';
import { CreateEspeciesAnimaleDto } from '../dto/create-especies-animale.dto';
import { UpdateEspeciesAnimaleDto } from '../dto/update-especies-animale.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { EspecieAnimal } from '../entities/especie-animal.entity';
import { EntityManager, FindManyOptions, In, Repository } from 'typeorm';
import { MyBadRequestException } from 'src/shared/exceptions';

@Injectable()
export class EspeciesAnimalesService {
	constructor(
		@InjectRepository(EspecieAnimal)
		private readonly especieAnimalRepository: Repository<EspecieAnimal>
	){}

	async findAll(selectTemplate: FindManyOptions<EspecieAnimal>){
		const especiesAnimales = await this.especieAnimalRepository.find({
			...selectTemplate
		})
		return especiesAnimales;
	}

	async findAllByIds(ids: number[]){
		const especies = await this.especieAnimalRepository.find({
			where: {
				id: In(ids)
			},
			select: {
				id: true,
				nombre: true
			}
		})
		if (especies.length !== ids.length){
			throw new MyBadRequestException('Solo se aceptan IDs de espeies validas')
		}
		return especies;
	}

	async createMany(otros: string[],manager?: EntityManager){
		const repo = manager ? manager.getRepository(EspecieAnimal) : this.especieAnimalRepository;
		const toSave = otros.map((o) => ({
			nombre: o,
			esPropio: true
		}))
		return await repo.save(toSave);
	}
}
