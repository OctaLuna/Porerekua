import { useMutation } from '@tanstack/react-query';
import { registrarEmpresa, registrarOrganizacion } from '../services/formularios.service';

export const useRegistrarOrganizacion = () =>
  useMutation({ mutationFn: registrarOrganizacion });

export const useRegistrarEmpresa = () =>
  useMutation({ mutationFn: registrarEmpresa });
