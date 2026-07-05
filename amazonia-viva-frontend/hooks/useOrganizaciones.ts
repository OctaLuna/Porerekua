import { useQuery } from '@tanstack/react-query';
import { getOrganizacion, getOrganizaciones, getOrganizacionesFiltros } from '../services/organizaciones.service';
import type { OrganizacionCard, OrganizacionDetalle, OrganizacionFiltros, Paginated } from '../types/api';
import type { Query } from '../services/apiClient';

export const useOrganizacion = (id: number | null, enabled = true) =>
  useQuery<OrganizacionDetalle, Error>({
    queryKey: ['organizaciones', 'detalle', id],
    queryFn: ({ signal }) => getOrganizacion(id as number, signal),
    enabled: enabled && id != null,
  });

export const useOrganizaciones = (params?: Query) =>
  useQuery<Paginated<OrganizacionCard>, Error>({
    queryKey: ['organizaciones', 'list', params],
    queryFn: ({ signal }) => getOrganizaciones(params, signal),
  });

export const useOrganizacionesFiltros = () =>
  useQuery<OrganizacionFiltros, Error>({
    queryKey: ['organizaciones', 'filtros'],
    queryFn: ({ signal }) => getOrganizacionesFiltros(signal),
  });
