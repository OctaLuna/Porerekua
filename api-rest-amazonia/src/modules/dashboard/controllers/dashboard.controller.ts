import { Controller, Get, Param, ParseIntPipe, Query, Res, UseGuards } from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiQuery,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Response } from 'express';
import { DashboardService } from '../services/dashboard.service';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { OkRes, SwaggerNotFoundCommon, SwaggerUnauthorizedCommon } from 'src/shared/utils';
import { FilterProyectosDashboardDto } from '../dto/filter-proyectos-dashboard.dto';
import { FilterEmpresasDashboardDto } from '../dto/filter-empresas-dashboard.dto';

@ApiTags('Dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) {}

    // -------------------------------------------------------
    // KPIs globales
    // -------------------------------------------------------

    @Get('resumen')
    @ApiOperation({
        summary: 'KPIs globales del sistema',
        description:
            'Devuelve una única fila con todos los indicadores clave del sistema: ' +
            'totales de empresas, organizaciones y proyectos; desglose por área (conservación vs desarrollo); ' +
            'alcance geográfico (municipios y comunidades indígenas cubiertos); ' +
            'cobertura de ODS; y rango temporal de los datos. ' +
            'Úsalo para el encabezado del dashboard.\n\n' +
            '_Caché: 60 segundos._',
    })
    @ApiOkResponse({
        description: 'Objeto único con todos los KPIs del sistema.',
        schema: {
            properties: {
                id:                                 { type: 'integer', example: 1 },
                total_empresas:                     { type: 'integer', example: 4,  description: 'Total de empresas registradas en el sistema' },
                total_organizaciones:               { type: 'integer', example: 7,  description: 'Total de organizaciones (ONG, fundaciones, cooperación internacional)' },
                total_proyectos:                    { type: 'integer', example: 10, description: 'Total de proyectos amazónicos registrados' },
                proyectos_conservacion:             { type: 'integer', example: 8,  description: 'Proyectos del área 1 — Conservación ambiental (biodiversidad, ecosistemas)' },
                proyectos_desarrollo:               { type: 'integer', example: 2,  description: 'Proyectos del área 2 — Desarrollo de comunidades indígenas (social, cultural, económico)' },
                proyectos_activos:                  { type: 'integer', example: 10, description: 'Proyectos sin año de fin registrado (en curso)' },
                proyectos_finalizados:              { type: 'integer', example: 0,  description: 'Proyectos con año de fin registrado (concluidos)' },
                empresas_con_proyectos:             { type: 'integer', example: 4,  description: 'Empresas que participan en al menos un proyecto' },
                organizaciones_con_proyectos:       { type: 'integer', example: 7,  description: 'Organizaciones que participan en al menos un proyecto' },
                departamentos_amazonicos:           { type: 'integer', example: 5,  description: 'Departamentos bolivianos clasificados como amazónicos (Pando, Beni, La Paz, Cochabamba, Santa Cruz)' },
                municipios_cubiertos:               { type: 'integer', example: 9,  description: 'Municipios únicos donde se ejecutan proyectos' },
                comunidades_indigenas_beneficiadas: { type: 'integer', example: 5,  description: 'Comunidades indígenas directamente vinculadas a proyectos como localidades' },
                organizaciones_nacionales:          { type: 'integer', example: 5,  description: 'Organizaciones de origen nacional boliviano' },
                organizaciones_internacionales:     { type: 'integer', example: 2,  description: 'Organizaciones de cooperación internacional' },
                total_ods_cubiertos:                { type: 'integer', example: 8,  description: 'Cantidad de ODS (Objetivos de Desarrollo Sostenible) distintos alineados por las empresas registradas' },
                anio_inicio_mas_antiguo:            { type: 'integer', example: 2000, description: 'Año más antiguo entre todos los registros de empresas, organizaciones y proyectos' },
                anio_inicio_mas_reciente:           { type: 'integer', example: 2025, description: 'Año más reciente entre todos los registros' },
                ultima_actualizacion:               { type: 'string',  format: 'date-time', example: '2026-06-12T14:39:32.555Z', description: 'Timestamp del último refresco automático de las vistas materializadas' },
            },
        },
    })
    @ApiUnauthorizedResponse(SwaggerUnauthorizedCommon())
    async getResumen(@Res() res: Response) {
        const data = await this.dashboardService.getResumenGlobal();
        return OkRes(res, data);
    }

    @Get('por-region')
    @ApiOperation({
        summary: 'Métricas por departamento',
        description:
            'Devuelve un array con los 9 departamentos bolivianos, cada uno con sus métricas agregadas: ' +
            'cuántas empresas operan allí, cuántas organizaciones, cuántos proyectos y el desglose ' +
            'por área (conservación vs desarrollo). El campo `amazonico` indica si el departamento ' +
            'forma parte de la Amazonía boliviana.\n\n' +
            '_Caché: 60 segundos._',
    })
    @ApiOkResponse({
        description: 'Array de 9 departamentos con métricas agregadas.',
        schema: {
            example: [
                {
                    id_departamento:       1,
                    departamento:          'Beni',
                    amazonico:             true,
                    total_empresas:        2,
                    total_organizaciones:  3,
                    total_proyectos:       4,
                    proyectos_conservacion: 3,
                    proyectos_desarrollo:  1,
                },
                {
                    id_departamento:       6,
                    departamento:          'Oruro',
                    amazonico:             false,
                    total_empresas:        0,
                    total_organizaciones:  0,
                    total_proyectos:       0,
                    proyectos_conservacion: 0,
                    proyectos_desarrollo:  0,
                },
            ],
        },
    })
    @ApiUnauthorizedResponse(SwaggerUnauthorizedCommon())
    async getPorRegion(@Res() res: Response) {
        const data = await this.dashboardService.getPorRegion();
        return OkRes(res, data);
    }

    @Get('timeline')
    @ApiOperation({
        summary: 'Evolución anual de registros',
        description:
            'Devuelve una serie temporal desde el año de registro más antiguo hasta el año actual. ' +
            'Cada elemento indica cuántos nuevos registros (empresas, organizaciones, proyectos) ' +
            'se crearon ese año. Útil para gráficos de tendencia.\n\n' +
            '_Caché: 300 segundos._',
    })
    @ApiOkResponse({
        description: 'Array de años ordenado ascendente con conteos de nuevos registros.',
        schema: {
            example: [
                { anio: 2000, nuevas_empresas: 1, nuevas_organizaciones: 0, nuevos_proyectos: 0 },
                { anio: 2015, nuevas_empresas: 0, nuevas_organizaciones: 2, nuevos_proyectos: 3 },
                { anio: 2024, nuevas_empresas: 2, nuevas_organizaciones: 1, nuevos_proyectos: 5 },
            ],
        },
    })
    @ApiUnauthorizedResponse(SwaggerUnauthorizedCommon())
    async getTimeline(@Res() res: Response) {
        const data = await this.dashboardService.getTimeline();
        return OkRes(res, data);
    }

    @Get('salud')
    @ApiOperation({
        summary: 'Estado operacional del sistema',
        description:
            'Endpoint de health-check del dashboard. Devuelve el estado general, la fecha del ' +
            'último refresco de las vistas materializadas y los totales básicos. ' +
            'Úsalo para monitorear que las vistas están activas.\n\n' +
            '_Caché: 30 segundos._',
    })
    @ApiOkResponse({
        description: 'Estado del sistema con última actualización y totales básicos.',
        schema: {
            example: {
                status:               'ok',
                ultima_actualizacion: '2026-06-12T14:39:32.555Z',
                totales: {
                    empresas:       4,
                    organizaciones: 7,
                    proyectos:      10,
                },
            },
        },
    })
    @ApiUnauthorizedResponse(SwaggerUnauthorizedCommon())
    async getSalud(@Res() res: Response) {
        const data = await this.dashboardService.getSalud();
        return OkRes(res, data);
    }

    // -------------------------------------------------------
    // Proyectos
    // -------------------------------------------------------

    @Get('proyectos')
    @ApiOperation({
        summary: 'Listado filtrable de proyectos amazónicos',
        description:
            'Devuelve un listado paginado de proyectos con todos sus datos denormalizados. ' +
            'Cada proyecto incluye su ubicación geográfica (departamentos, municipios, comunidades indígenas), ' +
            'tipos de ayuda social, actores locales involucrados y los datos específicos del área:\n\n' +
            '- **Conservación** (area=1): `especies_animales` y `practicas_agricolas` están poblados. ' +
            '`areas_desarrollo` es `null`.\n' +
            '- **Desarrollo de comunidades indígenas** (area=2): `areas_desarrollo` está poblado. ' +
            '`especies_animales` y `practicas_agricolas` son `null`.\n\n' +
            'Todos los filtros son opcionales y se combinan con AND. Ejemplo con filtros múltiples:\n' +
            '`GET /dashboard/proyectos?area=1&departamento=2&anio_desde=2020&activo=true&sort=nombre:asc`\n\n' +
            '_Caché: 60 segundos (la clave de caché incluye todos los filtros aplicados)._',
    })
    @ApiOkResponse({
        description: 'Respuesta paginada con proyectos, metadatos de paginación y filtros aplicados.',
        schema: {
            example: {
                data: [
                    {
                        id_proyecto:                        1,
                        nombre:                             'Conservación de jaguar en el Beni',
                        descripcion:                        'Proyecto de monitoreo y conservación de jaguar (Panthera onca) en la llanura beniana.',
                        anio_inicio:                        2021,
                        anio_fin:                           null,
                        activo:                             true,
                        id_area:                            1,
                        area:                               'Conservacion',
                        id_tipo:                            6,
                        tipo_proyecto:                      'Conservación de especies',
                        total_empresas_participantes:       2,
                        total_organizaciones_participantes: 1,
                        departamentos:                      [{ id: 2, nombre: 'Beni', amazonico: true }],
                        municipios:                         [{ id: 49, nombre: 'Trinidad' }],
                        comunidades_indigenas:              [{ id: 22, nombre: 'Moxeño' }],
                        tipos_ayuda:                        [{ id: 2, nombre: 'Financiero' }],
                        actores_locales:                    [{ id: 1, nombre: 'Gobiernos municipales' }],
                        especies_animales:                  [{ id: 1, nombre: 'Jaguar' }],
                        practicas_agricolas:                [{ id: 2, nombre: 'Castaña' }],
                        areas_desarrollo:                   null,
                    },
                ],
                page:              1,
                limit:             10,
                total:             10,
                pages:             1,
                filtros_aplicados: { area: 1, departamento: 2, activo: true, page: 1, limit: 10 },
            },
        },
    })
    @ApiUnauthorizedResponse(SwaggerUnauthorizedCommon())
    async getProyectos(@Query() params: FilterProyectosDashboardDto, @Res() res: Response) {
        const data = await this.dashboardService.getProyectos(params);
        return OkRes(res, data);
    }

    @Get('proyectos/:id')
    @ApiOperation({
        summary: 'Detalle completo de un proyecto amazónico',
        description:
            'Devuelve todos los datos de un proyecto por su ID. La estructura del objeto varía según el área:\n\n' +
            '- **Conservación** (id_area=1): `especies_animales` y `practicas_agricolas` contienen arrays ' +
            'con los elementos vinculados. `areas_desarrollo` es siempre `null`.\n' +
            '- **Desarrollo** (id_area=2): `areas_desarrollo` contiene el array de áreas de ' +
            'desarrollo comunitario. `especies_animales` y `practicas_agricolas` son siempre `null`.\n\n' +
            'Para construir la vista de detalle del frontend, verificar `id_area` antes de renderizar ' +
            'las secciones específicas de cada área.\n\n' +
            '_Caché: 120 segundos._',
    })
    @ApiOkResponse({
        description: 'Objeto proyecto completo. El campo id_area determina qué sección de datos específicos está poblada.',
        schema: {
            example: {
                id_proyecto:                        1,
                nombre:                             'Conservación de jaguar en el Beni',
                descripcion:                        'Proyecto de monitoreo y conservación de jaguar (Panthera onca) en la llanura beniana.',
                anio_inicio:                        2021,
                anio_fin:                           null,
                activo:                             true,
                id_area:                            1,
                area:                               'Conservacion',
                id_tipo:                            6,
                tipo_proyecto:                      'Conservación de especies',
                total_empresas_participantes:       2,
                total_organizaciones_participantes: 1,
                departamentos:                      [{ id: 2, nombre: 'Beni', amazonico: true }],
                municipios:                         [{ id: 49, nombre: 'Trinidad' }],
                comunidades_indigenas:              [{ id: 22, nombre: 'Moxeño' }],
                tipos_ayuda:                        [{ id: 2, nombre: 'Financiero' }],
                actores_locales:                    [{ id: 1, nombre: 'Gobiernos municipales' }],
                especies_animales:                  [{ id: 1, nombre: 'Jaguar' }, { id: 2, nombre: 'Bufeo' }],
                practicas_agricolas:                [{ id: 2, nombre: 'Castaña' }],
                areas_desarrollo:                   null,
            },
        },
    })
    @ApiNotFoundResponse(SwaggerNotFoundCommon())
    @ApiUnauthorizedResponse(SwaggerUnauthorizedCommon())
    async getProyectoById(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
        const data = await this.dashboardService.getProyectoById(id);
        return OkRes(res, data);
    }

    // -------------------------------------------------------
    // Empresas
    // -------------------------------------------------------

    @Get('empresas')
    @ApiOperation({
        summary: 'Listado filtrable de empresas',
        description:
            'Devuelve un listado paginado de empresas con todos sus datos relacionados denormalizados: ' +
            'forma jurídica, departamentos donde operan, motivos de apoyo, tipos de apoyo, ' +
            'ODS alineados, organizaciones vinculadas y conteo de proyectos en los que participan.\n\n' +
            'Todos los filtros son opcionales y se combinan con AND. Ejemplo:\n' +
            '`GET /dashboard/empresas?departamento=2&ods=13&sort=nombre:asc`\n\n' +
            'Para obtener los valores válidos de los filtros de ID, usar primero ' +
            '`GET /dashboard/filtros-disponibles`.\n\n' +
            '_Caché: 60 segundos (la clave incluye todos los filtros aplicados)._',
    })
    @ApiOkResponse({
        description: 'Respuesta paginada con empresas, metadatos de paginación y filtros aplicados.',
        schema: {
            example: {
                data: [
                    {
                        id_empresa:                      1,
                        nombre:                          'Empresa Amazónica S.R.L.',
                        anio_inicio_apoyo:               2018,
                        forma_juridica:                  { id: 1, nombre: 'S.R.L' },
                        departamentos:                   [{ id: 2, nombre: 'Beni', amazonico: true }],
                        motivos_apoyo:                   [{ id: 1, nombre: 'Responsabilidad Social' }],
                        tipos_apoyo:                     [{ id: 2, nombre: 'Financiero' }],
                        ods_alineados:                   [{ id: 13, nombre: 'Accion por el clima' }, { id: 15, nombre: 'Vida de ecosistemas terrestres' }],
                        organizaciones_vinculadas:       [{ id: 1, nombre: 'ONG Amazónica', es_nacional: true }],
                        total_proyectos_participantes:   3,
                        proyectos_activos_participantes: 3,
                    },
                ],
                page:              1,
                limit:             10,
                total:             4,
                pages:             1,
                filtros_aplicados: { departamento: 2, ods: 13, page: 1, limit: 10 },
            },
        },
    })
    @ApiUnauthorizedResponse(SwaggerUnauthorizedCommon())
    async getEmpresas(@Query() params: FilterEmpresasDashboardDto, @Res() res: Response) {
        const data = await this.dashboardService.getEmpresas(params);
        return OkRes(res, data);
    }

    @Get('empresas/:id')
    @ApiOperation({
        summary: 'Detalle completo de una empresa',
        description:
            'Devuelve todos los datos de una empresa por su ID: forma jurídica, ' +
            'departamentos donde opera, motivos de apoyo, tipos de apoyo, ODS alineados, ' +
            'organizaciones con las que está vinculada y conteo de proyectos en los que participa.\n\n' +
            '_Caché: 120 segundos._',
    })
    @ApiOkResponse({
        description: 'Objeto empresa completo con todos sus datos relacionados como arrays JSON.',
        schema: {
            example: {
                id_empresa:                      1,
                nombre:                          'Empresa Amazónica S.R.L.',
                anio_inicio_apoyo:               2018,
                forma_juridica:                  { id: 1, nombre: 'S.R.L' },
                departamentos:                   [{ id: 2, nombre: 'Beni', amazonico: true }, { id: 1, nombre: 'Pando', amazonico: true }],
                motivos_apoyo:                   [{ id: 1, nombre: 'Responsabilidad Social' }, { id: 3, nombre: 'Imagen institucional' }],
                tipos_apoyo:                     [{ id: 2, nombre: 'Financiero' }, { id: 3, nombre: 'Logistico' }],
                ods_alineados:                   [{ id: 13, nombre: 'Accion por el clima' }, { id: 15, nombre: 'Vida de ecosistemas terrestres' }],
                organizaciones_vinculadas:       [{ id: 1, nombre: 'Fundación Amazónica', es_nacional: true }],
                total_proyectos_participantes:   3,
                proyectos_activos_participantes: 3,
            },
        },
    })
    @ApiNotFoundResponse(SwaggerNotFoundCommon())
    @ApiUnauthorizedResponse(SwaggerUnauthorizedCommon())
    async getEmpresaById(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
        const data = await this.dashboardService.getEmpresaById(id);
        return OkRes(res, data);
    }

    // -------------------------------------------------------
    // Análisis por tipo de proyecto
    // -------------------------------------------------------

    @Get('por-tipo')
    @ApiOperation({
        summary: 'Métricas por tipo y área de proyecto',
        description:
            'Devuelve una fila por cada combinación (área, tipo de proyecto) que tenga datos reales. ' +
            'Incluye totales de proyectos activos, finalizados, empresas y organizaciones participantes ' +
            'y departamentos cubiertos. Útil para gráficos de distribución por categoría.\n\n' +
            'Filtros opcionales: `area` (1=Conservación, 2=Desarrollo) y `departamento`.\n\n' +
            '_Caché: 60 segundos._',
    })
    @ApiQuery({ name: 'area', required: false, type: Number, enum: [1, 2], description: '1 = Conservación  |  2 = Desarrollo de comunidades indígenas' })
    @ApiQuery({ name: 'departamento', required: false, type: Number, example: 2, description: 'id_departamento (obtener valores en /dashboard/filtros-disponibles)' })
    @ApiOkResponse({
        description: 'Array de combinaciones (área, tipo) con sus métricas.',
        schema: {
            example: [
                {
                    id_area:                    1,
                    area:                       'Conservacion',
                    id_tipo:                    6,
                    tipo_proyecto:              'Conservación de especies',
                    total_proyectos:            3,
                    proyectos_activos:          3,
                    proyectos_finalizados:      0,
                    empresas_participantes:     2,
                    organizaciones_participantes: 1,
                    departamentos_cubiertos:    2,
                },
                {
                    id_area:                    2,
                    area:                       'Desarrollo de comunidades indigenas',
                    id_tipo:                    4,
                    tipo_proyecto:              'Educación',
                    total_proyectos:            2,
                    proyectos_activos:          2,
                    proyectos_finalizados:      0,
                    empresas_participantes:     1,
                    organizaciones_participantes: 2,
                    departamentos_cubiertos:    1,
                },
            ],
        },
    })
    @ApiUnauthorizedResponse(SwaggerUnauthorizedCommon())
    async getPorTipo(
        @Query('area') area: string | undefined,
        @Query('departamento') departamento: string | undefined,
        @Res() res: Response,
    ) {
        const areaNum   = area        ? parseInt(area, 10)        : undefined;
        const departNum = departamento ? parseInt(departamento, 10) : undefined;
        const data = await this.dashboardService.getPorTipo(areaNum, departNum);
        return OkRes(res, data);
    }

    // -------------------------------------------------------
    // Filtros disponibles para el frontend
    // -------------------------------------------------------

    @Get('filtros-disponibles')
    @ApiOperation({
        summary: 'Valores válidos para todos los filtros del dashboard',
        description:
            'Devuelve todos los catálogos necesarios para construir los selectores dinámicos del dashboard. ' +
            'Debe ser el **primer endpoint que llame el frontend** antes de construir cualquier filtro.\n\n' +
            '**Correspondencia de campos con parámetros de filtro:**\n' +
            '- `departamentos` → parámetro `departamento` en `/proyectos` y `/empresas`\n' +
            '- `tipos_proyecto` → parámetro `tipo` en `/proyectos`\n' +
            '- `areas_proyecto` → parámetro `area` en `/proyectos` y `/por-tipo`\n' +
            '- `tipos_ayuda` → parámetro `ayuda` en `/proyectos`\n' +
            '- `actores_municipales` → parámetro `actor` en `/proyectos`\n' +
            '- `comunidades_indigenas` → parámetro `comunidad` en `/proyectos`\n' +
            '- `formas_juridicas` → parámetro `forma_juridica` en `/empresas`\n' +
            '- `motivos_apoyo` → parámetro `motivo` en `/empresas`\n' +
            '- `tipos_apoyo` → parámetro `apoyo` en `/empresas`\n' +
            '- `ods` → parámetro `ods` en `/empresas`\n' +
            '- `rango_anios` → parámetros `anio_desde` y `anio_hasta` en `/proyectos`\n\n' +
            '_Caché: 300 segundos._',
    })
    @ApiOkResponse({
        description: 'Objeto con todas las dimensiones de filtro y el rango de años disponibles.',
        schema: {
            example: {
                departamentos:        [{ id: 1, nombre: 'Pando', amazonico: true }, { id: 2, nombre: 'Beni', amazonico: true }],
                tipos_proyecto:       [{ id: 1, nombre: 'Áreas protegidas' }, { id: 6, nombre: 'Conservación de especies' }],
                areas_proyecto:       [{ id: 1, nombre: 'Conservacion' }, { id: 2, nombre: 'Desarrollo de comunidades indigenas' }],
                tipos_ayuda:          [{ id: 2, nombre: 'Financiero' }, { id: 3, nombre: 'Capacitaciones' }],
                actores_municipales:  [{ id: 1, nombre: 'Gobiernos municipales' }, { id: 5, nombre: 'Actores privados' }],
                comunidades_indigenas: [{ id: 22, nombre: 'Moxeño' }, { id: 27, nombre: 'Tsimane' }],
                formas_juridicas:     [{ id: 1, nombre: 'S.R.L' }, { id: 2, nombre: 'S.A' }],
                motivos_apoyo:        [{ id: 1, nombre: 'Responsabilidad Social' }, { id: 2, nombre: 'Interés económico-productivo' }],
                tipos_apoyo:          [{ id: 2, nombre: 'Financiero' }, { id: 4, nombre: 'Talento Humano' }],
                ods:                  [{ id: 13, nombre: 'Accion por el clima' }, { id: 15, nombre: 'Vida de ecosistemas terrestres' }],
                tipos_organizacion:   [{ id: 3, nombre: 'ONG/Fundación nacional' }, { id: 4, nombre: 'ONG/Fundación internacional' }],
                rango_anios:          { desde: 2000, hasta: 2026 },
            },
        },
    })
    @ApiUnauthorizedResponse(SwaggerUnauthorizedCommon())
    async getFiltrosDisponibles(@Res() res: Response) {
        const data = await this.dashboardService.getFiltrosDisponibles();
        return OkRes(res, data);
    }
}
