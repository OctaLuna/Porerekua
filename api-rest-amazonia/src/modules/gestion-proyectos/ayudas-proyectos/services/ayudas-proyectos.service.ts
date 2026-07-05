import { Injectable } from '@nestjs/common';
import { CreateAyudasProyectoDto } from '../dto/create-ayudas-proyecto.dto';
import { UpdateAyudasProyectoDto } from '../dto/update-ayudas-proyecto.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { AyudaProyecto } from '../entities/ayuda-proyecto.entity';
import { EntityManager, Repository } from 'typeorm';
import { AyudasService } from 'src/modules/catalogos/ayudas/services/ayudas.service';
import { MyBadRequestException } from 'src/shared/exceptions';

@Injectable()
export class AyudasProyectosService {
	constructor(
		@InjectRepository(AyudaProyecto)
		private readonly ayudaProyectoRepository: Repository<AyudaProyecto>,
		private readonly ayudasService: AyudasService
	){}

	async createMany(idProyecto: number, data: CreateAyudasProyectoDto,manager?: EntityManager){
		const repo = manager ? manager.getRepository(AyudaProyecto) : this.ayudaProyectoRepository;
		const ayudasResult: AyudaProyecto[] = [];
		if (data.seleccionados){
			const ayudas = await this.ayudasService.findAllByIds(data.seleccionados);
			ayudas.map((a) => {
				ayudasResult.push({
					idProyecto: idProyecto,
					idAyuda: a.id
				})
			})
		} 
		if (data.otros){
			const ayudas = await this.ayudasService.createMany(data.otros,manager);
			ayudas.map((a) => {
				ayudasResult.push({
					idProyecto: idProyecto,
					idAyuda: a.id
				})
			})
		}
		if (ayudasResult.length === 0){
			throw new MyBadRequestException('Se dede seleccionar o ingresar algun tipo de ayuda del proyecto')
		}
		return await repo.save(ayudasResult);
	}
}
