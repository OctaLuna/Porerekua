import { Controller, Get, Post, Body, Patch, Param, Delete, Res } from '@nestjs/common';
import { ActoresMunicipalesService } from '../services/actores-municipales.service';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FindAllActoresMunicipalesFormsDto } from '../dto/find-all-actores-municipales-forms.dto';
import { Response } from 'express';
import { ActorMunicipalFormsTemplate } from '../find-template/actor-municipal-forms.template';
import { OkRes } from 'src/shared/utils';

@ApiTags('Actores municipales')
@Controller('actores-municipales')
export class ActoresMunicipalesController {
	constructor(private readonly actoresMunicipalesService: ActoresMunicipalesService) { }

	@Get('forms')
	@ApiOperation({
		summary: 'Api para obtener actores municipales'
	})
	@ApiOkResponse({
		description: 'Respuesta en caso de obtener a los actores municipales',
		type: FindAllActoresMunicipalesFormsDto
	})
	async findAll(
		@Res() res: Response
	){
		const actoresMunicipales = await this.actoresMunicipalesService.findAll(ActorMunicipalFormsTemplate);
		return OkRes(res,{
			actoresMunicipales: actoresMunicipales
		})
	}
}
