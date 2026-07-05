import { useQuery } from '@tanstack/react-query';
import {
  getApoyos,
  getDepartamentos,
  getFormasJuridicas,
  getMotivos,
  getOds,
  getTiposOrganizaciones,
} from '../services/catalogos.service';
import type { Ref } from '../types/api';

const catalogo = (key: string, fn: (signal?: AbortSignal) => Promise<Ref[]>) =>
  useQuery<Ref[], Error>({ queryKey: ['catalogo', key], queryFn: ({ signal }) => fn(signal), staleTime: 5 * 60 * 1000 });

export const useTiposOrganizaciones = () => catalogo('tipos-organizaciones', getTiposOrganizaciones);
export const useFormasJuridicas = () => catalogo('formas-juridicas', getFormasJuridicas);
export const useApoyos = () => catalogo('apoyos', getApoyos);
export const useMotivos = () => catalogo('motivos', getMotivos);
export const useOds = () => catalogo('ods', getOds);
export const useDepartamentos = () => catalogo('departamentos', getDepartamentos);
