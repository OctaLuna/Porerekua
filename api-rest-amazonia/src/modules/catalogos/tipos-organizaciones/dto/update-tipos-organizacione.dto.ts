import { PartialType } from '@nestjs/swagger';
import { CreateTiposOrganizacioneDto } from './create-tipos-organizacione.dto';

export class UpdateTiposOrganizacioneDto extends PartialType(CreateTiposOrganizacioneDto) {}
