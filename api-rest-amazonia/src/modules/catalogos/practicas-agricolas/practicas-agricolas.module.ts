import { Module } from '@nestjs/common';
import { PracticasAgricolasService } from './services/practicas-agricolas.service';
import { PracticasAgricolasController } from './controllers/practicas-agricolas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PracticaAgricola } from './entities/practica-agricola.entity';

@Module({
	imports: [
		TypeOrmModule.forFeature([PracticaAgricola])
	],
	controllers: [PracticasAgricolasController],
	providers: [PracticasAgricolasService],
	exports: [PracticasAgricolasService]
})
export class PracticasAgricolasModule { }
