import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsIn, IsOptional, IsString, MaxLength, MinLength, ValidateNested } from 'class-validator';
import { BloqueContenidoDto } from './bloque-contenido.dto';

export class UpdatePublicacionDto {
    @ApiPropertyOptional({
        description: 'Nuevo título de la publicación',
        maxLength: 500,
    })
    @IsOptional()
    @IsString()
    @MinLength(5)
    @MaxLength(500)
    titulo?: string;

    @ApiPropertyOptional({
        description: 'Contenido estructurado actualizado',
        type: [BloqueContenidoDto],
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => BloqueContenidoDto)
    contenido?: BloqueContenidoDto[];

    @ApiPropertyOptional({
        description: 'Cambio de estado. Al pasar a "publicado" se registra la fecha de publicación si no existía.',
        enum: ['borrador', 'publicado'],
    })
    @IsOptional()
    @IsIn(['borrador', 'publicado'])
    estado?: 'borrador' | 'publicado';
}
