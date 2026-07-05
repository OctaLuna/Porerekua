import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, ValidateIf } from 'class-validator';

export class BloqueContenidoDto {
    @ApiProperty({
        description: 'Tipo de bloque de contenido',
        enum: ['subtitulo', 'parrafo', 'imagen'],
        example: 'parrafo',
    })
    @IsIn(['subtitulo', 'parrafo', 'imagen'])
    tipo: 'subtitulo' | 'parrafo' | 'imagen';

    @ApiPropertyOptional({
        description: 'Texto del bloque (requerido para tipo subtitulo y parrafo)',
        example: 'Introducción al proyecto de conservación',
    })
    @ValidateIf((o) => o.tipo === 'subtitulo' || o.tipo === 'parrafo')
    @IsString()
    texto?: string;

    @ApiPropertyOptional({
        description: 'URL de la imagen (requerida para tipo imagen)',
        example: 'https://api.kaaiya.com/uploads/publicaciones/abc123.webp',
    })
    @ValidateIf((o) => o.tipo === 'imagen')
    @IsString()
    url?: string;

    @ApiPropertyOptional({
        description: 'Descripción accesible de la imagen (alt text)',
        example: 'Vista aérea del Parque Nacional Madidi',
    })
    @IsOptional()
    @IsString()
    descripcion?: string;
}
