import { Controller, Get, Param, ParseIntPipe, Query, Res } from '@nestjs/common';
import { MunicipiosService } from '../services/municipios.service';
import { ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { OkRes } from 'src/shared/utils';
import { FilterMunicipiosDto } from '../dto/filter-municipios.dto';
import { PaginationResponseDto } from 'src/shared/dto/pagination-response.dto';

@ApiTags('Municipios')
@Controller('municipios')
export class MunicipiosController {
    constructor(private readonly municipiosService: MunicipiosService) {}

    @Get()
    @ApiOperation({ summary: 'Listar municipios con paginación y filtros opcionales' })
    @ApiOkResponse({ type: PaginationResponseDto, description: 'Listado paginado de municipios' })
    async findAll(@Query() params: FilterMunicipiosDto, @Res() res: Response) {
        const result = await this.municipiosService.findAllFiltered(params);
        return OkRes(res, result);
    }

    @Get(':id/comunidades')
    @ApiOperation({ summary: 'Comunidades indígenas de un municipio (carga en cascada para formularios)' })
    @ApiParam({ name: 'id', type: 'integer', description: 'ID del municipio' })
    @ApiOkResponse({ description: 'Lista de comunidades indígenas del municipio, ordenadas por nombre' })
    async findComunidades(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
        const result = await this.municipiosService.findComunidadesByMunicipio(id);
        return OkRes(res, result);
    }
}
