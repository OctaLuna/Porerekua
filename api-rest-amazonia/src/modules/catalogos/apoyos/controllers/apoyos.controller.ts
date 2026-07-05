import { Controller, Get, Post, Body, Patch, Param, Delete, Res } from '@nestjs/common';
import { ApoyosService } from '../service/apoyos.service';
import { CreateApoyoDto } from '../dto/inputs/create-apoyo.dto';
import { UpdateApoyoDto } from '../dto/inputs/update-apoyo.dto';
import { Response } from 'express';
import { OkRes } from 'src/shared/utils';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FindAllApoyoFormsDto } from '../dto/outputs/find-all-apoyo-forms.dto';

@ApiTags('Catálogos')
@Controller('apoyos')
export class ApoyosController {
	constructor(
		private readonly apoyosService: ApoyosService
	) { }

	@Get('forms')
	@ApiOperation({
		summary: 'Api para obtener los apoyos paraa el formulario'
	})
	@ApiOkResponse({
		description: 'Respuesta en caso de obtener los apoyos para el formulario',
		type: FindAllApoyoFormsDto
	})
	async findAllForms(
		@Res() res: Response
	){
		const apoyos = await this.apoyosService.findAll()
		return OkRes(res,{
			apoyos: apoyos
		})
	}
}
