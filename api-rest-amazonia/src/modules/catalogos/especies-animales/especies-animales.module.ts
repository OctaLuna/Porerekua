import { Module } from '@nestjs/common';
import { EspeciesAnimalesService } from './services/especies-animales.service';
import { EspeciesAnimalesController } from './controllers/especies-animales.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EspecieAnimal } from './entities/especie-animal.entity';

@Module({
	imports: [
		TypeOrmModule.forFeature([EspecieAnimal])
	],
	controllers: [EspeciesAnimalesController],
	providers: [EspeciesAnimalesService],
	exports: [EspeciesAnimalesService]
})
export class EspeciesAnimalesModule { }
