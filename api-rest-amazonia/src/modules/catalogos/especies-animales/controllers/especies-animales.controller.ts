import { Controller, Get, Res } from '@nestjs/common';
import { EspeciesAnimalesService } from '../services/especies-animales.service';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FindAllEspeciesAnimalesFormsDto } from '../dto/find-all-especies-animales-forms.dto';
import { Response } from 'express';
import { EspecieAnimalFormsTemplate } from '../find-templates';
import { OkRes } from 'src/shared/utils';

@ApiTags('Especies animales')
@Controller('especies-animales')
export class EspeciesAnimalesController {
	constructor(
		private readonly especiesAnimalesService: EspeciesAnimalesService
	) { }

	@Get('forms')
	@ApiOperation({
		summary: 'Api para obtener la especies animales'
	})
	@ApiOkResponse({
		description: 'Respuesta al obtener las especies animales',
		type: FindAllEspeciesAnimalesFormsDto
	})
	async findAll(
		@Res() res: Response
	){
		const especiesAnimales = await this.especiesAnimalesService.findAll(EspecieAnimalFormsTemplate);
		return OkRes(res,{
			especiesAnimales: especiesAnimales
		})
	}
}
