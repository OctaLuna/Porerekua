import { PartialType } from '@nestjs/swagger';
import { CreateProyectosEmpresaDto } from './create-proyectos-empresa.dto';

export class UpdateProyectosEmpresaDto extends PartialType(CreateProyectosEmpresaDto) {}
