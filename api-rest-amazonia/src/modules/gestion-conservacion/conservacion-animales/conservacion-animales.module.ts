import { Module } from '@nestjs/common';
import { ConservacionAnimalesService } from './services/conservacion-animales.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConservacionAnimal } from './entities/conservacion-animal.entity';
import { EspeciesAnimalesModule } from 'src/modules/catalogos/especies-animales/especies-animales.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([ConservacionAnimal]),
		EspeciesAnimalesModule
	],
	providers: [ConservacionAnimalesService],
	exports: [ConservacionAnimalesService]
})
export class ConservacionAnimalesModule { }
