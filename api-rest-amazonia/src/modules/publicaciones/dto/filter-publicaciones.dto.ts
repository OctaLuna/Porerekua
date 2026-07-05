import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Min } from 'class-validator';
import { PaginationParamsDto } from 'src/shared/dto/pagination-params.dto';

export class FilterPublicacionesDto extends PaginationParamsDto {
    @ApiPropertyOptional({
        description: 'Filtrar por estado de publicación',
        enum: ['borrador', 'publicado'],
    })
    @IsOptional()
    @IsIn(['borrador', 'publicado'])
    estado?: 'borrador' | 'publicado';

    @ApiPropertyOptional({
        description: 'Filtrar por id del autor (solo para admins)',
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    autor_id?: number;
}
