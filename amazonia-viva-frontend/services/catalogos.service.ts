import { api } from './apiClient';
import type { Paginated, Ref } from '../types/api';

/** Catálogos públicos para poblar dropdowns de formularios. Cada `/forms` envuelve en su clave. */

export const getTiposOrganizaciones = (signal?: AbortSignal) =>
  api.get<{ tiposOrganizaciones: Ref[] }>('/tipos-organizaciones/forms', { signal }).then((r) => r.tiposOrganizaciones);

export const getFormasJuridicas = (signal?: AbortSignal) =>
  api.get<{ formasJuridicas: Ref[] }>('/formas-juridicas/forms', { signal }).then((r) => r.formasJuridicas);

export const getApoyos = (signal?: AbortSignal) =>
  api.get<{ apoyos: Ref[] }>('/apoyos/forms', { signal }).then((r) => r.apoyos);

export const getMotivos = (signal?: AbortSignal) =>
  api.get<{ motivos: Ref[] }>('/motivos/forms', { signal }).then((r) => r.motivos);

export const getOds = (signal?: AbortSignal) =>
  api.get<{ ods: Ref[] }>('/ods', { signal }).then((r) => r.ods);

export const getDepartamentos = (signal?: AbortSignal) =>
  api.get<Paginated<Ref>>('/departamentos', { query: { limit: 100 }, signal }).then((r) => r.data);
