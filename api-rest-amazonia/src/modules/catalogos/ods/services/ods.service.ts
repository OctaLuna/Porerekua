import { Injectable } from '@nestjs/common';
import { CreateOdDto } from '../dto/create-od.dto';
import { UpdateOdDto } from '../dto/update-od.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Ods } from '../entities/ods.entity';
import { In, Repository } from 'typeorm';
import { MyBadRequestException } from 'src/shared/exceptions';

@Injectable()
export class OdsService {
	constructor(
		@InjectRepository(Ods)
		private readonly odsRepository: Repository<Ods>
	){}

	async findAll(){
		const ods = await this.odsRepository.find({
			select: {
				id: true,
				nombre: true,
			}
		})
		return ods;
	}

	async findAllByIds(ids: number[]){
		const ods = await this.odsRepository.find({
			where: {
				id: In(ids)
			},
			select: {
				id: true,
				nombre: true
			}
		})
		if (ods.length !== ids.length){
			throw new MyBadRequestException('Solo se aceptan ods existentes')
		}
		return ods;
	}
}
