import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { aprobarSolicitud, getSolicitudes, rechazarSolicitud } from '../services/solicitudes.service';
import type { AprobarSolicitud, Paginated, RechazarSolicitud, Solicitud } from '../types/api';
import type { Query } from '../services/apiClient';

export const useSolicitudes = (params?: Query, enabled = true) =>
  useQuery<Paginated<Solicitud>, Error>({
    queryKey: ['solicitudes', params],
    queryFn: ({ signal }) => getSolicitudes(params, signal),
    enabled,
  });

export const useAprobarSolicitud = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: AprobarSolicitud }) => aprobarSolicitud(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['solicitudes'] }),
  });
};

export const useRechazarSolicitud = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: RechazarSolicitud }) => rechazarSolicitud(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['solicitudes'] }),
  });
};
