import { Controller, Get, Post, Body, Patch, Param, Delete, Res } from '@nestjs/common';
import { MotivosService } from '../services/motivos.service';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { OkRes } from 'src/shared/utils';
import { motivoFormsTemplate } from '../find-templates';
import { findAllMotivosFormsDto } from '../dto/outputs/find-all-motivos-forms.dto';

@ApiTags('Catálogos')
@Controller('motivos')
export class MotivosController {
	constructor(
		private readonly motivosService: MotivosService
	) { }

	@Get('forms')
	@ApiOperation({
		summary: 'Api para obtener motivos de empresa de poyo a la amzonia para el formulario'
	})
	@ApiOkResponse({
		description: 'Respuesta en caso de obtener los motivos',
		type: findAllMotivosFormsDto
	})
	async findAll(
		@Res() res: Response
	){
		const motivos = await this.motivosService.findAll(motivoFormsTemplate);
		return OkRes(res,{
			motivos: motivos
		})
	}
}
