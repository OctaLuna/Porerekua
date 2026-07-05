import { BadRequestException } from '@nestjs/common';
import { buildValidationPipe, validationPipeOptions } from './validation-pipe.config';
import { LoginDto } from 'src/modules/auth/dto/login.dto';

describe('ValidationPipe global (AUDIT-002)', () => {
    it('está configurado con whitelist y forbidNonWhitelisted', () => {
        expect(validationPipeOptions.whitelist).toBe(true);
        expect(validationPipeOptions.forbidNonWhitelisted).toBe(true);
        expect(validationPipeOptions.transform).toBe(true);
    });

    const meta = { type: 'body' as const, metatype: LoginDto, data: '' };

    it('rechaza con 400 cuando llegan propiedades desconocidas', async () => {
        const pipe = buildValidationPipe();
        await expect(
            pipe.transform(
                { email: 'a@b.co', password: 'Abcdef1!', campoExtraMalicioso: 'x' },
                meta,
            ),
        ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('acepta un payload válido sin campos extra', async () => {
        const pipe = buildValidationPipe();
        const result = await pipe.transform({ email: 'a@b.co', password: 'Abcdef1!' }, meta);
        expect(result).toMatchObject({ email: 'a@b.co', password: 'Abcdef1!' });
    });
});
