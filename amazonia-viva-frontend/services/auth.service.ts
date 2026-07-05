import { api } from './apiClient';
import type { AuthToken, Usuario } from '../types/api';

/** POST /auth/login — público. Devuelve el token JWT. */
export const login = (body: { email: string; password: string }) =>
  api.post<AuthToken>('/auth/login', body);

/** GET /auth/me — requiere token. La API envuelve el perfil en `{ usuario }`. */
export const getMe = () =>
  api.get<{ usuario: Usuario }>('/auth/me').then((r) => r.usuario);

/** POST /auth/logout — requiere token. */
export const logout = () => api.post<void>('/auth/logout');
