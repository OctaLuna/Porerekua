import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { usePublicacionesMias, useEliminarPublicacion } from '../../hooks/usePublicaciones';
import { useAuth } from '../../hooks/useAuth';
import { RoleEnum } from '../../types/api';
import Skeleton from '../../components/ui/Skeleton';
import Button from '../../components/ui/Button';

const MisPublicacionesPage: React.FC = () => {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [estadoFiltro, setEstadoFiltro] = useState<'borrador' | 'publicado' | ''>('');

  const { data, isLoading } = usePublicacionesMias({
    page,
    limit: 10,
    ...(estadoFiltro ? { estado: estadoFiltro } : {}),
  });
  const { mutate: eliminar } = useEliminarPublicacion();

  if (!user) return <Navigate to="/" replace />;
  if (user.rol !== RoleEnum.Investigador && user.rol !== RoleEnum.Admin && user.rol !== RoleEnum.Superadmin) {
    return <Navigate to="/" replace />;
  }

  const pubs = data?.data ?? [];

  const handleEliminar = (id: string, titulo: string) => {
    if (!confirm(`¿Eliminar "${titulo}"? Esta acción no se puede deshacer.`)) return;
    eliminar(id);
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('es-BO', { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold font-serif text-carbon dark:text-beige-arena">
          Mis publicaciones
        </h1>
        {user.rol === RoleEnum.Investigador && (
          <Link to="/investigaciones/nueva" data-testid="btn-nueva-mis-publicaciones">
            <Button>+ Nueva publicación</Button>
          </Link>
        )}
      </div>

      {/* Filtro */}
      <div className="flex flex-wrap gap-2">
        {(['', 'publicado', 'borrador'] as const).map((estado) => (
          <Button
            key={estado}
            size="sm"
            variant={estadoFiltro === estado ? 'primary' : 'outline'}
            onClick={() => { setEstadoFiltro(estado); setPage(1); }}
          >
            {estado === '' ? 'Todas' : estado.charAt(0).toUpperCase() + estado.slice(1)}
          </Button>
        ))}
      </div>

      {/* Lista */}
      <div className="space-y-3">
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-blanco-puro/80 dark:bg-noche-selva/40 rounded-xl p-4">
                <Skeleton className="h-5 w-2/3 mb-2" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            ))
          : pubs.map((pub) => (
              <motion.div
                key={pub.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-blanco-puro/95 dark:bg-noche-selva/60 backdrop-blur-md border border-carbon/10 dark:border-white/10 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex-grow min-w-0">
                  <Link
                    to={`/investigaciones/${pub.slug}`}
                    className="font-semibold text-carbon dark:text-beige-arena hover:text-verde-brote transition-colors line-clamp-1"
                  >
                    {pub.titulo}
                  </Link>
                  <div className="flex gap-3 mt-1 text-xs text-gris-piedra dark:text-beige-arena/50">
                    <span
                      className={`px-2 py-0.5 rounded-full font-medium ${
                        pub.estado === 'publicado'
                          ? 'bg-verde-brote/15 text-verde-brote'
                          : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                      }`}
                      data-testid={`estado-${pub.id}`}
                    >
                      {pub.estado}
                    </span>
                    <span>{formatDate(pub.fechaCreacion)}</span>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Link to={`/investigaciones/${pub.id}/editar`}>
                    <Button variant="outline" size="sm" data-testid={`btn-editar-${pub.id}`}>
                      Editar
                    </Button>
                  </Link>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleEliminar(pub.id, pub.titulo)}
                    data-testid={`btn-eliminar-${pub.id}`}
                  >
                    Eliminar
                  </Button>
                </div>
              </motion.div>
            ))}

        {!isLoading && pubs.length === 0 && (
          <div className="text-center py-12 text-gris-piedra dark:text-beige-arena/60">
            <p className="text-lg">No tienes publicaciones aún.</p>
            {user.rol === RoleEnum.Investigador && (
              <Link to="/investigaciones/nueva" className="mt-4 inline-block text-verde-brote hover:underline">
                Crear tu primera publicación
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Paginación */}
      {(data?.pages ?? 1) > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={!data?.has_prev}
          >
            ← Anterior
          </Button>
          <span className="px-4 py-2 text-sm">
            {page} / {data?.pages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.min(data?.pages ?? 1, p + 1))}
            disabled={!data?.has_next}
          >
            Siguiente →
          </Button>
        </div>
      )}
    </div>
  );
};

export default MisPublicacionesPage;
