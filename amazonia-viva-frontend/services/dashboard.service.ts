import { api } from './apiClient';
import type {
  DashboardFiltrosDisponibles,
  DashboardPorRegion,
  DashboardPorTipo,
  DashboardPublicoPorRegion,
  DashboardPublicoResumen,
  DashboardResumen,
  DashboardTimeline,
} from '../types/api';

/** Endpoints públicos (sin token). */
export const getDashboardPublicoResumen = (signal?: AbortSignal) =>
  api.get<DashboardPublicoResumen>('/dashboard/publico/resumen', { signal });

export const getDashboardPublicoPorRegion = (signal?: AbortSignal) =>
  api.get<DashboardPublicoPorRegion[]>('/dashboard/publico/por-region', { signal });

/** Endpoints privados (requieren token). */

export const getDashboardResumen = (signal?: AbortSignal) =>
  api.get<DashboardResumen>('/dashboard/resumen', { signal });

export const getDashboardPorRegion = (signal?: AbortSignal) =>
  api.get<DashboardPorRegion[]>('/dashboard/por-region', { signal });

export const getDashboardPorTipo = (signal?: AbortSignal) =>
  api.get<DashboardPorTipo[]>('/dashboard/por-tipo', { signal });

export const getDashboardTimeline = (signal?: AbortSignal) =>
  api.get<DashboardTimeline[]>('/dashboard/timeline', { signal });

/** GET /dashboard/por-tipo con filtros opcionales (area, departamento). */
export const getDashboardPorTipoFiltrado = (
  params: { area?: number; departamento?: number },
  signal?: AbortSignal,
) =>
  api.get<DashboardPorTipo[]>('/dashboard/por-tipo', {
    query: {
      ...(params.area !== undefined ? { area: params.area } : {}),
      ...(params.departamento !== undefined ? { departamento: params.departamento } : {}),
    },
    signal,
  });

/** GET /dashboard/filtros-disponibles — catálogos para los selects de filtros. */
export const getDashboardFiltrosDisponibles = (signal?: AbortSignal) =>
  api.get<DashboardFiltrosDisponibles>('/dashboard/filtros-disponibles', { signal });
