import { Injectable } from '@nestjs/common';
import { CreateAreasDesarrolloDto } from '../dto/create-areas-desarrollo.dto';
import { UpdateAreasDesarrolloDto } from '../dto/update-areas-desarrollo.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { AreaDesarrollo } from '../entities/area-desarrollo.entity';
import { EntityManager, In, Repository } from 'typeorm';
import { MyBadRequestException } from 'src/shared/exceptions';

@Injectable()
export class AreasDesarrolloService {
	constructor(
		@InjectRepository(AreaDesarrollo)
		private readonly areaDesarrolloRepository: Repository<AreaDesarrollo>
	){}

	async findAll(){
		const areasDesarrollo = await this.areaDesarrolloRepository.find({
			select: {
				id: true,
				nombre: true
			},
		})
		return areasDesarrollo;
	}

	async findAllByIds(ids: number[]){
		const areas = await this.areaDesarrolloRepository.find({
			where: {
				id: In(ids)
			}
		})
		if (areas.length !== ids.length){
			throw new MyBadRequestException('Solo se aceptan IDs de areas de desarrollo validas')
		}
		return areas;
	}

	async createMany(otros: string[],manager?: EntityManager){
		const repo = manager ? manager.getRepository(AreaDesarrollo) : this.areaDesarrolloRepository;
		const toSave = otros.map((o) => ({
			nombre: o,
			esPropio: true
		}))
		return await repo.save(toSave);
	}
}
