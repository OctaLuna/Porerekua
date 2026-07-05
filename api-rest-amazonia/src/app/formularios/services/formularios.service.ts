import { Injectable } from '@nestjs/common';
import { EmpresasService } from 'src/modules/gestion-empresarial/empresas/services/empresas.service';
import { DataSource } from 'typeorm';
import { RegisterFormularioEmpresaDto } from '../dto/empresas/register-formulario-empresa.dto';
import { ProyectosEmpresasService } from 'src/modules/gestion-proyectos/proyectos-empresas/services/proyectos-empresas.service';
import { RegisterFormularioOrganizacionDto } from '../dto/organizaciones/register-formulario-organizacion.dto';
import { OrganizacionesService } from 'src/modules/gestion-organizacional/organizaciones/services/organizaciones.service';
import { ProyectosOrganizacionesService } from 'src/modules/gestion-proyectos/proyectos-organizaciones/services/proyectos-organizaciones.service';
import { ProyectosService, ResolvedRegion } from 'src/modules/gestion-proyectos/proyectos/services/proyectos.service';

@Injectable()
export class FormulariosService {
    constructor(
        private readonly dataSource: DataSource,
        private readonly empresasService: EmpresasService,
        private readonly proyectosEmpresasService: ProyectosEmpresasService,
        private readonly organizacionesService: OrganizacionesService,
        private readonly proyectosOrganizacionesServices: ProyectosOrganizacionesService,
        private readonly proyectosService: ProyectosService,
    ){}

    /**
     * AUDIT-009: resuelve GeoRef para todos los proyectos ANTES de abrir la
     * transacción de BD, para no retener conexiones durante la latencia HTTP.
     */
    private resolveRegions(proyectos?: { lat?: number; lng?: number }[]): Promise<ResolvedRegion[]> | undefined {
        if (!proyectos) return undefined;
        return Promise.all(proyectos.map((p) => this.proyectosService.resolveRegionFor(p)));
    }

    async registerEmpresa(data: RegisterFormularioEmpresaDto){
        const regions = await this.resolveRegions(data.proyectos);
        return this.dataSource.transaction(async (manager) => {
            const empresa = await this.empresasService.create(data,manager);
            if (data.proyectos){
                await this.proyectosEmpresasService.createMany(empresa.id,data.proyectos,manager,regions);
            }
            if (data.proyectosExistentes){
                await this.proyectosEmpresasService.linkMany(empresa.id,data.proyectosExistentes,manager);
            }
            return empresa;
        })
    }

    async registerOrganizacion(data: RegisterFormularioOrganizacionDto){
        const regions = await this.resolveRegions(data.proyectos);
        return this.dataSource.transaction(async (manager) => {
            const organizacion = await this.organizacionesService.create(data,manager);
            if (data.proyectos){
                await this.proyectosOrganizacionesServices.createMany(organizacion.id,data.proyectos,manager,regions);
            }
            if (data.proyectosExistentes){
                await this.proyectosOrganizacionesServices.linkMany(organizacion.id,data.proyectosExistentes,manager);
            }
            return organizacion;
        })
    }
}
