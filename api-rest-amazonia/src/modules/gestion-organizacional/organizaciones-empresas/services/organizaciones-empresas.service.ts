import { Injectable } from '@nestjs/common';
import { CreateOrganizacionesEmpresaDto } from '../dto/create-organizaciones-empresa.dto';
import { UpdateOrganizacionesEmpresaDto } from '../dto/update-organizaciones-empresa.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { OrganizacionEmpresa } from '../entities/organizacion-empresa.entity';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class OrganizacionesEmpresasService {
	constructor(
		@InjectRepository(OrganizacionEmpresa)
		private readonly organizacionEmpresaRepository: Repository<OrganizacionEmpresa>
	){}

	async create(idEmpresa: number,organizaciones: string[],manager?: EntityManager){
		const repo = manager ? manager.getRepository(OrganizacionEmpresa) : this.organizacionEmpresaRepository;
		const toSave = organizaciones.map((o) => ({
			idEmpresa: idEmpresa,
			nombre: o
		}))
		return repo.save(toSave);
	}
}
