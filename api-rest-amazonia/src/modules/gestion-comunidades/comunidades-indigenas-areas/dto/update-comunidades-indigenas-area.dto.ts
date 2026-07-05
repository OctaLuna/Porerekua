import { PartialType } from '@nestjs/swagger';
import { CreateComunidadesIndigenasAreaDto } from './create-comunidades-indigenas-area.dto';

export class UpdateComunidadesIndigenasAreaDto extends PartialType(CreateComunidadesIndigenasAreaDto) {}
