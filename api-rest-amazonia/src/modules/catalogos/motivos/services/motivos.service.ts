import { Injectable } from '@nestjs/common';
import { CreateMotivoDto } from '../dto/inputs/create-motivo.dto';
import { UpdateMotivoDto } from '../dto/inputs/update-motivo.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Motivo } from '../entities/motivo.entity';
import { EntityManager, FindManyOptions, In, Repository } from 'typeorm';
import { MyBadRequestException } from 'src/shared/exceptions';

@Injectable()
export class MotivosService {
	constructor(
		@InjectRepository(Motivo)
		private readonly motivoRepository: Repository<Motivo>
	){}

	async findAll(selectTemplate: FindManyOptions<Motivo>): Promise<Motivo[]>{
		const motivos = await this.motivoRepository.find({
			...selectTemplate
		})
		return motivos
	}

	async findAllByIds(ids: number[]){
		const motivos = await this.motivoRepository.find({
			where: {
				id: In(ids)
			},
			select: {
				id: true,
				nombre: true,
			}
		})
		if (motivos.length !== ids.length){
			throw new MyBadRequestException(`Solo se aceptan IDs de motivos de apoyo existentes`);
		}
		return motivos;
	}

	async createMany(otros: string[],manager?: EntityManager){
		const repo = manager ? manager.getRepository(Motivo) : this.motivoRepository;
		const motivos = otros.map((o) => ({
			nombre: o,
			esPropio: true
		}))
		return repo.save(motivos);
	}
}
