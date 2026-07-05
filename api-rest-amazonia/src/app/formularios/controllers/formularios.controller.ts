import { Body, Controller, Post, Res } from '@nestjs/common';
import { FormulariosService } from '../services/formularios.service';
import { ApiBadRequestResponse, ApiCreatedResponse, ApiNotFoundResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RegisterFormularioEmpresaDto } from '../dto/empresas/register-formulario-empresa.dto';
import { RegisterFormularioOrganizacionDto } from '../dto/organizaciones/register-formulario-organizacion.dto';
import { Response } from 'express';
import { CreatedRes, SwaggerBadRequestCommon, SwaggerNotFoundCommon } from 'src/shared/utils';
import { CommonResponseDto } from 'src/shared/dto/common-response.dto';

@ApiTags('Formularios')
@Controller('formularios')
export class FormulariosController {
	constructor(private readonly formulariosService: FormulariosService) { }

	@Post('empresas')
	@ApiOperation({
		summary: 'Api para registrar formulario de empresas'
	})
	@ApiCreatedResponse({
		type: CommonResponseDto,
		description: 'Respuesta en caso de llenar el formulario exitosamente'
	})
	@ApiNotFoundResponse(SwaggerNotFoundCommon())
	@ApiBadRequestResponse(SwaggerBadRequestCommon())
	async registerEmpresa(
		@Body() data: RegisterFormularioEmpresaDto,
		@Res() res: Response
	) {
		const formmulario = await this.formulariosService.registerEmpresa(data);
		return CreatedRes(res,{
			message: 'Se lleno el formulario exitosamente'
		})
	}

	@Post('organizaciones')
	@ApiOperation({
		summary: 'Api para registrar formulario de organizaciones'
	})
	@ApiCreatedResponse({
		type: CommonResponseDto,
		description: 'Respuesta en caso de llenar el formulario exitosamente'
	})
	@ApiNotFoundResponse(SwaggerNotFoundCommon())
	@ApiBadRequestResponse(SwaggerBadRequestCommon())
	async registerOrganizacion(
		@Body() data: RegisterFormularioOrganizacionDto,
		@Res() res: Response
	) {
		const formulario = await this.formulariosService.registerOrganizacion(data);
		return CreatedRes(res,{
			message: 'Se lleno el formulario exitosamente'
		})
	}
}
