import { Controller, Get, Post, Body, Patch, Param, Delete, Res } from '@nestjs/common';
import { FormasJuridicasService } from '../services/formas-juridicas.service';
import { Response } from 'express';
import { OkRes } from 'src/shared/utils';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FindAllFormasJuridicasFormsDto } from '../dto/outputs/find-all-formas-juridicas-forms.dto';
import { formaJuridicaFormsTemplate } from '../find-templates';

@ApiTags('Formas Juridicas')
@Controller('formas-juridicas')
export class FormasJuridicasController {
	constructor(
		private readonly formasJuridicasService: FormasJuridicasService
	) { }

	@Get('forms')
	@ApiOperation({
		summary: 'Api para obtener las formas juridicas paara el formulario',
	})
	@ApiOkResponse({
		description: 'Repsuesta en caso de obtener las formas juridicas para el formulario',
		type: FindAllFormasJuridicasFormsDto
	})
	async findAllForms(
		@Res() res: Response
	){
		const formasJuridicas = await this.formasJuridicasService.findAll(formaJuridicaFormsTemplate);
		return OkRes(res,{
			formasJuridicas: formasJuridicas
		})
	}
}
