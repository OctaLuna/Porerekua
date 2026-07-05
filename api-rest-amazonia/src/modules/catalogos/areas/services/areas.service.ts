import { Injectable } from '@nestjs/common';
import { CreateAreaDto } from '../dto/create-area.dto';
import { UpdateAreaDto } from '../dto/update-area.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Area } from '../entities/area.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AreasService {
	constructor(
		@InjectRepository(Area)
		private readonly areaRepository: Repository<Area>
	){}

	async findAll(){
		const areas = await this.areaRepository.find({
			select: {
				id: true, nombre: true
			}
		});
		return areas;
	}
}
