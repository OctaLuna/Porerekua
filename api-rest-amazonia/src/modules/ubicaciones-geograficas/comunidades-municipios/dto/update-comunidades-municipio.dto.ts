import { PartialType } from '@nestjs/swagger';
import { CreateComunidadesMunicipioDto } from './create-comunidades-municipio.dto';

export class UpdateComunidadesMunicipioDto extends PartialType(CreateComunidadesMunicipioDto) {}
