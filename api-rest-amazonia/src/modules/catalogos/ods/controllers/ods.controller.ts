import { Controller, Get, Post, Body, Patch, Param, Delete, Res } from '@nestjs/common';
import { OdsService } from '../services/ods.service';
import { Response } from 'express';
import { OkRes } from 'src/shared/utils';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FindAllOdsDto } from '../dto/find-all-ods.dto';

@ApiTags('Catálogos')
@Controller('ods')
export class OdsController {
	constructor(
		private readonly odsService: OdsService
	) { }

	@Get()
	@ApiOperation({
		summary: 'Api para obtener los ods'
	})
	@ApiOkResponse({
		description: 'Respuesta en caso de obtener los ods',
		type: FindAllOdsDto
	})
	async findAll(
		@Res() res: Response
	){
		const ods = await this.odsService.findAll();
		return OkRes(res,{
			ods: ods
		})
	}
}