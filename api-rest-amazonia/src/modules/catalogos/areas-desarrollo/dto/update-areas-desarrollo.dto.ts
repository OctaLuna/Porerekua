import { PartialType } from '@nestjs/swagger';
import { CreateAreasDesarrolloDto } from './create-areas-desarrollo.dto';

export class UpdateAreasDesarrolloDto extends PartialType(CreateAreasDesarrolloDto) {}
