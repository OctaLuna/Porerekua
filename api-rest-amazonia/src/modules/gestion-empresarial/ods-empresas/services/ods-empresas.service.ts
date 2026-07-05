import { Injectable } from '@nestjs/common';
import { CreateOdsEmpresaDto } from '../dto/create-ods-empresa.dto';
import { UpdateOdsEmpresaDto } from '../dto/update-ods-empresa.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { OdsEmpresa } from '../entities/ods-empresa.entity';
import { EntityManager, Repository } from 'typeorm';
import { OdsService } from 'src/modules/catalogos/ods/services/ods.service';

@Injectable()
export class OdsEmpresasService {
	constructor(
		@InjectRepository(OdsEmpresa)
		private readonly odsEmpresaRepository: Repository<OdsEmpresa>,
		private readonly odsServices: OdsService,
	){}

	async create(idEmpresa: number,ods: number[],manager?: EntityManager){
		const repo = manager ? manager.getRepository(OdsEmpresa) : this.odsEmpresaRepository;
		const odss = await this.odsServices.findAllByIds(ods);
		const odsResult: OdsEmpresa[] = odss.map((o) => ({
			idEmpresa: idEmpresa,
			idOds: o.id
		}));
		return await repo.save(odsResult);
	}
}
