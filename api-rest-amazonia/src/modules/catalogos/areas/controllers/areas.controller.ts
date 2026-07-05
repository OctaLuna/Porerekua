import { Controller, Get, Post, Body, Patch, Param, Delete, Res } from '@nestjs/common';
import { AreasService } from '../services/areas.service';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { OkRes } from 'src/shared/utils';
import { FindAllAreasDto } from '../dto/find-all-areas.dto';

@ApiTags('Catálogos')
@Controller('areas')
export class AreasController {
	constructor(
		private readonly areasService: AreasService
	) { }

	@Get()
	@ApiOperation({
		summary: 'Api para obtener las areas de desarrollo de proyecto'
	})
	@ApiOkResponse({
		description: 'Respuesta en caso de obtener las areas de proyectos',
		type: FindAllAreasDto
	})
	async findAll(
		@Res() res: Response
	){
		const areas = await this.areasService.findAll();
		return OkRes(res,{
			areas: areas
		})
	}
}
