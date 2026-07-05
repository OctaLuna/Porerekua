import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComunidadMunicipio } from './entities/comunidad-municipio.entity';

// AUDIT-003: controller y servicio scaffolding (público, sin guard, oculto de
// Swagger, sin uso real) eliminados. Se conserva el registro de la entidad
// pivote por si TypeORM la requiere para relaciones.
@Module({
	imports: [
		TypeOrmModule.forFeature([ComunidadMunicipio])
	],
})
export class ComunidadesMunicipiosModule { }
