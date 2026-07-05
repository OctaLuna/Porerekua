import { PartialType } from '@nestjs/swagger';
import { CreateConservacionAgricolaDto } from './create-conservacion-agricola.dto';

export class UpdateConservacionAgricolaDto extends PartialType(CreateConservacionAgricolaDto) {}
