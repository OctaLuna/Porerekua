import { Controller, Get, Post, Body, Patch, Param, Delete, Res } from '@nestjs/common';
import { AreasDesarrolloService } from '../services/areas-desarrollo.service';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { OkRes } from 'src/shared/utils';
import { FindAllAreaDesarrolloDto } from '../dto/find-all-area-desarrollo.dto';

@ApiTags('Areas de desarrollo indigena')
@Controller('areas-desarrollo')
export class AreasDesarrolloController {
	constructor(
		private readonly areasDesarrolloService: AreasDesarrolloService
	) { }

	@Get()
	@ApiOperation({
		summary: 'Api para obtener las areas de desarrollo'
	})
	@ApiOkResponse({
		description: 'Resputa en caso de obtener las areas de desarrollo',
		type: FindAllAreaDesarrolloDto
	})
	async findAll(
		@Res() res: Response
	){
		const areaDesarrollo = await this.areasDesarrolloService.findAll();
		return OkRes(res,{
			areasDesarrollo: areaDesarrollo
		})
	}
}
