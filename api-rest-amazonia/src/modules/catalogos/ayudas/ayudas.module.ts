import { Module } from '@nestjs/common';
import { AyudasService } from './services/ayudas.service';
import { AyudasController } from './controllers/ayudas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ayuda } from './entities/ayuda.entity';

@Module({
	imports: [
		TypeOrmModule.forFeature([Ayuda])
	],
	controllers: [AyudasController],
	providers: [AyudasService],
	exports: [AyudasService]
})
export class AyudasModule { }
