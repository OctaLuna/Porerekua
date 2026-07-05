import { api, type Query } from './apiClient';
import type { Paginated, RegisterUsuario, UpdateUsuario, Usuario } from '../types/api';

/** GET /auth/usuarios — Admin. Listado paginado (filtros rol, activo, search). */
export const getUsuarios = (params?: Query, signal?: AbortSignal) =>
  api.get<Paginated<Usuario>>('/auth/usuarios', { query: params, signal });

/** POST /auth/register — Admin. Crea un usuario. */
export const registerUsuario = (body: RegisterUsuario) =>
  api.post<Usuario>('/auth/register', body);

/** PATCH /auth/usuarios/:id — Admin. */
export const updateUsuario = (id: number, body: UpdateUsuario) =>
  api.patch<Usuario>(`/auth/usuarios/${id}`, body);

/** DELETE /auth/usuarios/:id — Admin. */
export const deleteUsuario = (id: number) =>
  api.del<{ message: string }>(`/auth/usuarios/${id}`);
