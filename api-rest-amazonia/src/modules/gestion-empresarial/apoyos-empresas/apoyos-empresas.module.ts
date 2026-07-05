import { Module } from '@nestjs/common';
import { ApoyosEmpresasService } from './services/apoyos-empresas.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApoyoEmpresa } from './entities/apoyo-empresa.entity';
import { ApoyosModule } from 'src/modules/catalogos/apoyos/apoyos.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([ApoyoEmpresa]),
		ApoyosModule,
	],
	providers: [ApoyosEmpresasService],
	exports: [ApoyosEmpresasService]
})
export class ApoyosEmpresasModule { }
