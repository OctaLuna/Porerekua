import { api, type Query } from './apiClient';
import type { Paginated, ProyectoCard, ProyectoDetalle, ProyectoFiltros, ProyectoMap } from '../types/api';

/** GET /proyectos/:id — requiere token. La API envuelve en `{ proyecto }`. */
export const getProyecto = (id: number, signal?: AbortSignal) =>
  api.get<{ proyecto: ProyectoDetalle }>(`/proyectos/${id}`, { signal }).then((r) => r.proyecto);

/** GET /proyectos/map — público. Proyectos con coordenadas para el mapa. */
export const getProyectosMap = (signal?: AbortSignal) =>
  api.get<ProyectoMap[]>('/proyectos/map', { signal });

/** GET /proyectos — público (card sin token). Listado paginado con filtros. */
export const getProyectos = (params?: Query, signal?: AbortSignal) =>
  api.get<Paginated<ProyectoCard>>('/proyectos', { query: params, signal });

/** GET /proyectos/filtros-disponibles — público. Valores para selects de filtro. */
export const getProyectosFiltros = (signal?: AbortSignal) =>
  api.get<ProyectoFiltros>('/proyectos/filtros-disponibles', { signal });
