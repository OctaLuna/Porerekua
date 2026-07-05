import { PartialType } from '@nestjs/swagger';
import { CreatePracticasAgricolaDto } from './create-practicas-agricola.dto';

export class UpdatePracticasAgricolaDto extends PartialType(CreatePracticasAgricolaDto) {}
