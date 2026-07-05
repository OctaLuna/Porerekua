import { Module } from '@nestjs/common';
import { FormasJuridicasService } from './services/formas-juridicas.service';
import { FormasJuridicasController } from './controllers/formas-juridicas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FormaJuridica } from './entities/forma-juridica.entity';

@Module({
	imports: [
		TypeOrmModule.forFeature([FormaJuridica])
	],
	controllers: [FormasJuridicasController],
	providers: [FormasJuridicasService],
	exports: [FormasJuridicasService]
})
export class FormasJuridicasModule { }
