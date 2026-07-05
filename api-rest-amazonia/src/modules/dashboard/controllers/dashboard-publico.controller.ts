import { Controller, Get, Res } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { DashboardService } from '../services/dashboard.service';
import { OkRes } from 'src/shared/utils';

@Controller('dashboard/publico')
export class DashboardPublicoController {
    constructor(private readonly dashboardService: DashboardService) {}

    @ApiTags('Dashboard — Público')
    @Get('resumen')
    @ApiOperation({
        summary: 'Resumen de KPIs globales de la plataforma (sin autenticación)',
        description:
            'Devuelve un subconjunto de métricas agregadas sin datos sensibles ni desagregación individual. ' +
            'Datos: total de proyectos, empresas, organizaciones, proyectos activos y departamentos con actividad. ' +
            'Caché de 120 s.',
    })
    @ApiOkResponse({
        description: 'Métricas globales públicas',
        schema: {
            example: {
                total_proyectos: 48,
                total_empresas: 22,
                total_organizaciones: 15,
                proyectos_activos: 30,
                departamentos_con_actividad: 7,
            },
        },
    })
    async resumen(@Res() res: Response) {
        const raw = await this.dashboardService.getResumenGlobal();
        const publico = {
            total_proyectos:           raw?.total_proyectos           ?? 0,
            total_empresas:            raw?.total_empresas            ?? 0,
            total_organizaciones:      raw?.total_organizaciones      ?? 0,
            proyectos_activos:         raw?.proyectos_activos         ?? 0,
            departamentos_con_actividad: raw?.departamentos_con_actividad ?? 0,
        };
        return OkRes(res, publico);
    }

    @ApiTags('Dashboard — Público')
    @Get('por-region')
    @ApiOperation({
        summary: 'Métricas por departamento (sin autenticación)',
        description:
            'Devuelve un listado de los 9 departamentos bolivianos con conteos agregados de proyectos y empresas. ' +
            'Sin desagregación individual ni datos sensibles. Caché de 120 s.',
    })
    @ApiOkResponse({
        description: 'Array de métricas por departamento',
        schema: {
            example: [
                { departamento: 'Beni', total_proyectos: 12, total_empresas: 5, amazonico: true },
                { departamento: 'Santa Cruz', total_proyectos: 8, total_empresas: 3, amazonico: true },
            ],
        },
    })
    async porRegion(@Res() res: Response) {
        const raw: any[] = await this.dashboardService.getPorRegion();
        const publico = raw.map((r) => ({
            departamento:    r.departamento,
            total_proyectos: r.total_proyectos  ?? 0,
            total_empresas:  r.total_empresas   ?? 0,
            amazonico:       r.amazonico        ?? false,
        }));
        return OkRes(res, publico);
    }
}
