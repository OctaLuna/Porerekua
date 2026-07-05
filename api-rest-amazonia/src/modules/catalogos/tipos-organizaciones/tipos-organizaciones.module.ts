import { Module } from '@nestjs/common';
import { TiposOrganizacionesService } from './services/tipos-organizaciones.service';
import { TiposOrganizacionesController } from './controllers/tipos-organizaciones.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TipoOrganizacion } from './entities/tipo-organizacion.entity';

@Module({
	imports: [
		TypeOrmModule.forFeature([TipoOrganizacion])
	],
	controllers: [TiposOrganizacionesController],
	providers: [TiposOrganizacionesService],
	exports: [TiposOrganizacionesService]
})
export class TiposOrganizacionesModule { }
