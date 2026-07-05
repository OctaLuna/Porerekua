import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Publicacion } from './entities/publicacion.entity';
import { PublicacionImagen } from './entities/publicacion-imagen.entity';
import { PublicacionesService } from './services/publicaciones.service';
import { PublicacionesController } from './controllers/publicaciones.controller';
import { AuthModule } from 'src/modules/auth/auth.module';
import { UploadModule } from 'src/shared/upload/upload.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Publicacion, PublicacionImagen]),
        AuthModule,
        UploadModule,
    ],
    controllers: [PublicacionesController],
    providers: [PublicacionesService],
    exports: [PublicacionesService],
})
export class PublicacionesModule {}
