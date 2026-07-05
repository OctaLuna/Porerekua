/**
 * Cliente HTTP central para el backend de Amazonía (NestJS).
 * - Base URL desde VITE_API_URL (incluye el prefijo /api).
 * - credentials: 'include' para que el navegador envíe la cookie httpOnly de sesión.
 * - Adjunta Bearer token solo si se setea explícitamente (para clientes no-browser / Swagger).
 * - Normaliza errores en ApiError y desenvuelve respuestas JSON.
 *
 * Convenciones del backend documentadas en docs/CONTRATO_API.md.
 */

// Se elimina cualquier barra final para evitar URLs con doble slash (…/api//proyectos).
const BASE_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:3333/api').replace(/\/+$/, '');

// ── Token Bearer explícito (solo para clientes no-browser; el browser usa cookie httpOnly) ──
let authToken: string | null = null;
export const setAuthToken = (token: string | null): void => {
  authToken = token;
};
export const getAuthToken = (): string | null => authToken;

// ── Error tipado ─────────────────────────────────────────────────────────────
export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly details?: unknown;

  constructor(status: number, message: string, code?: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }

  /** true cuando el endpoint exige autenticación y no hay token válido. */
  get isAuthRequired(): boolean {
    return this.status === 401 || this.code === 'AUTHENTICATION_REQUIRED';
  }
}

type QueryValue = string | number | boolean | undefined | null;
export type Query = Record<string, QueryValue>;

interface RequestOptions {
  query?: Query;
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

const buildUrl = (path: string, query?: Query): string => {
  const url = new URL(`${BASE_URL}${path}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
};

const parseBody = (text: string): unknown => {
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

async function request<T>(
  method: string,
  path: string,
  { query, body, headers, signal }: RequestOptions = {},
): Promise<T> {
  const isForm = body instanceof FormData;

  const response = await fetch(buildUrl(path, query), {
    method,
    credentials: 'include',
    headers: {
      ...(isForm || body === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...headers,
    },
    body: body === undefined ? undefined : isForm ? (body as FormData) : JSON.stringify(body),
    signal,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const data = parseBody(await response.text());

  if (!response.ok) {
    const payload = data as { message?: string | string[]; error?: string } | undefined;
    const rawMessage = payload?.message ?? payload?.error ?? response.statusText;
    const message = Array.isArray(rawMessage) ? rawMessage.join(', ') : rawMessage;
    throw new ApiError(response.status, message, payload?.error, data);
  }

  return data as T;
}

export const api = {
  get: <T>(path: string, opts?: Omit<RequestOptions, 'body'>) => request<T>('GET', path, opts),
  post: <T>(path: string, body?: unknown, opts?: Omit<RequestOptions, 'body'>) =>
    request<T>('POST', path, { ...opts, body }),
  put: <T>(path: string, body?: unknown, opts?: Omit<RequestOptions, 'body'>) =>
    request<T>('PUT', path, { ...opts, body }),
  patch: <T>(path: string, body?: unknown, opts?: Omit<RequestOptions, 'body'>) =>
    request<T>('PATCH', path, { ...opts, body }),
  del: <T>(path: string, opts?: Omit<RequestOptions, 'body'>) => request<T>('DELETE', path, opts),
};
