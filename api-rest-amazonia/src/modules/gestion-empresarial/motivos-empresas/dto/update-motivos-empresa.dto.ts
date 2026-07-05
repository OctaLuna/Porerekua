import { PartialType } from '@nestjs/swagger';
import { CreateMotivosEmpresaDto } from './create-motivos-empresa.dto';

export class UpdateMotivosEmpresaDto extends PartialType(CreateMotivosEmpresaDto) {}
