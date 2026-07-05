import { PartialType } from '@nestjs/swagger';
import { CreateOrganizacioneDto } from './create-organizacione.dto';

export class UpdateOrganizacioneDto extends PartialType(CreateOrganizacioneDto) {}
