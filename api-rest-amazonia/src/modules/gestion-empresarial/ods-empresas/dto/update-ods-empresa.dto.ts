import { PartialType } from '@nestjs/swagger';
import { CreateOdsEmpresaDto } from './create-ods-empresa.dto';

export class UpdateOdsEmpresaDto extends PartialType(CreateOdsEmpresaDto) {}
