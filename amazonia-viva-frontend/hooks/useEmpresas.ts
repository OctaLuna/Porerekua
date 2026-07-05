import { useQuery } from '@tanstack/react-query';
import { getEmpresa, getEmpresas, getEmpresasFiltros } from '../services/empresas.service';
import type { EmpresaCard, EmpresaDetalle, EmpresaFiltros, Paginated } from '../types/api';
import type { Query } from '../services/apiClient';

export const useEmpresa = (id: number | null, enabled = true) =>
  useQuery<EmpresaDetalle, Error>({
    queryKey: ['empresas', 'detalle', id],
    queryFn: ({ signal }) => getEmpresa(id as number, signal),
    enabled: enabled && id != null,
  });

export const useEmpresas = (params?: Query) =>
  useQuery<Paginated<EmpresaCard>, Error>({
    queryKey: ['empresas', 'list', params],
    queryFn: ({ signal }) => getEmpresas(params, signal),
  });

export const useEmpresasFiltros = () =>
  useQuery<EmpresaFiltros, Error>({
    queryKey: ['empresas', 'filtros'],
    queryFn: ({ signal }) => getEmpresasFiltros(signal),
  });
