import { Injectable } from '@nestjs/common';
import { CreateFormasJuridicaDto } from '../dto/inputs/create-formas-juridica.dto';
import { UpdateFormasJuridicaDto } from '../dto/inputs/update-formas-juridica.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FormaJuridica } from '../entities/forma-juridica.entity';
import { EntityManager, FindManyOptions, Repository } from 'typeorm';
import { FormaJuridicaFormsDto } from '../dto/forma-juridica-forms.dto';
import { MyBadRequestException, MyNotFoundException } from 'src/shared/exceptions';

@Injectable()
export class FormasJuridicasService {
	constructor(
		@InjectRepository(FormaJuridica)
		private readonly formaJuridicaRepository: Repository<FormaJuridica>
	) { }

	create(createFormasJuridicaDto: CreateFormasJuridicaDto) {
		return 'This action adds a new formasJuridica';
	}

	async findAll(templateSelect: FindManyOptions<FormaJuridica>) {
		const formasJuridicas = await this.formaJuridicaRepository.find({
			...templateSelect,
		})
		return formasJuridicas;
	}

	async findOneOrCreate(data: CreateFormasJuridicaDto,manager?: EntityManager){
		const repo = manager ? manager.getRepository(FormaJuridica) : this.formaJuridicaRepository;
		if (data.id){
			const forma = await this.formaJuridicaRepository.findOne({
				where: {
					id: data.id
				},
				select: {
					id: true,
					nombre: true
				}
			})
			if (!forma) {
				throw new MyNotFoundException(`No existe la forma juridica con id = ${data.id}`);
			}
			return forma
		}
		if (data.otro){
			const forma = new FormaJuridica();
			forma.nombre = data.otro;
			forma.esPropio = true;
			const formaSaved = await repo.save(forma);
			return {
				id: formaSaved.id,
				nombre: formaSaved.nombre
			}
		}
		throw new MyBadRequestException('La empresa deber tener una forma juridica');
	}
}
