import { PartialType } from '@nestjs/swagger';
import { CreateConservacionAnimaleDto } from './create-conservacion-animale.dto';

export class UpdateConservacionAnimaleDto extends PartialType(CreateConservacionAnimaleDto) {}
