import React, { useState } from 'react';
import { useLogs } from '../../hooks/useLogs';
import Skeleton from '../../components/ui/Skeleton';
import Button from '../../components/ui/Button';
import type { FiltrosLogs, SeveridadLog, TipoLog } from '../../types/api';

const severidadColor: Record<SeveridadLog, string> = {
  info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  warn: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  error: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  critico: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
};

const LogsPage: React.FC = () => {
  const [filtros, setFiltros] = useState<FiltrosLogs>({ page: 1, limit: 50 });

  const { data, isLoading, isError } = useLogs(filtros);
  const logs = data?.data ?? [];

  const setFiltro = (partial: Partial<FiltrosLogs>) =>
    setFiltros((prev) => ({ ...prev, ...partial, page: 1 }));

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString('es-BO', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit',
    });

  return (
    <div className="space-y-5" data-testid="logs-panel">
      <h2 className="text-xl font-bold font-serif text-carbon dark:text-beige-arena">
        Logs de auditoría
      </h2>

      {/* Filtros */}
      <div className="bg-blanco-puro/80 dark:bg-noche-selva/40 rounded-xl border border-carbon/10 dark:border-white/10 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <select
            value={filtros.tipo ?? ''}
            onChange={(e) => setFiltro({ tipo: (e.target.value as TipoLog) || undefined })}
            data-testid="filtro-tipo"
            className="px-3 py-2 rounded-lg bg-blanco-puro dark:bg-noche-selva border border-carbon/10 dark:border-white/10 text-sm text-carbon dark:text-beige-arena focus:ring-2 focus:ring-verde-brote focus:outline-none"
          >
            <option value="">Todos los tipos</option>
            <option value="aplicacion">Aplicación</option>
            <option value="seguridad">Seguridad</option>
          </select>

          <select
            value={filtros.severidad ?? ''}
            onChange={(e) => setFiltro({ severidad: (e.target.value as SeveridadLog) || undefined })}
            data-testid="filtro-severidad"
            className="px-3 py-2 rounded-lg bg-blanco-puro dark:bg-noche-selva border border-carbon/10 dark:border-white/10 text-sm text-carbon dark:text-beige-arena focus:ring-2 focus:ring-verde-brote focus:outline-none"
          >
            <option value="">Todas las severidades</option>
            <option value="info">Info</option>
            <option value="warn">Warn</option>
            <option value="error">Error</option>
            <option value="critico">Crítico</option>
          </select>

          <input
            type="date"
            value={filtros.fecha_desde?.split('T')[0] ?? ''}
            onChange={(e) => setFiltro({ fecha_desde: e.target.value ? `${e.target.value}T00:00:00Z` : undefined })}
            data-testid="filtro-fecha-desde"
            className="px-3 py-2 rounded-lg bg-blanco-puro dark:bg-noche-selva border border-carbon/10 dark:border-white/10 text-sm text-carbon dark:text-beige-arena focus:ring-2 focus:ring-verde-brote focus:outline-none"
          />

          <input
            type="date"
            value={filtros.fecha_hasta?.split('T')[0] ?? ''}
            onChange={(e) => setFiltro({ fecha_hasta: e.target.value ? `${e.target.value}T23:59:59Z` : undefined })}
            data-testid="filtro-fecha-hasta"
            className="px-3 py-2 rounded-lg bg-blanco-puro dark:bg-noche-selva border border-carbon/10 dark:border-white/10 text-sm text-carbon dark:text-beige-arena focus:ring-2 focus:ring-verde-brote focus:outline-none"
          />
        </div>
      </div>

      {/* Tabla */}
      {isError && (
        <p className="text-red-500 bg-red-500/10 rounded-lg px-4 py-3 text-sm">
          Error al cargar los logs.
        </p>
      )}

      <div className="bg-blanco-puro/80 dark:bg-noche-selva/40 rounded-xl border border-carbon/10 dark:border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-carbon/10 dark:border-white/10 bg-carbon/3 dark:bg-white/3">
                <th className="px-4 py-3 text-left font-semibold text-carbon dark:text-beige-arena">Fecha</th>
                <th className="px-4 py-3 text-left font-semibold text-carbon dark:text-beige-arena">Tipo</th>
                <th className="px-4 py-3 text-left font-semibold text-carbon dark:text-beige-arena">Severidad</th>
                <th className="px-4 py-3 text-left font-semibold text-carbon dark:text-beige-arena">Acción</th>
                <th className="px-4 py-3 text-left font-semibold text-carbon dark:text-beige-arena">IP</th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="border-b border-carbon/5 dark:border-white/5">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <Skeleton className="h-4 w-full" />
                        </td>
                      ))}
                    </tr>
                  ))
                : logs.map((log) => (
                    <tr
                      key={log.id}
                      className="border-b border-carbon/5 dark:border-white/5 hover:bg-carbon/2 dark:hover:bg-white/2 transition-colors"
                      data-testid={`log-row-${log.id}`}
                    >
                      <td className="px-4 py-3 text-gris-piedra dark:text-beige-arena/60 whitespace-nowrap">
                        {formatDate(log.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-carbon dark:text-beige-arena capitalize">
                        {log.tipo}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${severidadColor[log.severidad]}`}>
                          {log.severidad}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-carbon dark:text-beige-arena/80">
                        {log.accion}
                        {log.usuarioId && (
                          <span className="ml-2 text-gris-piedra dark:text-beige-arena/50">
                            (usuario #{log.usuarioId})
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gris-piedra dark:text-beige-arena/60 font-mono text-xs">
                        {log.ipOrigen ?? '—'}
                      </td>
                    </tr>
                  ))}
              {!isLoading && logs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gris-piedra dark:text-beige-arena/50">
                    No hay logs con los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paginación */}
      {(data?.pages ?? 1) > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setFiltros((f) => ({ ...f, page: Math.max(1, (f.page ?? 1) - 1) }))}
            disabled={!data?.has_prev}
          >
            ← Anterior
          </Button>
          <span className="px-4 py-2 text-sm text-carbon dark:text-beige-arena">
            {filtros.page} / {data?.pages}
          </span>
          <Button
            variant="outline"
            onClick={() => setFiltros((f) => ({ ...f, page: Math.min(data?.pages ?? 1, (f.page ?? 1) + 1) }))}
            disabled={!data?.has_next}
          >
            Siguiente →
          </Button>
        </div>
      )}

      {data && (
        <p className="text-xs text-gris-piedra dark:text-beige-arena/50 text-right">
          {data.total} registro{data.total !== 1 ? 's' : ''} encontrado{data.total !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
};

export default LogsPage;
