import { useQuery } from '@tanstack/react-query';
import {
  getDashboardFiltrosDisponibles,
  getDashboardPorRegion,
  getDashboardPorTipo,
  getDashboardPorTipoFiltrado,
  getDashboardPublicoPorRegion,
  getDashboardPublicoResumen,
  getDashboardResumen,
  getDashboardTimeline,
} from '../services/dashboard.service';
import type {
  DashboardFiltrosDisponibles,
  DashboardPorRegion,
  DashboardPorTipo,
  DashboardPublicoPorRegion,
  DashboardPublicoResumen,
  DashboardResumen,
  DashboardTimeline,
} from '../types/api';

export const useDashboardPublicoResumen = () =>
  useQuery<DashboardPublicoResumen, Error>({
    queryKey: ['dashboard', 'publico', 'resumen'],
    queryFn: ({ signal }) => getDashboardPublicoResumen(signal),
    staleTime: 5 * 60 * 1000,
  });

export const useDashboardPublicoPorRegion = () =>
  useQuery<DashboardPublicoPorRegion[], Error>({
    queryKey: ['dashboard', 'publico', 'por-region'],
    queryFn: ({ signal }) => getDashboardPublicoPorRegion(signal),
    staleTime: 5 * 60 * 1000,
  });

export const useDashboardResumen = (enabled = true) =>
  useQuery<DashboardResumen, Error>({
    queryKey: ['dashboard', 'resumen'],
    queryFn: ({ signal }) => getDashboardResumen(signal),
    enabled,
  });

export const useDashboardPorRegion = (enabled = true) =>
  useQuery<DashboardPorRegion[], Error>({
    queryKey: ['dashboard', 'por-region'],
    queryFn: ({ signal }) => getDashboardPorRegion(signal),
    enabled,
  });

export const useDashboardPorTipo = (enabled = true) =>
  useQuery<DashboardPorTipo[], Error>({
    queryKey: ['dashboard', 'por-tipo'],
    queryFn: ({ signal }) => getDashboardPorTipo(signal),
    enabled,
  });

export const useDashboardTimeline = (enabled = true) =>
  useQuery<DashboardTimeline[], Error>({
    queryKey: ['dashboard', 'timeline'],
    queryFn: ({ signal }) => getDashboardTimeline(signal),
    enabled,
  });

export const useDashboardPorTipoFiltrado = (
  params: { area?: number; departamento?: number },
  enabled = true,
) =>
  useQuery<DashboardPorTipo[], Error>({
    queryKey: ['dashboard', 'por-tipo', 'filtrado', params],
    queryFn: ({ signal }) => getDashboardPorTipoFiltrado(params, signal),
    enabled,
    staleTime: 60 * 1000,
  });

export const useDashboardFiltros = (enabled = true) =>
  useQuery<DashboardFiltrosDisponibles, Error>({
    queryKey: ['dashboard', 'filtros-disponibles'],
    queryFn: ({ signal }) => getDashboardFiltrosDisponibles(signal),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
