import { Module } from '@nestjs/common';
import { TiposProyectosService } from './services/tipos-proyectos.service';
import { TiposProyectosController } from './controllers/tipos-proyectos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TipoProyecto } from './entities/tipo-proyecto.entity';

@Module({
	imports: [
		TypeOrmModule.forFeature([TipoProyecto])
	],
	controllers: [TiposProyectosController],
	providers: [TiposProyectosService],
	exports: [TiposProyectosService],
})
export class TiposProyectosModule { }
