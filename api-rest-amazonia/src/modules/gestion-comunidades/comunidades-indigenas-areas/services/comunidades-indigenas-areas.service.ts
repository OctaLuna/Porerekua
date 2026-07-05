import { Injectable } from '@nestjs/common';
import { CreateComunidadesIndigenasAreaDto } from '../dto/create-comunidades-indigenas-area.dto';
import { UpdateComunidadesIndigenasAreaDto } from '../dto/update-comunidades-indigenas-area.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ComunidadIndigenaArea } from '../entities/comunidad-indigena-area.entity';
import { EntityManager, Repository } from 'typeorm';
import { AreasDesarrolloService } from 'src/modules/catalogos/areas-desarrollo/services/areas-desarrollo.service';
import { MyBadRequestException } from 'src/shared/exceptions';

@Injectable()
export class ComunidadesIndigenasAreasService {
	constructor(
		@InjectRepository(ComunidadIndigenaArea)
		private readonly comunidadIndigenaArea: Repository<ComunidadIndigenaArea>,
		private readonly areasDesarrollosService: AreasDesarrolloService
	){}

	async createMany(idProyecto: number,data: CreateComunidadesIndigenasAreaDto,manager?: EntityManager){
		const repo = manager ? manager.getRepository(ComunidadIndigenaArea) : this.comunidadIndigenaArea;
		const toSave: ComunidadIndigenaArea[] = [];
		if (data.seleccionados){
			const areas = await this.areasDesarrollosService.findAllByIds(data.seleccionados);
			areas.map((a) => {
				toSave.push({
					idProyecto: idProyecto,
					idArea: a.id 
				})
			})
		}
		if (data.otros){
			const areas = await this.areasDesarrollosService.createMany(data.otros,manager);
			areas.map((a) => {
				toSave.push({
					idProyecto: idProyecto,
					idArea: a.id 
				})
			})
		}
		if (toSave.length === 0){
			throw new MyBadRequestException('Se debe ingresar o selecionar almenos un tipo de area de desarrollo');
		}
		return await repo.save(toSave);
	}
}
