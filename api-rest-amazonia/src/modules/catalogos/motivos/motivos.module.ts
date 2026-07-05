import { Module } from '@nestjs/common';
import { MotivosService } from './services/motivos.service';
import { MotivosController } from './controllers/motivos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Motivo } from './entities/motivo.entity';

@Module({
	imports: [
		TypeOrmModule.forFeature([Motivo])
	],
	controllers: [MotivosController],
	providers: [MotivosService],
	exports: [MotivosService]
})
export class MotivosModule { }
