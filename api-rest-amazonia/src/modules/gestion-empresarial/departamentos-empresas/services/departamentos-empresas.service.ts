import { Injectable } from '@nestjs/common';
import { CreateDepartamentosEmpresaDto } from '../dto/create-departamentos-empresa.dto';
import { UpdateDepartamentosEmpresaDto } from '../dto/update-departamentos-empresa.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DepartamentoEmpresa } from '../entities/departamento-empresa.entity';
import { EntityManager, Repository } from 'typeorm';
import { DepartamentosService } from 'src/modules/ubicaciones-geograficas/departamentos/services/departamentos.service';

@Injectable()
export class DepartamentosEmpresasService {
	constructor(
		@InjectRepository(DepartamentoEmpresa)
		private readonly departamentoEmpresaRepository: Repository<DepartamentoEmpresa>,
		private readonly departamentosService: DepartamentosService
	){}

	async create(idEmpresa: number,idsDepartamentos: number[],manager?: EntityManager){
		const repo = manager ? manager.getRepository(DepartamentoEmpresa) : this.departamentoEmpresaRepository
		const departamentos = await this.departamentosService.findAllByIds(idsDepartamentos);
		const toSave: DepartamentoEmpresa[] = departamentos.map((depa) => ({
			idEmpresa: idEmpresa,
			idDepartamento: depa.id
		}))
		return repo.save(toSave);
	}
}
