import { Injectable } from '@nestjs/common';
import { CreateTiposOrganizacioneDto } from '../dto/create-tipos-organizacione.dto';
import { UpdateTiposOrganizacioneDto } from '../dto/update-tipos-organizacione.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { TipoOrganizacion } from '../entities/tipo-organizacion.entity';
import { EntityManager, Repository } from 'typeorm';
import { MyBadRequestException, MyNotFoundException } from 'src/shared/exceptions';

@Injectable()
export class TiposOrganizacionesService {
	constructor(
		@InjectRepository(TipoOrganizacion)
		private readonly tipoOrganizacionRepository: Repository<TipoOrganizacion> 
	){}

	async findAll(selectTemplate){
		const tiposOrganizaciones = await this.tipoOrganizacionRepository.find({
			...selectTemplate
		})
		return tiposOrganizaciones;
	}

	async findOneOrCreate(data: CreateTiposOrganizacioneDto, manager?: EntityManager): Promise<TipoOrganizacion>{
		const repo = manager ? manager.getRepository(TipoOrganizacion) : this.tipoOrganizacionRepository;
		if (data.id){
			const tipo = await this.tipoOrganizacionRepository.findOne({
				where: {
					id: data.id
				}
			})
			if (!tipo){
				throw new MyNotFoundException(`No se encontro el tipo de organizacion con el id = ${data.id}`)
			}
			return tipo;
		}
		if (data.otro){
			const tipo = new TipoOrganizacion();
			tipo.nombre = data.otro;
			tipo.esPropio = true;
			return await repo.save(tipo)
		}
		throw new MyBadRequestException(`Se debe de seleccionar o ingrear como otro un tipo de organizacion`);
	}
}
