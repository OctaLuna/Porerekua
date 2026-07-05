import React, { useState } from 'react';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';
import Modal from '../../components/admin/Modal';
import Reveal from '../../components/animations/Reveal';
import { useSolicitudes, useAprobarSolicitud, useRechazarSolicitud } from '../../hooks/useSolicitudes';
import { ApiError } from '../../services/apiClient';
import type { EstadoSolicitud, Solicitud } from '../../types/api';

const inputClass = "w-full px-3 py-2 rounded-lg bg-blanco-puro dark:bg-verde-hoja-seca border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-verde-brote focus:border-transparent transition-all";

const ESTADOS: { value: EstadoSolicitud | ''; label: string }[] = [
  { value: 'pendiente', label: 'Pendientes' },
  { value: 'aprobada', label: 'Aprobadas' },
  { value: 'rechazada', label: 'Rechazadas' },
  { value: '', label: 'Todas' },
];

const EstadoBadge: React.FC<{ estado: EstadoSolicitud }> = ({ estado }) => {
  const styles: Record<EstadoSolicitud, string> = {
    pendiente: 'bg-amber-500/15 text-amber-600 dark:text-amber-300',
    aprobada: 'bg-verde-brote/20 text-verde-brote',
    rechazada: 'bg-red-500/15 text-red-600 dark:text-red-300',
  };
  return <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize ${styles[estado]}`}>{estado}</span>;
};

const SolicitudesPage: React.FC = () => {
  const [estado, setEstado] = useState<EstadoSolicitud | ''>('pendiente');
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useSolicitudes({ page, limit: 10, estado: estado || undefined });

  const aprobar = useAprobarSolicitud();
  const rechazar = useRechazarSolicitud();

  const [aprobarTarget, setAprobarTarget] = useState<Solicitud | null>(null);
  const [rechazarTarget, setRechazarTarget] = useState<Solicitud | null>(null);
  const [fechaExp, setFechaExp] = useState('');
  const [passwordTemporal, setPasswordTemporal] = useState('');
  const [notaRechazo, setNotaRechazo] = useState('');
  const [error, setError] = useState<string | null>(null);

  const closeModals = () => {
    setAprobarTarget(null);
    setRechazarTarget(null);
    setFechaExp('');
    setPasswordTemporal('');
    setNotaRechazo('');
    setError(null);
  };

  const onAprobar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aprobarTarget) return;
    setError(null);
    try {
      await aprobar.mutateAsync({
        id: aprobarTarget.id,
        body: { fechaExpiracionAcceso: new Date(fechaExp).toISOString(), passwordTemporal },
      });
      closeModals();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo aprobar la solicitud.');
    }
  };

  const onRechazar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rechazarTarget) return;
    setError(null);
    try {
      await rechazar.mutateAsync({ id: rechazarTarget.id, body: { notaRechazo: notaRechazo || undefined } });
      closeModals();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo rechazar la solicitud.');
    }
  };

  const solicitudes = data?.data ?? [];

  return (
    <div className="bg-blanco-puro/95 dark:bg-noche-selva/60 backdrop-blur-md border border-carbon/10 dark:border-white/10 shadow-medium rounded-xl p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold font-serif text-carbon dark:text-beige-arena">Solicitudes de Acceso</h1>
        <select value={estado} onChange={(e) => { setEstado(e.target.value as EstadoSolicitud | ''); setPage(1); }} className={`${inputClass} sm:w-48`}>
          {ESTADOS.map((o) => <option key={o.label} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {isLoading && <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>}
      {isError && <p className="text-red-500 py-8 text-center">Error al cargar las solicitudes.</p>}

      {!isLoading && !isError && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gris-piedra dark:text-beige-arena/70 border-b border-carbon/10 dark:border-white/10">
                  <th className="py-2 pr-4 font-semibold">Solicitante</th>
                  <th className="py-2 pr-4 font-semibold">Institución</th>
                  <th className="py-2 pr-4 font-semibold">Estado</th>
                  <th className="py-2 pr-4 font-semibold">Fecha</th>
                  <th className="py-2 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <Reveal as="tbody" stagger={0.04} y={10} start="top 95%">
                {solicitudes.map((s) => (
                  <tr key={s.id} className="border-b border-carbon/5 dark:border-white/5 align-top">
                    <td className="py-3 pr-4">
                      <div className="font-medium text-carbon dark:text-beige-arena">{s.nombreSolicitante}</div>
                      <div className="text-gris-piedra dark:text-beige-arena/60">{s.emailSolicitante}</div>
                      <div className="text-xs text-gris-piedra dark:text-beige-arena/50 mt-1 max-w-md line-clamp-2" title={s.proposito}>{s.proposito}</div>
                    </td>
                    <td className="py-3 pr-4 text-carbon dark:text-beige-arena/90">{s.institucion}</td>
                    <td className="py-3 pr-4"><EstadoBadge estado={s.estado} /></td>
                    <td className="py-3 pr-4 text-gris-piedra dark:text-beige-arena/70 whitespace-nowrap">{new Date(s.createdAt).toLocaleDateString('es-BO')}</td>
                    <td className="py-3 text-right whitespace-nowrap">
                      {s.estado === 'pendiente' ? (
                        <div className="flex gap-2 justify-end">
                          <Button variant="primary" size="sm" onClick={() => { closeModals(); setAprobarTarget(s); }}>Aprobar</Button>
                          <Button variant="danger" size="sm" onClick={() => { closeModals(); setRechazarTarget(s); }}>Rechazar</Button>
                        </div>
                      ) : (
                        <span className="text-xs text-gris-piedra dark:text-beige-arena/50">{s.notaRechazo ? `Rechazada: ${s.notaRechazo}` : '—'}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </Reveal>
            </table>
            {solicitudes.length === 0 && <p className="text-center py-10 text-gris-piedra dark:text-beige-arena/60">No hay solicitudes.</p>}
          </div>

          {data && data.pages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <Button variant="outline" size="sm" disabled={!data.has_prev} onClick={() => setPage((p) => p - 1)}>Anterior</Button>
              <span className="text-sm text-gris-piedra dark:text-beige-arena/70">Página {data.page} de {data.pages}</span>
              <Button variant="outline" size="sm" disabled={!data.has_next} onClick={() => setPage((p) => p + 1)}>Siguiente</Button>
            </div>
          )}
        </>
      )}

      {aprobarTarget && (
        <Modal title={`Aprobar solicitud de ${aprobarTarget.nombreSolicitante}`} onClose={closeModals}>
          <form onSubmit={onAprobar} className="space-y-4">
            {error && <div role="alert" className="rounded-lg bg-red-500/10 border border-red-500/40 text-red-600 dark:text-red-300 text-sm px-3 py-2">{error}</div>}
            <div>
              <label className="block text-sm font-medium mb-1">Fecha de expiración del acceso</label>
              <input type="datetime-local" required value={fechaExp} onChange={(e) => setFechaExp(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Contraseña temporal</label>
              <input type="text" required minLength={8} value={passwordTemporal} onChange={(e) => setPasswordTemporal(e.target.value)} className={inputClass} placeholder="Mín. 8: mayúscula, número y símbolo" />
              <p className="text-xs text-gris-piedra dark:text-beige-arena/60 mt-1">Se le enviará al investigador para su primer ingreso.</p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={closeModals}>Cancelar</Button>
              <Button type="submit" disabled={aprobar.isPending}>{aprobar.isPending ? 'Aprobando…' : 'Aprobar'}</Button>
            </div>
          </form>
        </Modal>
      )}

      {rechazarTarget && (
        <Modal title={`Rechazar solicitud de ${rechazarTarget.nombreSolicitante}`} onClose={closeModals}>
          <form onSubmit={onRechazar} className="space-y-4">
            {error && <div role="alert" className="rounded-lg bg-red-500/10 border border-red-500/40 text-red-600 dark:text-red-300 text-sm px-3 py-2">{error}</div>}
            <div>
              <label className="block text-sm font-medium mb-1">Motivo del rechazo (opcional)</label>
              <textarea rows={4} maxLength={500} value={notaRechazo} onChange={(e) => setNotaRechazo(e.target.value)} className={inputClass} placeholder="Explica brevemente el motivo…" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={closeModals}>Cancelar</Button>
              <Button type="submit" variant="danger" disabled={rechazar.isPending}>{rechazar.isPending ? 'Rechazando…' : 'Rechazar'}</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default SolicitudesPage;
