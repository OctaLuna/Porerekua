import { Module } from '@nestjs/common';
import { EmpresasService } from './services/empresas.service';
import { EmpresasController } from './controllers/empresas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Empresa } from './entities/empresa.entity';
import { FormasJuridicasModule } from 'src/modules/catalogos/formas-juridicas/formas-juridicas.module';
import { DepartamentosEmpresasModule } from '../departamentos-empresas/departamentos-empresas.module';
import { ApoyosEmpresasModule } from '../apoyos-empresas/apoyos-empresas.module';
import { OrganizacionesEmpresasModule } from 'src/modules/gestion-organizacional/organizaciones-empresas/organizaciones-empresas.module';
import { MotivosEmpresasModule } from '../motivos-empresas/motivos-empresas.module';
import { OdsEmpresasModule } from '../ods-empresas/ods-empresas.module';
import { AuthModule } from 'src/modules/auth/auth.module';
import { UploadModule } from 'src/shared/upload/upload.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([Empresa]),
		FormasJuridicasModule,
		DepartamentosEmpresasModule,
		ApoyosEmpresasModule,
		OrganizacionesEmpresasModule,
		MotivosEmpresasModule,
		OdsEmpresasModule,
		AuthModule,
		UploadModule,
	],
	controllers: [EmpresasController],
	providers: [EmpresasService],
	exports: [EmpresasService],
})
export class EmpresasModule { }
