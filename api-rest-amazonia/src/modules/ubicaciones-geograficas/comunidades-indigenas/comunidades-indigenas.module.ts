import { Module } from '@nestjs/common';
import { ComunidadesIndigenasService } from './services/comunidades-indigenas.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComunidadIndigena } from './entities/comunidad-indigena.entity';

// AUDIT-003: el controller CRUD scaffolding (público, sin guard, oculto de
// Swagger) fue eliminado. El servicio se conserva porque otros módulos
// (localidades-proyectos) dependen de él vía inyección.
@Module({
	imports: [
		TypeOrmModule.forFeature([ComunidadIndigena])
	],
	providers: [ComunidadesIndigenasService],
	exports: [ComunidadesIndigenasService]
})
export class ComunidadesIndigenasModule { }
