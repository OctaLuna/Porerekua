import { PartialType } from '@nestjs/swagger';
import { CreateLocalidadesProyectoDto } from './create-localidades-proyecto.dto';

export class UpdateLocalidadesProyectoDto extends PartialType(CreateLocalidadesProyectoDto) {}
