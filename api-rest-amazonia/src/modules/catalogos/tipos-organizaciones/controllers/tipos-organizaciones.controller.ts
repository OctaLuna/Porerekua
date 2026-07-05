import { Controller, Get, Post, Body, Patch, Param, Delete, Res } from '@nestjs/common';
import { TiposOrganizacionesService } from '../services/tipos-organizaciones.service';
import { CreateTiposOrganizacioneDto } from '../dto/create-tipos-organizacione.dto';
import { UpdateTiposOrganizacioneDto } from '../dto/update-tipos-organizacione.dto';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FindAllTiposOrganizacionesFormsDto } from '../dto/find-all-tipos-organizaciones-forms.dto';
import { Response } from 'express';
import { TipoOrganizacionFormsTemplate } from '../find-templates';
import { OkRes } from 'src/shared/utils';

@ApiTags('Tipos de organizaciones')
@Controller('tipos-organizaciones')
export class TiposOrganizacionesController {
	constructor(private readonly tiposOrganizacionesService: TiposOrganizacionesService) { }

	@Get('forms')
	@ApiOperation({
		summary: 'Api para obtener los tipos de organizacion',
	})
	@ApiOkResponse({
		description: 'Respusta en caso de obtener los tipos de organizaciones',
		type: FindAllTiposOrganizacionesFormsDto
	})
	async findAllForms(
		@Res() res: Response
	){
		const tiposOrganizaciones = await this.tiposOrganizacionesService.findAll(TipoOrganizacionFormsTemplate);
		return OkRes(res,{
			tiposOrganizaciones: tiposOrganizaciones
		})
	}
}