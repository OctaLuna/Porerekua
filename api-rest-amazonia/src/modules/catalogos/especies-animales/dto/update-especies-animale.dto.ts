import { PartialType } from '@nestjs/swagger';
import { CreateEspeciesAnimaleDto } from './create-especies-animale.dto';

export class UpdateEspeciesAnimaleDto extends PartialType(CreateEspeciesAnimaleDto) {}
