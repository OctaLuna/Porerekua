import { Module } from '@nestjs/common';
import { AyudasProyectosService } from './services/ayudas-proyectos.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AyudaProyecto } from './entities/ayuda-proyecto.entity';
import { AyudasModule } from 'src/modules/catalogos/ayudas/ayudas.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([AyudaProyecto]),
		AyudasModule,
	],
	providers: [AyudasProyectosService],
	exports: [AyudasProyectosService]
})
export class AyudasProyectosModule { }
