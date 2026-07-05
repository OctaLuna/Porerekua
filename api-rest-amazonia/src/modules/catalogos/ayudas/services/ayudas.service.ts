import { Injectable } from '@nestjs/common';
import { CreateAyudaDto } from '../dto/create-ayuda.dto';
import { UpdateAyudaDto } from '../dto/update-ayuda.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Ayuda } from '../entities/ayuda.entity';
import { EntityManager, FindManyOptions, In, Repository } from 'typeorm';
import { MyBadRequestException } from 'src/shared/exceptions';

@Injectable()
export class AyudasService {
	constructor(
		@InjectRepository(Ayuda)
		private readonly ayudaRepository: Repository<Ayuda>
	){}

	async findAll(selectTemplate: FindManyOptions<Ayuda>){
		const ayuda = await this.ayudaRepository.find({
			...selectTemplate
		})
		return ayuda;
	}

	async findAllByIds(ids: number[]){
		const ayudas = await this.ayudaRepository.find({
			where: {
				id: In(ids)
			},
			select: {
				id: true,
				nombre: true
			}
		})
		if (ayudas.length !== ids.length){
			throw new MyBadRequestException('Solo se aceptans IDs de ayudas validas')
		}
		return ayudas;
	}

	async createMany(otros: string[],manager?: EntityManager){
		const repo = manager ? manager.getRepository(Ayuda) : this.ayudaRepository;
		const toSave = otros.map((o) => ({
			nombre: o,
			esPropio: true
		}))
		return await repo.save(toSave);
	}
}
