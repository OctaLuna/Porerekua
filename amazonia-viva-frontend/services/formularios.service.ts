import { api } from './apiClient';
import type { RegisterFormularioEmpresa, RegisterFormularioOrganizacion } from '../types/api';

/** POST /formularios/organizaciones — público. */
export const registrarOrganizacion = (body: RegisterFormularioOrganizacion) =>
  api.post<{ message: string }>('/formularios/organizaciones', body);

/** POST /formularios/empresas — público. */
export const registrarEmpresa = (body: RegisterFormularioEmpresa) =>
  api.post<{ message: string }>('/formularios/empresas', body);
