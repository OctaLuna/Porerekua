import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  crearPublicacion,
  editarPublicacion,
  eliminarPublicacion,
  getPublicacion,
  getPublicaciones,
  getPublicacionesMias,
  subirImagenPublicacion,
} from '../services/publicaciones.service';
import type {
  CrearPublicacion,
  EditarPublicacion,
  Paginated,
  PublicacionCard,
  PublicacionDetalle,
} from '../types/api';
import type { Query } from '../services/apiClient';

export const usePublicaciones = (params?: Query) =>
  useQuery<Paginated<PublicacionCard>, Error>({
    queryKey: ['publicaciones', 'list', params],
    queryFn: ({ signal }) => getPublicaciones(params, signal),
  });

export const usePublicacion = (slug: string | null) =>
  useQuery<PublicacionDetalle, Error>({
    queryKey: ['publicaciones', 'detalle', slug],
    queryFn: ({ signal }) => getPublicacion(slug as string, signal),
    enabled: slug != null,
  });

export const usePublicacionesMias = (params?: Query) =>
  useQuery<Paginated<PublicacionCard>, Error>({
    queryKey: ['publicaciones', 'mias', params],
    queryFn: ({ signal }) => getPublicacionesMias(params, signal),
  });

export const useCrearPublicacion = () => {
  const qc = useQueryClient();
  return useMutation<PublicacionDetalle, Error, CrearPublicacion>({
    mutationFn: crearPublicacion,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['publicaciones'] });
    },
  });
};

export const useEditarPublicacion = () => {
  const qc = useQueryClient();
  return useMutation<PublicacionDetalle, Error, { id: string; dto: EditarPublicacion }>({
    mutationFn: ({ id, dto }) => editarPublicacion(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['publicaciones'] });
    },
  });
};

export const useEliminarPublicacion = () => {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: eliminarPublicacion,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['publicaciones'] });
    },
  });
};

export const useSubirImagenPublicacion = () =>
  useMutation<{ id: string; url: string; descripcion: string | null; orden: number }, Error, { id: string; file: File; descripcion?: string }>({
    mutationFn: ({ id, file, descripcion }) => subirImagenPublicacion(id, file, descripcion),
  });
