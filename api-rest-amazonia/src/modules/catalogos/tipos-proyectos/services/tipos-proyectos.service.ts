import { Injectable } from '@nestjs/common';
import { CreateTiposProyectoDto } from '../dto/create-tipos-proyecto.dto';
import { UpdateTiposProyectoDto } from '../dto/update-tipos-proyecto.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { TipoProyecto } from '../entities/tipo-proyecto.entity';
import { EntityManager, FindManyOptions, Repository } from 'typeorm';
import { MyBadRequestException } from 'src/shared/exceptions';

@Injectable()
export class TiposProyectosService {
	constructor(
		@InjectRepository(TipoProyecto)
		private readonly tipoProyectoRepository: Repository<TipoProyecto>
	){}

	async findAll(selectTemplate: FindManyOptions<TipoProyecto>){
		const tiposProyectos = await this.tipoProyectoRepository.find({
			...selectTemplate
		})
		return tiposProyectos;
	}

	async findOneOrCreate(data: CreateTiposProyectoDto,manager?: EntityManager){
		const repo = manager ? manager.getRepository(TipoProyecto) : this.tipoProyectoRepository;
		if (data.id){
			const tipoProyecto = await this.tipoProyectoRepository.findOne({
				where: {
					id: data.id
				}
			})
			if (!tipoProyecto){
				throw new MyBadRequestException(`El tipo de proyecto con id = ${data.id} no es valido`)
			}
			return {
				id: tipoProyecto.id,
				nombre: tipoProyecto.nombre
			}
		}
		if (data.otros){
			const tipoProyecto = new TipoProyecto();
			tipoProyecto.nombre = data.otros;
			tipoProyecto.esPropio = true
			const tipoProyectoSaved = await repo.save(tipoProyecto);
			return {
				id: tipoProyectoSaved.id,
				nombre: tipoProyecto.nombre
			}
		}
		throw new MyBadRequestException('Se de be de ingrear algun tipo de proyecto o crear otro')
	}
}
