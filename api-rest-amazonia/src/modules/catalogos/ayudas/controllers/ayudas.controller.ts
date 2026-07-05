import { Controller, Get, Post, Body, Patch, Param, Delete, Res } from '@nestjs/common';
import { AyudasService } from '../services/ayudas.service';
import { CreateAyudaDto } from '../dto/create-ayuda.dto';
import { UpdateAyudaDto } from '../dto/update-ayuda.dto';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FindAllAyudasFormsDto } from '../dto/find-all-ayudas-forms.dto';
import { Response } from 'express';
import { AyudaFormsTemplate } from '../find-template';
import { OkRes } from 'src/shared/utils';

@ApiTags('Tipos de ayuda')
@Controller('ayudas')
export class AyudasController {
	constructor(private readonly ayudasService: AyudasService) { }

	@Get('forms')
	@ApiOperation({
		summary: 'Api para obtener ayudas'
	})
	@ApiOkResponse({
		description: 'Respuesta en caso de obtener las ayudas',
		type: FindAllAyudasFormsDto
	})
	async findAllForms(
		@Res() res: Response
	){
		const ayudas = await this.ayudasService.findAll(AyudaFormsTemplate);
		return OkRes(res,{
			ayudas: ayudas
		});
	}
}
