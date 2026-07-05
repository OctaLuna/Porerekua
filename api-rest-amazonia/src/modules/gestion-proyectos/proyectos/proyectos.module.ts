import { Module } from '@nestjs/common';
import { ProyectosService } from './services/proyectos.service';
import { ProyectosController } from './controllers/proyectos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Proyecto } from './entities/proyecto.entity';
import { ProyectoImagen } from './entities/proyecto-imagen.entity';
import { TiposProyectosModule } from 'src/modules/catalogos/tipos-proyectos/tipos-proyectos.module';
import { LocalidadesProyectosModule } from '../localidades-proyectos/localidades-proyectos.module';
import { AyudasProyectosModule } from '../ayudas-proyectos/ayudas-proyectos.module';
import { ActoresProyectosModule } from '../actores-proyectos/actores-proyectos.module';
import { ConservacionAnimalesModule } from 'src/modules/gestion-conservacion/conservacion-animales/conservacion-animales.module';
import { ConservacionAgricolasModule } from 'src/modules/gestion-conservacion/conservacion-agricolas/conservacion-agricolas.module';
import { ComunidadesIndigenasAreasModule } from 'src/modules/gestion-comunidades/comunidades-indigenas-areas/comunidades-indigenas-areas.module';
import { AuthModule } from 'src/modules/auth/auth.module';
import { UploadModule } from 'src/shared/upload/upload.module';
import { GeorefModule } from 'src/modules/georef/georef.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([Proyecto, ProyectoImagen]),
		TiposProyectosModule,
		LocalidadesProyectosModule,
		AyudasProyectosModule,
		ActoresProyectosModule,
		ConservacionAnimalesModule,
		ConservacionAgricolasModule,
		ComunidadesIndigenasAreasModule,
		AuthModule,
		UploadModule,
		GeorefModule,
	],
	controllers: [ProyectosController],
	providers: [ProyectosService],
	exports: [ProyectosService]
})
export class ProyectosModule { }
