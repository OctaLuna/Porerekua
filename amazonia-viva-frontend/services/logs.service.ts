import { api } from './apiClient';
import type { FiltrosLogs, LogAuditoria, Paginated } from '../types/api';

/** GET /admin/logs — requiere token, rol Admin o Superadmin. */
export const getLogs = (params?: FiltrosLogs, signal?: AbortSignal) =>
  api.get<Paginated<LogAuditoria>>('/admin/logs', {
    query: params as Record<string, string | number | boolean | undefined | null>,
    signal,
  });
