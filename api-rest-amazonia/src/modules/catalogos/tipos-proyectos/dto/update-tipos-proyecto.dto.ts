import { PartialType } from '@nestjs/swagger';
import { CreateTiposProyectoDto } from './create-tipos-proyecto.dto';

export class UpdateTiposProyectoDto extends PartialType(CreateTiposProyectoDto) {}
