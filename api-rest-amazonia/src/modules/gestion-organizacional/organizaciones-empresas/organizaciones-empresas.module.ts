import { Module } from '@nestjs/common';
import { OrganizacionesEmpresasService } from './services/organizaciones-empresas.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizacionEmpresa } from './entities/organizacion-empresa.entity';

@Module({
	imports: [
		TypeOrmModule.forFeature([OrganizacionEmpresa])
	],
	providers: [OrganizacionesEmpresasService],
	exports: [OrganizacionesEmpresasService]
})
export class OrganizacionesEmpresasModule { }
