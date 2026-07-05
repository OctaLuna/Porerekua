import { Injectable } from '@nestjs/common';
import { CreateApoyoDto } from '../dto/inputs/create-apoyo.dto';
import { UpdateApoyoDto } from '../dto/inputs/update-apoyo.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Apoyo } from '../entities/apoyo.entity';
import { EntityManager, FindManyOptions, In, Repository } from 'typeorm';
import { Ayuda } from '../../ayudas/entities/ayuda.entity';
import { MyBadRequestException } from 'src/shared/exceptions';

@Injectable()
export class ApoyosService {
	constructor(
		@InjectRepository(Apoyo)
		private readonly apoyoRepository: Repository<Apoyo>
	){} 

	async findAll(){
		const apoyo = await this.apoyoRepository.find({
			select: {
				id: true,
				nombre: true,
			},
			where: {
				esPropio: false
			}
		})
		return apoyo;
	}

	async findAllByIds(ids: number[]){
		const apoyos = await this.apoyoRepository.find({
			where: {
				id: In(ids)
			},
			select: {
				id: true,
				nombre: true
			}
		})
		if (apoyos.length !== ids.length){
			throw new MyBadRequestException('Solo se puede ingresar IDs de apoyos validos')
		}
		return apoyos;
	}

	async createMany(otros: string[],manager?: EntityManager){
		const repo = manager ? manager.getRepository(Apoyo) : this.apoyoRepository;
		const toSave = otros.map((o) => ({
			nombre: o,
			esPropio: true
		}))
		return repo.save(toSave);
	}
}
