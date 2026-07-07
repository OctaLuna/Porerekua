const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'https://api-rest-amazonia.onrender.com';

type RequestOptions = RequestInit & { skipAuth?: boolean };

type ApiErrorPayload = {
  message?: string;
  error?: string;
  statusCode?: number;
};

const buildUrl = (path: string) => {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const sanitized = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL.replace(/\/$/, '')}${sanitized}`;
};

export class ApiError extends Error {
  status?: number;
  details?: ApiErrorPayload | unknown;

  constructor(message: string, status?: number, details?: ApiErrorPayload | unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { headers, ...rest } = options;
  const response = await fetch(buildUrl(path), {
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    ...rest,
  });

  const contentType = response.headers.get('Content-Type');
  const isJson = contentType?.includes('application/json');
  const payload = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    throw new ApiError(
      (payload as ApiErrorPayload)?.message ?? 'Error al comunicarse con el servidor',
      response.status,
      payload
    );
  }

  return payload as T;
}

export const apiClient = {
  get: <T>(path: string) => apiFetch<T>(path, { method: 'GET' }),
  post: <T>(path: string, body: unknown) => apiFetch<T>(path, { method: 'POST', body: JSON.stringify(body) }),
};
