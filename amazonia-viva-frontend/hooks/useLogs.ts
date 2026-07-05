import { useQuery } from '@tanstack/react-query';
import { getLogs } from '../services/logs.service';
import type { FiltrosLogs, LogAuditoria, Paginated } from '../types/api';

export const useLogs = (params?: FiltrosLogs) =>
  useQuery<Paginated<LogAuditoria>, Error>({
    queryKey: ['logs', params],
    queryFn: ({ signal }) => getLogs(params, signal),
    staleTime: 0,
  });
