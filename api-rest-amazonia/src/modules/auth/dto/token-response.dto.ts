import { ApiProperty } from '@nestjs/swagger';

export class TokenResponseDto {
    @ApiProperty({
        description: 'Token JWT de acceso',
        type: String,
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    })
    accessToken: string;

    @ApiProperty({
        description: 'Tipo de token',
        type: String,
        example: 'Bearer',
    })
    tipo: string;

    @ApiProperty({
        description: 'Tiempo de expiración del token',
        type: String,
        example: '24h',
    })
    expiresIn: string;
}
