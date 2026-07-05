import { plainToInstance } from 'class-transformer';
import { FilterDepartamentosDto } from './filter-departamentos.dto';

// AUDIT-006: el ValidationPipe global usa enableImplicitConversion, que para
// booleanos convierte cualquier string no vacío a `true` (Boolean('false')===true).
// Estos tests fijan el comportamiento correcto del transform.
describe('FilterDepartamentosDto.amazonico (AUDIT-006)', () => {
    const toDto = (value: unknown) =>
        plainToInstance(
            FilterDepartamentosDto,
            { amazonico: value },
            { enableImplicitConversion: true },
        );

    it("'true' ⇒ true", () => {
        expect(toDto('true').amazonico).toBe(true);
    });

    it("'false' ⇒ false (no debe coercionarse a true)", () => {
        expect(toDto('false').amazonico).toBe(false);
    });

    it('ausente ⇒ undefined (no filtra)', () => {
        const dto = plainToInstance(
            FilterDepartamentosDto,
            {},
            { enableImplicitConversion: true },
        );
        expect(dto.amazonico).toBeUndefined();
    });
});
