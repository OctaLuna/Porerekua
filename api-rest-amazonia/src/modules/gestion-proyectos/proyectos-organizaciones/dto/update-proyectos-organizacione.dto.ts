import { PartialType } from '@nestjs/swagger';
import { CreateProyectosOrganizacioneDto } from './create-proyectos-organizacione.dto';

export class UpdateProyectosOrganizacioneDto extends PartialType(CreateProyectosOrganizacioneDto) {}
