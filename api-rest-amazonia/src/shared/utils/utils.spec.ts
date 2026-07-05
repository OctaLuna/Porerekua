import { BadRequestException } from '@nestjs/common';
import { hashPassword, comparePassword } from './crypto.util';
import { buildPagination } from './pagination.util';
import { transformToBoolean } from './transformers.util';
import { validateData } from './validate-data.util';
import { IsString, IsInt } from 'class-validator';

describe('crypto.util', () => {
    it('hashPassword produce un hash distinto del texto plano y comparable', async () => {
        const hash = await hashPassword('Secreta1!');
        expect(hash).not.toBe('Secreta1!');
        expect(await comparePassword('Secreta1!', hash)).toBe(true);
        expect(await comparePassword('otra', hash)).toBe(false);
    });
});

describe('buildPagination', () => {
    it('calcula pages/has_next/has_prev correctamente (página intermedia)', () => {
        const r = buildPagination([1, 2], 25, 2, 10);
        expect(r).toMatchObject({ total: 25, page: 2, limit: 10, pages: 3, has_next: true, has_prev: true });
    });
    it('primera página sin previo', () => {
        expect(buildPagination([], 5, 1, 10)).toMatchObject({ pages: 1, has_next: false, has_prev: false });
    });
    it('última página sin siguiente', () => {
        expect(buildPagination([], 20, 2, 10)).toMatchObject({ pages: 2, has_next: false, has_prev: true });
    });
});

describe('transformToBoolean', () => {
    it("'true'/'false' ⇒ boolean", () => {
        expect(transformToBoolean('true', 'x')).toBe(true);
        expect(transformToBoolean('false', 'x')).toBe(false);
    });
    it('vacío/undefined/null ⇒ null', () => {
        expect(transformToBoolean('', 'x')).toBeNull();
        expect(transformToBoolean(undefined, 'x')).toBeNull();
        expect(transformToBoolean(null, 'x')).toBeNull();
    });
    it('valor inválido lanza BadRequest', () => {
        expect(() => transformToBoolean('sí', 'x')).toThrow(BadRequestException);
    });
});

describe('validateData', () => {
    class SampleDto {
        @IsString() nombre: string;
        @IsInt() edad: number;
    }
    it('no lanza con datos válidos', () => {
        expect(() => validateData(SampleDto, { nombre: 'a', edad: 1 })).not.toThrow();
    });
    it('lanza BadRequest con datos inválidos', () => {
        expect(() => validateData(SampleDto, { nombre: 1, edad: 'x' })).toThrow(BadRequestException);
    });
    it('lanza BadRequest con propiedades no permitidas', () => {
        expect(() => validateData(SampleDto, { nombre: 'a', edad: 1, extra: true })).toThrow(BadRequestException);
    });
});
