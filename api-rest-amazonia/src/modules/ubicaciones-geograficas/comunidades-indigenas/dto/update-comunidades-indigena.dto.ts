import { PartialType } from '@nestjs/swagger';
import { CreateComunidadesIndigenaDto } from './create-comunidades-indigena.dto';

export class UpdateComunidadesIndigenaDto extends PartialType(CreateComunidadesIndigenaDto) {}
