import { useQuery } from '@tanstack/react-query';
import { getProyecto, getProyectos, getProyectosFiltros, getProyectosMap } from '../services/proyectos.service';
import type { Paginated, ProyectoCard, ProyectoDetalle, ProyectoFiltros, ProyectoMap } from '../types/api';
import type { Query } from '../services/apiClient';

export const useProyecto = (id: number | null, enabled = true) =>
  useQuery<ProyectoDetalle, Error>({
    queryKey: ['proyectos', 'detalle', id],
    queryFn: ({ signal }) => getProyecto(id as number, signal),
    enabled: enabled && id != null,
  });

export const useProyectosMap = () =>
  useQuery<ProyectoMap[], Error>({
    queryKey: ['proyectos', 'map'],
    queryFn: ({ signal }) => getProyectosMap(signal),
  });

export const useProyectos = (params?: Query) =>
  useQuery<Paginated<ProyectoCard>, Error>({
    queryKey: ['proyectos', 'list', params],
    queryFn: ({ signal }) => getProyectos(params, signal),
  });

export const useProyectosFiltros = () =>
  useQuery<ProyectoFiltros, Error>({
    queryKey: ['proyectos', 'filtros'],
    queryFn: ({ signal }) => getProyectosFiltros(signal),
  });
