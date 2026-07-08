import { describe, expect, it } from 'vitest';
import { getUsedComunidadIds, isDepartamentoDuplicated, isMunicipioDuplicated } from './projectLocationValidation';
import type { ProjectUbicacionForm } from '../types';

const ubicaciones: ProjectUbicacionForm[] = [
  {
    departamento: '1',
    municipiosTrabajo: [
      { idMunicipio: '10', idComunidadIndigena: '100' },
      { idMunicipio: '11', idComunidadIndigena: '' },
    ],
  },
  {
    departamento: '2',
    municipiosTrabajo: [
      { idMunicipio: '20', idComunidadIndigena: '200' },
    ],
  },
];

describe('isDepartamentoDuplicated', () => {
  it('flags a departamento already used by another ubicación', () => {
    expect(isDepartamentoDuplicated(ubicaciones, 1, '1')).toBe(true);
  });

  it('does not flag the ubicación against itself', () => {
    expect(isDepartamentoDuplicated(ubicaciones, 0, '1')).toBe(false);
  });

  it('does not flag an unused departamento', () => {
    expect(isDepartamentoDuplicated(ubicaciones, 0, '3')).toBe(false);
  });
});

describe('getUsedComunidadIds', () => {
  it('collects comunidad ids from every row except the one being edited', () => {
    const used = getUsedComunidadIds(ubicaciones, 0, 0);

    expect(used).toEqual(new Set(['200']));
  });

  it('ignores rows with no comunidad selected', () => {
    const used = getUsedComunidadIds(ubicaciones, 0, 1);

    expect(used.has('')).toBe(false);
  });
});

describe('isMunicipioDuplicated', () => {
  it('flags the same municipio + comunidad combination used elsewhere', () => {
    expect(isMunicipioDuplicated(ubicaciones, 1, 0, '10', '100')).toBe(true);
  });

  it('does not flag the same municipio with a different comunidad', () => {
    expect(isMunicipioDuplicated(ubicaciones, 1, 0, '10', '999')).toBe(false);
  });

  it('does not flag the row being edited against itself', () => {
    expect(isMunicipioDuplicated(ubicaciones, 0, 0, '10', '100')).toBe(false);
  });
});
