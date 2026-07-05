import { Injectable } from '@nestjs/common';
import { CreateConservacionAnimaleDto } from '../dto/create-conservacion-animale.dto';
import { UpdateConservacionAnimaleDto } from '../dto/update-conservacion-animale.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ConservacionAnimal } from '../entities/conservacion-animal.entity';
import { EntityManager, Repository } from 'typeorm';
import { EspeciesAnimalesService } from 'src/modules/catalogos/especies-animales/services/especies-animales.service';
import { MyBadRequestException } from 'src/shared/exceptions';

@Injectable()
export class ConservacionAnimalesService {
	constructor(
		@InjectRepository(ConservacionAnimal)
		private readonly conservacionAnimalRepository: Repository<ConservacionAnimal>,
		private readonly especiesAnimalesService: EspeciesAnimalesService
	){}

	async createMany(idProyecto: number,data: CreateConservacionAnimaleDto,manager? : EntityManager){
		const repo = manager ? manager.getRepository(ConservacionAnimal) : this.conservacionAnimalRepository;
		const toSave: ConservacionAnimal[] = [];
		if (data.seleccionados && data.seleccionados.length > 0){
			const especies = await this.especiesAnimalesService.findAllByIds(data.seleccionados);
			especies.map((e) => {
				toSave.push({
					idProyecto: idProyecto,
					idEspecie: e.id
				})
			})
		}
		if (data.otros && data.otros.length > 0){
			const especies = await this.especiesAnimalesService.createMany(data.otros,manager);
			especies.map((e) => {
				toSave.push({
					idProyecto: idProyecto,
					idEspecie: e.id
				})
			})
		}
		if (toSave.length === 0){
			throw new MyBadRequestException('Se debe selccionar o ingresar almenos una especie a animal en que se hace al conservacion')
		}
		return await repo.save(toSave)
	}
}
