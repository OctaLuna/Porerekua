import { Module } from '@nestjs/common';
import { OdsService } from './services/ods.service';
import { OdsController } from './controllers/ods.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ods } from './entities/ods.entity';

@Module({
	imports: [
		TypeOrmModule.forFeature([Ods])
	],
	controllers: [OdsController],
	providers: [OdsService],
	exports: [OdsService]
})
export class OdsModule { }
