import { Module } from '@nestjs/common';
import { FormulariosService } from './services/formularios.service';
import { FormulariosController } from './controllers/formularios.controller';
import { EmpresasModule } from 'src/modules/gestion-empresarial/empresas/empresas.module';
import { ProyectosEmpresasModule } from 'src/modules/gestion-proyectos/proyectos-empresas/proyectos-empresas.module';
import { OrganizacionesModule } from 'src/modules/gestion-organizacional/organizaciones/organizaciones.module';
import { ProyectosOrganizacionesModule } from 'src/modules/gestion-proyectos/proyectos-organizaciones/proyectos-organizaciones.module';
import { ProyectosModule } from 'src/modules/gestion-proyectos/proyectos/proyectos.module';

@Module({
	imports: [
		EmpresasModule,
		ProyectosEmpresasModule,
		OrganizacionesModule,
		ProyectosOrganizacionesModule,
		ProyectosModule,
	],
	controllers: [FormulariosController],
	providers: [FormulariosService],
})
export class FormulariosModule { }
