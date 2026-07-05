import { api, type Query } from './apiClient';
import type {
  AprobarSolicitud,
  CrearSolicitud,
  Paginated,
  RechazarSolicitud,
  Solicitud,
} from '../types/api';

/** POST /auth/solicitar-acceso — público. Solicitud de acceso de investigador. */
export const solicitarAcceso = (body: CrearSolicitud) =>
  api.post<{ message: string }>('/auth/solicitar-acceso', body);

/** GET /auth/solicitudes — Admin. Listado paginado (filtro por estado). */
export const getSolicitudes = (params?: Query, signal?: AbortSignal) =>
  api.get<Paginated<Solicitud>>('/auth/solicitudes', { query: params, signal });

/** PATCH /auth/solicitudes/:id/aprobar — Admin. */
export const aprobarSolicitud = (id: number, body: AprobarSolicitud) =>
  api.patch<{ message: string }>(`/auth/solicitudes/${id}/aprobar`, body);

/** PATCH /auth/solicitudes/:id/rechazar — Admin. */
export const rechazarSolicitud = (id: number, body: RechazarSolicitud) =>
  api.patch<{ message: string }>(`/auth/solicitudes/${id}/rechazar`, body);
