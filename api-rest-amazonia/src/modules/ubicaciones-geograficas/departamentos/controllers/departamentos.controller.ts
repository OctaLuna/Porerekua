import { Controller, Get, Query, Res } from '@nestjs/common';
import { DepartamentosService } from '../services/departamentos.service';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { OkRes } from 'src/shared/utils';
import { FilterDepartamentosDto } from '../dto/filter-departamentos.dto';
import { PaginationResponseDto } from 'src/shared/dto/pagination-response.dto';

@ApiTags('Departamentos')
@Controller('departamentos')
export class DepartamentosController {
    constructor(private readonly departamentosService: DepartamentosService) {}

    @Get()
    @ApiOperation({ summary: 'Listar departamentos. Filtrar amazónicos con ?amazonico=true' })
    @ApiOkResponse({ type: PaginationResponseDto, description: 'Listado paginado de departamentos' })
    async findAll(@Query() params: FilterDepartamentosDto, @Res() res: Response) {
        const result = await this.departamentosService.findAllFiltered(params);
        return OkRes(res, result);
    }
}
