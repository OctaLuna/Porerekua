import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateLocalidadesProyectoDto } from '../dto/create-localidades-proyecto.dto';
import { UpdateLocalidadesProyectoDto } from '../dto/update-localidades-proyecto.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { LocalidadProyecto } from '../entities/localidad-proyecto.entity';
import { EntityManager, Repository } from 'typeorm';
import { MunicipiosService } from 'src/modules/ubicaciones-geograficas/municipios/services/municipios.service';
import { ComunidadesIndigenasService } from 'src/modules/ubicaciones-geograficas/comunidades-indigenas/services/comunidades-indigenas.service';
import { Municipio } from 'src/modules/ubicaciones-geograficas/municipios/entities/municipio.entity';

@Injectable()
export class LocalidadesProyectosService {
	constructor(
		@InjectRepository(LocalidadProyecto)
		private readonly localidadProyectoRepository: Repository<LocalidadProyecto>,
		private readonly municipiosService: MunicipiosService,
		private readonly comunidadesIndigenasService: ComunidadesIndigenasService
	){}

	async createMany(idProyecto: number,data: CreateLocalidadesProyectoDto[],manager?: EntityManager){
		const repo = manager ? manager.getRepository(LocalidadProyecto) : this.localidadProyectoRepository;
		const municipios = await this.municipiosService.findAllByIds(data.map(m => m.idMunicipio));
		const toSave: any[] = [];
		data.map((m) => {
			this.verificaCorrectMunicipio(m.idMunicipio,municipios,m.idComunidadIndigena);
			toSave.push({
				idProyecto: idProyecto,
				idMunicipio: m.idMunicipio,
				idComunidad: m.idComunidadIndigena
			})
		})
		return await repo.save(toSave);
	}

	verificaCorrectMunicipio(idMunicipio: number, municipios: Municipio[], idComunidadIndigena?: number){
		const municipio = municipios.find(m => m.id === idMunicipio)!;
		if (idComunidadIndigena){
			const comunidadIndigena = municipio.comunidadesIndigenas.find(c => c.id === idComunidadIndigena);
			if (!comunidadIndigena){
				throw new BadRequestException(`La comunidad comunidad indigena con id = ${idComunidadIndigena}, no pertenece al municipio (${municipio.nombre})`);
			}
		}
		return true
	}
}
