import { PartialType } from '@nestjs/swagger';
import { CreateAyudaDto } from './create-ayuda.dto';

export class UpdateAyudaDto extends PartialType(CreateAyudaDto) {}
