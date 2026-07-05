import { Controller, Get, Post, Body, Patch, Param, Delete, Res } from '@nestjs/common';
import { TiposProyectosService } from '../services/tipos-proyectos.service';
import { CreateTiposProyectoDto } from '../dto/create-tipos-proyecto.dto';
import { UpdateTiposProyectoDto } from '../dto/update-tipos-proyecto.dto';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FindAllTiposProyectosFormsDto } from '../dto/find-all-tipos-proyectos-forms.dto';
import { Response } from 'express';
import { TipoProyectoFormsTemplate } from '../find-templates';
import { OkRes } from 'src/shared/utils';

@ApiTags('Tipos de proyectos')
@Controller('tipos-proyectos')
export class TiposProyectosController {
	constructor(
		private readonly tiposProyectosService: TiposProyectosService
	) { }

	@Get('forms')
	@ApiOperation({
		summary: 'Api para obtener los tipos de proyectos'
	})
	@ApiOkResponse({
		description: 'Respuesta en caso de obtener los tipos de proyectos',
		type: FindAllTiposProyectosFormsDto
	})
	async findAll(
		@Res() res: Response
	){
		const tiposProyectos = await this.tiposProyectosService.findAll(TipoProyectoFormsTemplate);
		return OkRes(res,{
			tiposProyectos: tiposProyectos
		})
	}
}
