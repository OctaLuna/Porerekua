import { PartialType } from '@nestjs/swagger';
import { CreateAyudasProyectoDto } from './create-ayudas-proyecto.dto';

export class UpdateAyudasProyectoDto extends PartialType(CreateAyudasProyectoDto) {}
