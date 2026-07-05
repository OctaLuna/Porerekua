import { Module } from '@nestjs/common';
import { ActoresMunicipalesService } from './services/actores-municipales.service';
import { ActoresMunicipalesController } from './controllers/actores-municipales.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActorMunicipal } from './entities/actor-municipal.entity';

@Module({
	imports: [
		TypeOrmModule.forFeature([ActorMunicipal])
	],
	controllers: [ActoresMunicipalesController],
	providers: [ActoresMunicipalesService],
	exports: [ActoresMunicipalesService]
})
export class ActoresMunicipalesModule { }
