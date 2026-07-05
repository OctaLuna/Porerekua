import { PartialType } from '@nestjs/swagger';
import { CreateDepartamentosEmpresaDto } from './create-departamentos-empresa.dto';

export class UpdateDepartamentosEmpresaDto extends PartialType(CreateDepartamentosEmpresaDto) {}
