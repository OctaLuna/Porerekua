import { PartialType } from '@nestjs/swagger';
import { CreateActoresProyectoDto } from './create-actores-proyecto.dto';

export class UpdateActoresProyectoDto extends PartialType(CreateActoresProyectoDto) {}
