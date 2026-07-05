import { Injectable } from '@nestjs/common';
import { CreateMunicipioDto } from '../dto/create-municipio.dto';
import { UpdateMunicipioDto } from '../dto/update-municipio.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Municipio } from '../entities/municipio.entity';
import { In, Repository } from 'typeorm';
import { MyBadRequestException, MyNotFoundException } from 'src/shared/exceptions';
import { buildPagination } from 'src/shared/utils/pagination.util';

@Injectable()
export class MunicipiosService {
	constructor(
		@InjectRepository(Municipio)
		private readonly municipioRepository: Repository<Municipio>
	){}

	async findAll(){
		const municipios = await this.municipioRepository.find({
			select: {
				id: true,
				nombre: true
			}
		})
		return municipios;
	}

	async findAllFiltered(params?: { page?: number; limit?: number; departamento?: number; search?: string }) {
		const page = params?.page ?? 1;
		const limit = params?.limit ?? 50;

		const qb = this.municipioRepository
			.createQueryBuilder('m')
			.leftJoinAndSelect('m.departamento', 'departamento')
			.leftJoinAndSelect('m.comunidadesIndigenas', 'comunidades')
			.orderBy('m.nombre', 'ASC');

		if (params?.search) {
			qb.andWhere('m.nombre ILIKE :search', { search: `%${params.search}%` });
		}

		if (params?.departamento) {
			qb.andWhere('m.idDepartamento = :departamento', { departamento: params.departamento });
		}

		const [municipios, total] = await qb
			.skip((page - 1) * limit)
			.take(limit)
			.getManyAndCount();

		return buildPagination(municipios, total, page, limit);
	}

	async findComunidadesByMunicipio(id: number) {
		const municipio = await this.municipioRepository.findOne({
			where: { id },
			select: {
				id: true,
				nombre: true,
				comunidadesIndigenas: { id: true, nombre: true }
			},
			relations: { comunidadesIndigenas: true }
		});
		if (!municipio) {
			throw new MyNotFoundException(`Municipio con ID ${id} no encontrado`);
		}
		return municipio.comunidadesIndigenas.sort((a, b) => a.nombre.localeCompare(b.nombre));
	}

	async findAllByIds(ids: number[]){
		const municipios = await this.municipioRepository.find({
			where: {
				id: In(ids),
			},
			select: {
				id: true,
				nombre: true,
				comunidadesIndigenas: {
					id: true,
					nombre: true
				}
			},
			relations: {
				comunidadesIndigenas: true
			}
		})
		if (municipios.length !== ids.length){
			throw new MyBadRequestException('Solo se aceptan IDs de municipios validos');
		}
		return municipios;
	}
}
