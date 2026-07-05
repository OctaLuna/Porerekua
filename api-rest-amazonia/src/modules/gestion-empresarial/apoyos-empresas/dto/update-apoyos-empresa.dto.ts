import { PartialType } from '@nestjs/swagger';
import { CreateApoyosEmpresaDto } from './create-apoyos-empresa.dto';

export class UpdateApoyosEmpresaDto extends PartialType(CreateApoyosEmpresaDto) {}
