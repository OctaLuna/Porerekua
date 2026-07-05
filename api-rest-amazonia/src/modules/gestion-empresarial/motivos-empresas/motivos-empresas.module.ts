import { Module } from '@nestjs/common';
import { MotivosEmpresasService } from './services/motivos-empresas.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MotivoEmpresa } from './entities/motivo-empresa.entity';
import { MotivosModule } from 'src/modules/catalogos/motivos/motivos.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([MotivoEmpresa]),
		MotivosModule,
	],
	providers: [MotivosEmpresasService],
	exports: [MotivosEmpresasService]
})
export class MotivosEmpresasModule { }
