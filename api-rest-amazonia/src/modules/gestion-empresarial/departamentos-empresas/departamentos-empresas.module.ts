import { Module } from '@nestjs/common';
import { DepartamentosEmpresasService } from './services/departamentos-empresas.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DepartamentoEmpresa } from './entities/departamento-empresa.entity';
import { DepartamentosModule } from 'src/modules/ubicaciones-geograficas/departamentos/departamentos.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([DepartamentoEmpresa]),
		DepartamentosModule,
	],
	providers: [DepartamentosEmpresasService],
	exports: [DepartamentosEmpresasService]
})
export class DepartamentosEmpresasModule { }
