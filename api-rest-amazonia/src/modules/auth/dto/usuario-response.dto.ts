import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RoleEnum } from 'src/shared/enums/role.enum';

export class UsuarioResponseDto {
    @ApiProperty({ type: Number, example: 1 })
    id: number;

    @ApiProperty({ type: String, example: 'admin@kaaiya.bo' })
    email: string;

    @ApiProperty({ type: String, example: 'Juan Pérez' })
    nombre: string;

    @ApiProperty({ enum: RoleEnum, example: RoleEnum.Admin })
    rol: RoleEnum;

    @ApiProperty({ type: Boolean, example: true })
    activo: boolean;

    @ApiPropertyOptional({ type: String, example: '2027-06-30T23:59:59.000Z', nullable: true })
    fechaExpiracion: Date | null;

    @ApiProperty({ type: String, example: '2026-06-11T10:00:00.000Z' })
    createdAt: Date;

    @ApiProperty({ type: String, example: '2026-06-11T10:00:00.000Z' })
    updatedAt: Date;
}
