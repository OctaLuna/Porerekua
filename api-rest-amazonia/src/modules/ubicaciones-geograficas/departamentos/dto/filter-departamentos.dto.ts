import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';
import { PaginationParamsDto } from 'src/shared/dto/pagination-params.dto';

export class FilterDepartamentosDto extends PaginationParamsDto {
    @ApiPropertyOptional({
        description: 'Filtrar solo departamentos amazónicos (true) o todos (omitir/false)',
        type: Boolean,
        example: true,
    })
    @IsOptional()
    // AUDIT-006: leer el valor crudo de `obj` (no `value`), porque el
    // ValidationPipe global usa enableImplicitConversion y coerciona el string
    // a boolean ANTES del transform (Boolean('false') === true). Desde `obj`
    // tenemos el string original sin coercionar.
    @Transform(({ obj }) => {
        const raw = obj?.amazonico;
        if (raw === 'true' || raw === true) return true;
        if (raw === 'false' || raw === false) return false;
        return undefined;
    })
    @IsBoolean({ message: "El parámetro 'amazonico' debe ser true o false" })
    amazonico?: boolean;
}
