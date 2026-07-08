import { describe, expect, it } from 'vitest';
import { ApiError } from './apiClient';
import parseApiError from './errorHelper';

describe('parseApiError', () => {
  it('reports a connection error for status 0', () => {
    const parsed = parseApiError(new ApiError('Network down', 0));

    expect(parsed.userMessage).toMatch(/no se pudo conectar/i);
  });

  it('reports a generic server error for 5xx statuses', () => {
    const parsed = parseApiError(new ApiError('Boom', 500));

    expect(parsed.userMessage).toMatch(/error en el servidor/i);
  });

  it('extracts field-level errors from a details.errors object', () => {
    const parsed = parseApiError(new ApiError('Validation failed', 400, {
      errors: { nombre: ['El nombre es requerido'], area: 'Área inválida' },
    }));

    expect(parsed.fieldErrors).toEqual({
      nombre: 'El nombre es requerido',
      area: 'Área inválida',
    });
    expect(parsed.userMessage).toMatch(/errores en algunos campos/i);
  });

  it('joins a details.message array into a single string', () => {
    const parsed = parseApiError(new ApiError('Validation failed', 422, {
      message: ['El nombre es requerido', 'El área es requerida'],
    }));

    expect(parsed.userMessage).toBe('El nombre es requerido El área es requerida');
  });

  it('uses details.message directly when it is a string', () => {
    const parsed = parseApiError(new ApiError('Validation failed', 422, {
      message: 'Formulario inválido',
    }));

    expect(parsed.userMessage).toBe('Formulario inválido');
  });

  it('uses details directly when it is a plain string', () => {
    const parsed = parseApiError(new ApiError('Validation failed', 422, 'Formulario inválido'));

    expect(parsed.userMessage).toBe('Formulario inválido');
    expect(parsed.technical).toBe('Formulario inválido');
  });

  it('falls back to the ApiError message when there are no details', () => {
    const parsed = parseApiError(new ApiError('Servicio no disponible', 400));

    expect(parsed.userMessage).toBe('Servicio no disponible');
  });

  it('returns the default message for a non-ApiError value', () => {
    const parsed = parseApiError(new Error('unexpected'));

    expect(parsed.userMessage).toMatch(/ocurrió un error/i);
  });
});
