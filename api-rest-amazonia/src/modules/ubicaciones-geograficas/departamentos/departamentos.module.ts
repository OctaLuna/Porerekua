import { Module } from '@nestjs/common';
import { DepartamentosService } from './services/departamentos.service';
import { DepartamentosController } from './controllers/departamentos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Departamento } from './entities/departamento.entity';

@Module({
	imports: [
		TypeOrmModule.forFeature([Departamento])
	],
	controllers: [DepartamentosController],
	providers: [DepartamentosService],
	exports: [DepartamentosService]
})
export class DepartamentosModule { }
