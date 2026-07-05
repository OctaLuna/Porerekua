import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { MyConfigModule } from './infrastructure/config/config.module';
import { MyDatabaseModule } from './infrastructure/database/database.module';
import { TiposOrganizacionesModule } from './modules/catalogos/tipos-organizaciones/tipos-organizaciones.module';
import { AreasDesarrolloModule } from './modules/catalogos/areas-desarrollo/areas-desarrollo.module';
import { PracticasAgricolasModule } from './modules/catalogos/practicas-agricolas/practicas-agricolas.module';
import { EspeciesAnimalesModule } from './modules/catalogos/especies-animales/especies-animales.module';
import { AyudasModule } from './modules/catalogos/ayudas/ayudas.module';
import { ActoresMunicipalesModule } from './modules/catalogos/actores-municipales/actores-municipales.module';
import { TiposProyectosModule } from './modules/catalogos/tipos-proyectos/tipos-proyectos.module';
import { AreasModule } from './modules/catalogos/areas/areas.module';
import { MotivosModule } from './modules/catalogos/motivos/motivos.module';
import { ApoyosModule } from './modules/catalogos/apoyos/apoyos.module';
import { OdsModule } from './modules/catalogos/ods/ods.module';
import { FormasJuridicasModule } from './modules/catalogos/formas-juridicas/formas-juridicas.module';
import { DepartamentosModule } from './modules/ubicaciones-geograficas/departamentos/departamentos.module';
import { MunicipiosModule } from './modules/ubicaciones-geograficas/municipios/municipios.module';
import { ComunidadesIndigenasModule } from './modules/ubicaciones-geograficas/comunidades-indigenas/comunidades-indigenas.module';
import { OrganizacionesModule } from './modules/gestion-organizacional/organizaciones/organizaciones.module';
import { OrganizacionesEmpresasModule } from './modules/gestion-organizacional/organizaciones-empresas/organizaciones-empresas.module';
import { EmpresasModule } from './modules/gestion-empresarial/empresas/empresas.module';
import { MotivosEmpresasModule } from './modules/gestion-empresarial/motivos-empresas/motivos-empresas.module';
import { ApoyosEmpresasModule } from './modules/gestion-empresarial/apoyos-empresas/apoyos-empresas.module';
import { OdsEmpresasModule } from './modules/gestion-empresarial/ods-empresas/ods-empresas.module';
import { DepartamentosEmpresasModule } from './modules/gestion-empresarial/departamentos-empresas/departamentos-empresas.module';
import { ProyectosModule } from './modules/gestion-proyectos/proyectos/proyectos.module';
import { ProyectosEmpresasModule } from './modules/gestion-proyectos/proyectos-empresas/proyectos-empresas.module';
import { ProyectosOrganizacionesModule } from './modules/gestion-proyectos/proyectos-organizaciones/proyectos-organizaciones.module';
import { LocalidadesProyectosModule } from './modules/gestion-proyectos/localidades-proyectos/localidades-proyectos.module';
import { ActoresProyectosModule } from './modules/gestion-proyectos/actores-proyectos/actores-proyectos.module';
import { AyudasProyectosModule } from './modules/gestion-proyectos/ayudas-proyectos/ayudas-proyectos.module';
import { ConservacionAnimalesModule } from './modules/gestion-conservacion/conservacion-animales/conservacion-animales.module';
import { ConservacionAgricolasModule } from './modules/gestion-conservacion/conservacion-agricolas/conservacion-agricolas.module';
import { ComunidadesIndigenasAreasModule } from './modules/gestion-comunidades/comunidades-indigenas-areas/comunidades-indigenas-areas.module';
import { ComunidadesMunicipiosModule } from './modules/ubicaciones-geograficas/comunidades-municipios/comunidades-municipios.module';
import { FormulariosModule } from './app/formularios/formularios.module';
import { AuthModule } from './modules/auth/auth.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { GeorefModule } from './modules/georef/georef.module';
import { HealthModule } from './modules/health/health.module';
import { PublicacionesModule } from './modules/publicaciones/publicaciones.module';
import { LogsModule } from './modules/logs/logs.module';

@Module({
	imports: [
		MyConfigModule,
		MyDatabaseModule,
		// Serve /uploads directory for development (Nginx handles this in production)
		ServeStaticModule.forRoot({
			rootPath: join(process.cwd(), process.env.UPLOADS_PATH ?? 'uploads'),
			serveRoot: '/uploads',
			serveStaticOptions: { index: false, fallthrough: false },
		}),
		// Rate limiting global: 60 req / 60s por IP en todos los endpoints
		// Los endpoints de auth (/login, /register) aplican límite más estricto vía @Throttle()
		ThrottlerModule.forRoot([{ ttl: 60000, limit: 60 }]),
		AuthModule,
		TiposOrganizacionesModule,
		AreasDesarrolloModule,
		PracticasAgricolasModule,
		EspeciesAnimalesModule,
		AyudasModule,
		ActoresMunicipalesModule,
		TiposProyectosModule,
		AreasModule,
		MotivosModule,
		ApoyosModule,
		OdsModule,
		FormasJuridicasModule,
		DepartamentosModule,
		MunicipiosModule,
		ComunidadesIndigenasModule,
		OrganizacionesModule,
		OrganizacionesEmpresasModule,
		EmpresasModule,
		MotivosEmpresasModule,
		ApoyosEmpresasModule,
		OdsEmpresasModule,
		DepartamentosEmpresasModule,
		ProyectosModule,
		ProyectosEmpresasModule,
		ProyectosOrganizacionesModule,
		LocalidadesProyectosModule,
		ActoresProyectosModule,
		AyudasProyectosModule,
		ConservacionAnimalesModule,
		ConservacionAgricolasModule,
		ComunidadesIndigenasAreasModule,
		ComunidadesMunicipiosModule,
		FormulariosModule,
		DashboardModule,
		GeorefModule,
		HealthModule,
		PublicacionesModule,
		LogsModule,
	],
	providers: [
		// Aplica el rate limiting global a todos los endpoints
		{ provide: APP_GUARD, useClass: ThrottlerGuard },
	],
})
export class AppModule { }
