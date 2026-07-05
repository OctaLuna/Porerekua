import { Module } from '@nestjs/common';
import { AreasDesarrolloService } from './services/areas-desarrollo.service';
import { AreasDesarrolloController } from './controllers/areas-desarrollo.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AreaDesarrollo } from './entities/area-desarrollo.entity';

@Module({
	imports: [
		TypeOrmModule.forFeature([AreaDesarrollo])
	],
	controllers: [AreasDesarrolloController],
	providers: [AreasDesarrolloService],
	exports: [AreasDesarrolloService]
})
export class AreasDesarrolloModule { }
