import { PartialType } from '@nestjs/swagger';
import { CreateFormasJuridicaDto } from './create-formas-juridica.dto';

export class UpdateFormasJuridicaDto extends PartialType(CreateFormasJuridicaDto) {}
