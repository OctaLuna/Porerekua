import { api, type Query } from './apiClient';
import type {
  CrearPublicacion,
  EditarPublicacion,
  Paginated,
  PublicacionCard,
  PublicacionDetalle,
  PublicacionImagenApi,
} from '../types/api';

/** GET /publicaciones — público. Solo estado=publicado. */
export const getPublicaciones = (params?: Query, signal?: AbortSignal) =>
  api.get<Paginated<PublicacionCard>>('/publicaciones', { query: params, signal });

/** GET /publicaciones/:slug — público. Detalle completo con bloques. */
export const getPublicacion = (slug: string, signal?: AbortSignal) =>
  api.get<PublicacionDetalle>(`/publicaciones/${slug}`, { signal });

/** GET /publicaciones/mias — requiere token, rol Investigador. Incluye borradores. */
export const getPublicacionesMias = (params?: Query, signal?: AbortSignal) =>
  api.get<Paginated<PublicacionCard>>('/publicaciones/mias', { query: params, signal });

/** POST /publicaciones — requiere token, rol Investigador. */
export const crearPublicacion = (dto: CrearPublicacion) =>
  api.post<PublicacionDetalle>('/publicaciones', dto);

/** PATCH /publicaciones/:id — requiere token, autor o Admin+. */
export const editarPublicacion = (id: string, dto: EditarPublicacion) =>
  api.patch<PublicacionDetalle>(`/publicaciones/${id}`, dto);

/** DELETE /publicaciones/:id — requiere token, autor o Admin+. */
export const eliminarPublicacion = (id: string) =>
  api.del<void>(`/publicaciones/${id}`);

/** POST /publicaciones/:id/imagenes — requiere token, autor o Admin+. */
export const subirImagenPublicacion = (id: string, file: File, descripcion?: string) => {
  const form = new FormData();
  form.append('file', file);
  if (descripcion) form.append('descripcion', descripcion);
  return api.post<PublicacionImagenApi>(`/publicaciones/${id}/imagenes`, form);
};
