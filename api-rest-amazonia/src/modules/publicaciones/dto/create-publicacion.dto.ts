import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsIn, IsOptional, IsString, MaxLength, MinLength, ValidateNested } from 'class-validator';
import { BloqueContenidoDto } from './bloque-contenido.dto';

export class CreatePublicacionDto {
    @ApiProperty({
        description: 'Título de la publicación',
        example: 'El Jaguar y su rol en el ecosistema amazónico',
        maxLength: 500,
    })
    @IsString()
    @MinLength(5, { message: 'El título debe tener al menos 5 caracteres' })
    @MaxLength(500, { message: 'El título no puede superar los 500 caracteres' })
    titulo: string;

    @ApiProperty({
        description: 'Contenido estructurado como array de bloques tipados (subtitulo, parrafo, imagen)',
        type: [BloqueContenidoDto],
        example: [
            { tipo: 'subtitulo', texto: 'Introducción' },
            { tipo: 'parrafo', texto: 'El jaguar es el felino más grande de América...' },
            { tipo: 'imagen', url: 'https://...', descripcion: 'Jaguar en hábitat natural' },
        ],
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => BloqueContenidoDto)
    contenido: BloqueContenidoDto[];

    @ApiPropertyOptional({
        description: 'Estado inicial de la publicación',
        enum: ['borrador', 'publicado'],
        default: 'borrador',
    })
    @IsOptional()
    @IsIn(['borrador', 'publicado'])
    estado?: 'borrador' | 'publicado';
}
