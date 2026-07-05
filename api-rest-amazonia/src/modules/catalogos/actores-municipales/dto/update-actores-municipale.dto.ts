import { PartialType } from '@nestjs/swagger';
import { CreateActoresMunicipaleDto } from './create-actores-municipale.dto';

export class UpdateActoresMunicipaleDto extends PartialType(CreateActoresMunicipaleDto) {}
