import {
  BadRequestException,
  Controller,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Request, Response } from 'express';
import { FormulariosService } from '../services/formularios.service';
import { RegisterFormularioEmpresaDto } from '../dto/empresas/register-formulario-empresa.dto';
import { RegisterFormularioOrganizacionDto } from '../dto/organizaciones/register-formulario-organizacion.dto';
import {
  CreatedRes,
  SwaggerBadRequestCommon,
  SwaggerNotFoundCommon,
} from 'src/shared/utils';
import { CommonResponseDto } from 'src/shared/dto/common-response.dto';
import {
  FormularioMultipartService,
  MultipartFormulario,
} from '../services/formulario-multipart.service';
import { FormularioMultimediaService } from '../services/formulario-multimedia.service';

@ApiTags('Formularios')
@Controller('formularios')
export class FormulariosController {
  constructor(
    private readonly formulariosService: FormulariosService,
    private readonly multipartService: FormularioMultipartService,
    private readonly multimediaService: FormularioMultimediaService,
  ) {}

  @Post('empresas')
  @ApiConsumes('application/json', 'multipart/form-data')
  @ApiOperation({
    summary:
      'Registrar empresa y proyectos, con multimedia opcional de hasta 500 MiB en total',
    description:
      'Para multimedia, envíe `payload` con el JSON del formulario y una o más partes `multimedia`. El JSON sin archivos conserva compatibilidad.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['payload'],
      properties: {
        payload: {
          type: 'string',
          description: 'JSON serializado del formulario',
        },
        multimedia: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
      },
    },
  })
  @ApiCreatedResponse({
    type: CommonResponseDto,
    description: 'Respuesta en caso de llenar el formulario exitosamente',
  })
  @ApiNotFoundResponse(SwaggerNotFoundCommon())
  @ApiBadRequestResponse(SwaggerBadRequestCommon())
  async registerEmpresa(@Req() req: Request, @Res() res: Response) {
    const form = await this.readForm(req, RegisterFormularioEmpresaDto);
    try {
      await this.formulariosService.registerEmpresa(
        form.payload,
        form.multimedia.map((item) => item.id),
      );
    } catch (error) {
      await this.multimediaService.discardPending(
        form.multimedia.map((item) => item.id),
      );
      throw error;
    }
    return CreatedRes(res, { message: 'Se lleno el formulario exitosamente' });
  }

  @Post('organizaciones')
  @ApiConsumes('application/json', 'multipart/form-data')
  @ApiOperation({
    summary:
      'Registrar organización y proyectos, con multimedia opcional de hasta 500 MiB en total',
    description:
      'Para multimedia, envíe `payload` con el JSON del formulario y una o más partes `multimedia`. El JSON sin archivos conserva compatibilidad.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['payload'],
      properties: {
        payload: {
          type: 'string',
          description: 'JSON serializado del formulario',
        },
        multimedia: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
      },
    },
  })
  @ApiCreatedResponse({
    type: CommonResponseDto,
    description: 'Respuesta en caso de llenar el formulario exitosamente',
  })
  @ApiNotFoundResponse(SwaggerNotFoundCommon())
  @ApiBadRequestResponse(SwaggerBadRequestCommon())
  async registerOrganizacion(@Req() req: Request, @Res() res: Response) {
    const form = await this.readForm(req, RegisterFormularioOrganizacionDto);
    try {
      await this.formulariosService.registerOrganizacion(
        form.payload,
        form.multimedia.map((item) => item.id),
      );
    } catch (error) {
      await this.multimediaService.discardPending(
        form.multimedia.map((item) => item.id),
      );
      throw error;
    }
    return CreatedRes(res, { message: 'Se lleno el formulario exitosamente' });
  }

  private async readForm<T extends object>(
    req: Request,
    dto: new () => T,
  ): Promise<MultipartFormulario<T>> {
    const validatePayload = (payload: unknown) =>
      this.validatePayload(dto, payload);
    if (
      req.headers['content-type']?.toLowerCase().includes('multipart/form-data')
    ) {
      return this.multipartService.parse(req, validatePayload);
    }
    return { payload: await validatePayload(req.body), multimedia: [] };
  }

  private async validatePayload<T extends object>(
    dto: new () => T,
    payload: unknown,
  ): Promise<T> {
    const instance = plainToInstance(dto, payload, {
      enableImplicitConversion: true,
    });
    const errors = await validate(instance, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });
    if (errors.length) {
      throw new BadRequestException(errors);
    }
    return instance;
  }
}
