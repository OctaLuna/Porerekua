import { PartialType } from '@nestjs/swagger';
import { CreateOrganizacionesEmpresaDto } from './create-organizaciones-empresa.dto';

export class UpdateOrganizacionesEmpresaDto extends PartialType(CreateOrganizacionesEmpresaDto) {}
