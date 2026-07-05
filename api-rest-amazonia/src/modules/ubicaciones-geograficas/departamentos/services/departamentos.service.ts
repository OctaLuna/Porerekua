import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Departamento } from '../entities/departamento.entity';
import { FindManyOptions, In, Repository } from 'typeorm';
import { MyBadRequestException, MyNotFoundException } from 'src/shared/exceptions';
import { buildPagination } from 'src/shared/utils/pagination.util';

@Injectable()
export class DepartamentosService {
	constructor(
		@InjectRepository(Departamento)
		private readonly departamentoRepository: Repository<Departamento>
	){}

	async findAll(selectTemplate: FindManyOptions<Departamento>){
		const departamentos = await this.departamentoRepository.find({
			...selectTemplate,
		})
		return departamentos;
	}

	async findAllFiltered(params?: { page?: number; limit?: number; amazonico?: boolean }) {
		const page = params?.page ?? 1;
		const limit = params?.limit ?? 50;

		const qb = this.departamentoRepository
			.createQueryBuilder('d')
			.orderBy('d.nombre', 'ASC');

		if (params?.amazonico !== undefined) {
			qb.andWhere('d.amazonico = :amazonico', { amazonico: params.amazonico });
		}

		const [departamentos, total] = await qb
			.skip((page - 1) * limit)
			.take(limit)
			.getManyAndCount();

		return buildPagination(departamentos, total, page, limit);
	}

	async findAllByIds(ids: number[]){
		const departamentos = await this.departamentoRepository.find({
			where: {
				id: In(ids)
			}
		})
		if (departamentos.length !== ids.length){
			throw new MyBadRequestException(`Solo se puede ingresar IDs de departmentos validos`);
		}
		return departamentos;
	}

	async findOne(idDepartamento: number){
		const departamento = await this.departamentoRepository.findOne({
			where: {
				id: idDepartamento
			}
		})
		if (!departamento){
			throw new MyNotFoundException('EL daprtamento ingresado para al organizacion no es valido');
		}
		return departamento;
	}
}
