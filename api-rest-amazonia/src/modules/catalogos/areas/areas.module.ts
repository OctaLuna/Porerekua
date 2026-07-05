import { Module } from '@nestjs/common';
import { AreasService } from './services/areas.service';
import { AreasController } from './controllers/areas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Area } from './entities/area.entity';

@Module({
	imports: [
		TypeOrmModule.forFeature([Area])
	],
	controllers: [AreasController],
	providers: [AreasService],
})
export class AreasModule { }
