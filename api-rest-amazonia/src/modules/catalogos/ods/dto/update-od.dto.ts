import { PartialType } from '@nestjs/swagger';
import { CreateOdDto } from './create-od.dto';

export class UpdateOdDto extends PartialType(CreateOdDto) {}
