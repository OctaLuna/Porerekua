import React, { useState } from 'react';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';
import Modal from '../../components/admin/Modal';
import Reveal from '../../components/animations/Reveal';
import { useAuth } from '../../hooks/useAuth';
import { useUsuarios, useCrearUsuario, useActualizarUsuario, useEliminarUsuario } from '../../hooks/useUsuarios';
import { ApiError } from '../../services/apiClient';
import { RoleEnum, type Usuario } from '../../types/api';

const inputClass = "w-full px-3 py-2 rounded-lg bg-blanco-puro dark:bg-verde-hoja-seca border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-verde-brote focus:border-transparent transition-all";

const ROL_LABEL: Record<RoleEnum, string> = {
  [RoleEnum.Superadmin]: 'Superadmin',
  [RoleEnum.Admin]: 'Admin',
  [RoleEnum.Investigador]: 'Investigador',
};

const RolBadge: React.FC<{ rol: RoleEnum }> = ({ rol }) => (
  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-azul-cobalto/15 text-azul-cobalto dark:text-blue-300">{ROL_LABEL[rol] ?? rol}</span>
);

const UsuariosPage: React.FC = () => {
  const { user: current } = useAuth();
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useUsuarios({ page, limit: 10 });

  const crear = useCrearUsuario();
  const actualizar = useActualizarUsuario();
  const eliminar = useEliminarUsuario();

  const [showCrear, setShowCrear] = useState(false);
  const [editTarget, setEditTarget] = useState<Usuario | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Usuario | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form crear
  const [form, setForm] = useState({ email: '', nombre: '', password: '', rol: RoleEnum.Admin });
  // Form editar
  const [editForm, setEditForm] = useState({ nombre: '', rol: RoleEnum.Admin, activo: true });

  const closeModals = () => {
    setShowCrear(false);
    setEditTarget(null);
    setDeleteTarget(null);
    setError(null);
    setForm({ email: '', nombre: '', password: '', rol: RoleEnum.Admin });
  };

  const openEdit = (u: Usuario) => {
    setError(null);
    setEditForm({ nombre: u.nombre, rol: u.rol, activo: u.activo });
    setEditTarget(u);
  };

  const handleError = (err: unknown, fallback: string) =>
    setError(err instanceof ApiError ? err.message : fallback);

  const onCrear = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await crear.mutateAsync(form);
      closeModals();
    } catch (err) {
      handleError(err, 'No se pudo crear el usuario.');
    }
  };

  const onEditar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;
    setError(null);
    try {
      await actualizar.mutateAsync({ id: editTarget.id, body: editForm });
      closeModals();
    } catch (err) {
      handleError(err, 'No se pudo actualizar el usuario.');
    }
  };

  const onEliminar = async () => {
    if (!deleteTarget) return;
    setError(null);
    try {
      await eliminar.mutateAsync(deleteTarget.id);
      closeModals();
    } catch (err) {
      handleError(err, 'No se pudo eliminar el usuario.');
    }
  };

  const usuarios = data?.data ?? [];

  return (
    <div className="bg-blanco-puro/95 dark:bg-noche-selva/60 backdrop-blur-md border border-carbon/10 dark:border-white/10 shadow-medium rounded-xl p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold font-serif text-carbon dark:text-beige-arena">Usuarios</h1>
        <Button onClick={() => { closeModals(); setShowCrear(true); }}>+ Nuevo usuario</Button>
      </div>

      {isLoading && <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>}
      {isError && <p className="text-red-500 py-8 text-center">Error al cargar los usuarios.</p>}

      {!isLoading && !isError && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gris-piedra dark:text-beige-arena/70 border-b border-carbon/10 dark:border-white/10">
                  <th className="py-2 pr-4 font-semibold">Nombre</th>
                  <th className="py-2 pr-4 font-semibold">Email</th>
                  <th className="py-2 pr-4 font-semibold">Rol</th>
                  <th className="py-2 pr-4 font-semibold">Estado</th>
                  <th className="py-2 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <Reveal as="tbody" stagger={0.04} y={10} start="top 95%">
                {usuarios.map((u) => (
                  <tr key={u.id} className="border-b border-carbon/5 dark:border-white/5">
                    <td className="py-3 pr-4 font-medium text-carbon dark:text-beige-arena">{u.nombre}</td>
                    <td className="py-3 pr-4 text-gris-piedra dark:text-beige-arena/80">{u.email}</td>
                    <td className="py-3 pr-4"><RolBadge rol={u.rol} /></td>
                    <td className="py-3 pr-4">
                      <span className={`text-xs font-semibold ${u.activo ? 'text-verde-brote' : 'text-gris-piedra dark:text-beige-arena/50'}`}>{u.activo ? 'Activo' : 'Inactivo'}</span>
                    </td>
                    <td className="py-3 text-right whitespace-nowrap">
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" size="sm" onClick={() => openEdit(u)}>Editar</Button>
                        {current?.id !== u.id && (
                          <Button variant="danger" size="sm" onClick={() => { closeModals(); setDeleteTarget(u); }}>Eliminar</Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </Reveal>
            </table>
            {usuarios.length === 0 && <p className="text-center py-10 text-gris-piedra dark:text-beige-arena/60">No hay usuarios.</p>}
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

      {showCrear && (
        <Modal title="Nuevo usuario" onClose={closeModals}>
          <form onSubmit={onCrear} className="space-y-4">
            {error && <div role="alert" className="rounded-lg bg-red-500/10 border border-red-500/40 text-red-600 dark:text-red-300 text-sm px-3 py-2">{error}</div>}
            <div>
              <label className="block text-sm font-medium mb-1">Nombre</label>
              <input type="text" required minLength={2} value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Contraseña</label>
              <input type="text" required minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={inputClass} placeholder="Mín. 8: mayúscula, número y símbolo" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Rol</label>
              <select value={form.rol} onChange={(e) => setForm({ ...form, rol: Number(e.target.value) as RoleEnum })} className={inputClass}>
                <option value={RoleEnum.Admin}>Admin</option>
                <option value={RoleEnum.Investigador}>Investigador</option>
                <option value={RoleEnum.Superadmin}>Superadmin</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={closeModals}>Cancelar</Button>
              <Button type="submit" disabled={crear.isPending}>{crear.isPending ? 'Creando…' : 'Crear'}</Button>
            </div>
          </form>
        </Modal>
      )}

      {editTarget && (
        <Modal title={`Editar ${editTarget.nombre}`} onClose={closeModals}>
          <form onSubmit={onEditar} className="space-y-4">
            {error && <div role="alert" className="rounded-lg bg-red-500/10 border border-red-500/40 text-red-600 dark:text-red-300 text-sm px-3 py-2">{error}</div>}
            <div>
              <label className="block text-sm font-medium mb-1">Nombre</label>
              <input type="text" required minLength={2} value={editForm.nombre} onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Rol</label>
              <select value={editForm.rol} onChange={(e) => setEditForm({ ...editForm, rol: Number(e.target.value) as RoleEnum })} className={inputClass}>
                <option value={RoleEnum.Admin}>Admin</option>
                <option value={RoleEnum.Investigador}>Investigador</option>
                <option value={RoleEnum.Superadmin}>Superadmin</option>
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={editForm.activo} onChange={(e) => setEditForm({ ...editForm, activo: e.target.checked })} className="rounded" />
              Usuario activo
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={closeModals}>Cancelar</Button>
              <Button type="submit" disabled={actualizar.isPending}>{actualizar.isPending ? 'Guardando…' : 'Guardar'}</Button>
            </div>
          </form>
        </Modal>
      )}

      {deleteTarget && (
        <Modal title="Eliminar usuario" onClose={closeModals}>
          {error && <div role="alert" className="rounded-lg bg-red-500/10 border border-red-500/40 text-red-600 dark:text-red-300 text-sm px-3 py-2 mb-4">{error}</div>}
          <p className="text-sm text-gris-piedra dark:text-beige-arena/80 mb-6">¿Seguro que deseas eliminar a <strong>{deleteTarget.nombre}</strong> ({deleteTarget.email})?</p>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={closeModals} className="px-4 py-2 rounded-lg text-sm border border-carbon/10 dark:border-white/10">Cancelar</button>
            <Button variant="danger" onClick={onEliminar} disabled={eliminar.isPending}>{eliminar.isPending ? 'Eliminando…' : 'Eliminar'}</Button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default UsuariosPage;
