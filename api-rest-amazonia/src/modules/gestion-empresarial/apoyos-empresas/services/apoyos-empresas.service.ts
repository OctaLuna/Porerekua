import { Injectable } from '@nestjs/common';
import { CreateApoyosEmpresaDto } from '../dto/create-apoyos-empresa.dto';
import { UpdateApoyosEmpresaDto } from '../dto/update-apoyos-empresa.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ApoyoEmpresa } from '../entities/apoyo-empresa.entity';
import { EntityManager, Repository } from 'typeorm';
import { ApoyosService } from 'src/modules/catalogos/apoyos/service/apoyos.service';
import { MyBadRequestException } from 'src/shared/exceptions';

@Injectable()
export class ApoyosEmpresasService {
	constructor(
		@InjectRepository(ApoyoEmpresa)
		private readonly apoyoEmpresaRepository: Repository<ApoyoEmpresa>,
		private readonly apoyosService: ApoyosService,
	){}

	async create(idEmpresa: number,data: CreateApoyosEmpresaDto,manager?: EntityManager){
		const repo = manager ? manager.getRepository(ApoyoEmpresa) : this.apoyoEmpresaRepository;
		const apoyosResult: ApoyoEmpresa[] = []
		if (data.seleccionados && data.seleccionados.length > 0){
			const apoyos = await this.apoyosService.findAllByIds(data.seleccionados);
			apoyos.map((a) => {
				apoyosResult.push({
					idEmpresa: idEmpresa,
					idApoyo: a.id
				})
			})
		}
		if (data.otros && data.otros.length > 0){
			const apoyo = await this.apoyosService.createMany(data.otros,manager);
			apoyo.map((a) => {
				apoyosResult.push({
					idEmpresa: idEmpresa,
					idApoyo: a.id
				})
			})
		}
		if (apoyosResult.length === 0){
			throw new MyBadRequestException(`Minimamente se debe ingresar o un apoyo para la empresa`);
		}
		return await repo.save(apoyosResult);
	}
}
