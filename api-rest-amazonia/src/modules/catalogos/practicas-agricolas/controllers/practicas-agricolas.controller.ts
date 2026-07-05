import { Controller, Get, Post, Body, Patch, Param, Delete, Res } from '@nestjs/common';
import { PracticasAgricolasService } from '../services/practicas-agricolas.service';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FindAllPracticasAgricolasFormsDto } from '../dto/find-all-practicas-agricolas-forms.dto';
import { Response } from 'express';
import { PracticasAgricolasFormsTemplate } from '../find-templates';
import { OkRes } from 'src/shared/utils';

@ApiTags('Practicas agricolas')
@Controller('practicas-agricolas')
export class PracticasAgricolasController {
	constructor(private readonly practicasAgricolasService: PracticasAgricolasService) { }

	@Get('forms')
	@ApiOperation({
		summary: 'Api para obtener la practicas agricolas'
	})
	@ApiOkResponse({
		description: 'Respuesta en caso de obtenre la practica agricolas',
		type: FindAllPracticasAgricolasFormsDto
	})
	async findAllForms(
		@Res() res: Response
	){
		const practicasAgricolas = await this.practicasAgricolasService.findAll(PracticasAgricolasFormsTemplate);
		return OkRes(res,{
			practicasAgricolas: practicasAgricolas
		})
	}
}
