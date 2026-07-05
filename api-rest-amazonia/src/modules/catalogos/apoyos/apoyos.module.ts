import { Module } from '@nestjs/common';
import { ApoyosService } from './service/apoyos.service';
import { ApoyosController } from './controllers/apoyos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Apoyo } from './entities/apoyo.entity';

@Module({
	imports: [
		TypeOrmModule.forFeature([Apoyo])
	],
	controllers: [ApoyosController],
	providers: [ApoyosService],
	exports: [ApoyosService]
})
export class ApoyosModule { }
