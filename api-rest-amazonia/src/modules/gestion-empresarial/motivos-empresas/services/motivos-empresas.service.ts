import { Injectable } from '@nestjs/common';
import { CreateMotivosEmpresaDto } from '../dto/create-motivos-empresa.dto';
import { UpdateMotivosEmpresaDto } from '../dto/update-motivos-empresa.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { MotivoEmpresa } from '../entities/motivo-empresa.entity';
import { EntityManager, Repository } from 'typeorm';
import { MotivosService } from 'src/modules/catalogos/motivos/services/motivos.service';
import { MyBadRequestException } from 'src/shared/exceptions';

@Injectable()
export class MotivosEmpresasService {
	constructor(
		@InjectRepository(MotivoEmpresa)
		private readonly motivoEmpresaRepository: Repository<MotivoEmpresa>,
		private readonly motivosService: MotivosService,
	){}

	async create(idEmpresa: number,data: CreateMotivosEmpresaDto,manager?: EntityManager){
		const repo = manager ? manager.getRepository(MotivoEmpresa) : this.motivoEmpresaRepository;
		const motivosResult: MotivoEmpresa[] = [];
		if (data.seleccionados && data.seleccionados.length > 0){
			const motivos = await this.motivosService.findAllByIds(data.seleccionados);
			motivos.map((m) => {
				motivosResult.push({
					idEmpresa: idEmpresa,
					idMotivo: m.id
				})
			})
		}
		if (data.otros && data.otros.length > 0){
			const motivos = await this.motivosService.createMany(data.otros,manager);
			motivos.map((m) => {
				motivosResult.push({
					idEmpresa: idEmpresa,
					idMotivo: m.id
				})
			})
		}
		if (motivosResult.length === 0){
			throw new MyBadRequestException('Se debe de ingresar al menos un tipo de apoyo');
		}
		return await repo.save(motivosResult);
	}
}
