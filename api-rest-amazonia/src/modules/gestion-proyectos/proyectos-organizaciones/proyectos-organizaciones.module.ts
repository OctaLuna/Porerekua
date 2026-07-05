import { Module } from '@nestjs/common';
import { ProyectosOrganizacionesService } from './services/proyectos-organizaciones.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProyectoOrganizacion } from './entities/proyecto-organizacion.entity';
import { ProyectosModule } from '../proyectos/proyectos.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([ProyectoOrganizacion]),
		ProyectosModule
	],
	providers: [ProyectosOrganizacionesService],
	exports: [ProyectosOrganizacionesService]
})
export class ProyectosOrganizacionesModule { }
