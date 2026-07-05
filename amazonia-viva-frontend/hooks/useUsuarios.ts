import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deleteUsuario, getUsuarios, registerUsuario, updateUsuario } from '../services/usuarios.service';
import type { Paginated, RegisterUsuario, UpdateUsuario, Usuario } from '../types/api';
import type { Query } from '../services/apiClient';

export const useUsuarios = (params?: Query, enabled = true) =>
  useQuery<Paginated<Usuario>, Error>({
    queryKey: ['usuarios', params],
    queryFn: ({ signal }) => getUsuarios(params, signal),
    enabled,
  });

export const useCrearUsuario = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: RegisterUsuario) => registerUsuario(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['usuarios'] }),
  });
};

export const useActualizarUsuario = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: UpdateUsuario }) => updateUsuario(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['usuarios'] }),
  });
};

export const useEliminarUsuario = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteUsuario(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['usuarios'] }),
  });
};
