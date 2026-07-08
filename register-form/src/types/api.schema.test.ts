import { describe, expect, it } from 'vitest';
import {
  departamentoSchema,
  departamentosResponseSchema,
  organizacionesCatalogSchema,
  registerFormularioEmpresaSchema,
} from './api.schema';

describe('departamentoSchema', () => {
  it('accepts a departamento with nested municipios and comunidades indígenas', () => {
    const result = departamentoSchema.safeParse({
      id: 1,
      nombre: 'La Paz',
      municipios: [
        { id: 10, nombre: 'Nur', comunidadesIndigenas: [{ id: 100, nombre: 'Comunidad Uru' }] },
      ],
    });

    expect(result.success).toBe(true);
  });

  it('rejects a departamento missing municipios', () => {
    const result = departamentoSchema.safeParse({ id: 1, nombre: 'La Paz' });

    expect(result.success).toBe(false);
  });
});

describe('departamentosResponseSchema', () => {
  it('rejects a response with the wrong envelope key', () => {
    const result = departamentosResponseSchema.safeParse({ departments: [] });

    expect(result.success).toBe(false);
  });
});

describe('organizacionesCatalogSchema', () => {
  it('accepts a plain array of named resources', () => {
    const result = organizacionesCatalogSchema.safeParse([{ id: 1, nombre: 'ONG Bosque' }]);

    expect(result.success).toBe(true);
  });

  it('accepts the documented { organizaciones: [...] } envelope', () => {
    const result = organizacionesCatalogSchema.safeParse({ organizaciones: [{ id: 1, nombre: 'ONG Bosque' }] });

    expect(result.success).toBe(true);
  });

  it('rejects an unrelated shape', () => {
    const result = organizacionesCatalogSchema.safeParse({ data: [] });

    expect(result.success).toBe(false);
  });
});

describe('registerFormularioEmpresaSchema', () => {
  const validPayload = {
    nombre: 'Empresa Amazónica',
    formaJuridica: { id: 1, otro: null },
    departamentos: [1, 2],
    anioInicioApoyo: 2023,
    apoyos: { seleccionados: [1], otros: null },
    organizaciones: null,
    motivosApoyo: null,
    ods: [1, 13],
    proyectos: null,
  };

  it('accepts a well-formed payload', () => {
    const result = registerFormularioEmpresaSchema.safeParse(validPayload);

    expect(result.success).toBe(true);
  });

  it('rejects a payload with a non-numeric departamento id', () => {
    const result = registerFormularioEmpresaSchema.safeParse({
      ...validPayload,
      departamentos: ['1'],
    });

    expect(result.success).toBe(false);
  });
});
