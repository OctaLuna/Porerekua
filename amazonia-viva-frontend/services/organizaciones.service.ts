import { api, type Query } from './apiClient';
import type { OrganizacionCard, OrganizacionDetalle, OrganizacionFiltros, Paginated } from '../types/api';

/** GET /organizaciones/:id — requiere token. La API envuelve en `{ organizacion }`. */
export const getOrganizacion = (id: number, signal?: AbortSignal) =>
  api.get<{ organizacion: OrganizacionDetalle }>(`/organizaciones/${id}`, { signal }).then((r) => r.organizacion);

/** GET /organizaciones — público (card sin token). Listado paginado. */
export const getOrganizaciones = (params?: Query, signal?: AbortSignal) =>
  api.get<Paginated<OrganizacionCard>>('/organizaciones', { query: params, signal });

/** GET /organizaciones/filtros-disponibles — público. */
export const getOrganizacionesFiltros = (signal?: AbortSignal) =>
  api.get<OrganizacionFiltros>('/organizaciones/filtros-disponibles', { signal });
