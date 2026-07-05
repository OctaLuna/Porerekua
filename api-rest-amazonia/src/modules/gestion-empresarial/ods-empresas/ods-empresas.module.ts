import { Module } from '@nestjs/common';
import { OdsEmpresasService } from './services/ods-empresas.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OdsEmpresa } from './entities/ods-empresa.entity';
import { OdsModule } from 'src/modules/catalogos/ods/ods.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([OdsEmpresa]),
		OdsModule,
	],
	providers: [OdsEmpresasService],
	exports: [OdsEmpresasService]
})
export class OdsEmpresasModule { }
