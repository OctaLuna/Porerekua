import { api, type Query } from './apiClient';
import type { EmpresaCard, EmpresaDetalle, EmpresaFiltros, Paginated } from '../types/api';

/** GET /empresas/:id — requiere token. La API envuelve en `{ empresa }`. */
export const getEmpresa = (id: number, signal?: AbortSignal) =>
  api.get<{ empresa: EmpresaDetalle }>(`/empresas/${id}`, { signal }).then((r) => r.empresa);

/** GET /empresas — público (card sin token). Listado paginado. */
export const getEmpresas = (params?: Query, signal?: AbortSignal) =>
  api.get<Paginated<EmpresaCard>>('/empresas', { query: params, signal });

/** GET /empresas/filtros-disponibles — público. */
export const getEmpresasFiltros = (signal?: AbortSignal) =>
  api.get<EmpresaFiltros>('/empresas/filtros-disponibles', { signal });
