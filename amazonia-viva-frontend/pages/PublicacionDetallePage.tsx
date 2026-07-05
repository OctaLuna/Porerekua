import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { usePublicacion, useEliminarPublicacion } from '../hooks/usePublicaciones';
import { useAuth } from '../hooks/useAuth';
import { RoleEnum, type BloqueContenido } from '../types/api';
import Skeleton from '../components/ui/Skeleton';
import Button from '../components/ui/Button';

const BloqueRenderer: React.FC<{ bloque: BloqueContenido; idx: number }> = ({ bloque }) => {
  switch (bloque.tipo) {
    case 'subtitulo':
      return (
        <h2 className="text-xl md:text-2xl font-bold font-serif text-carbon dark:text-beige-arena mt-8 mb-3">
          {bloque.texto}
        </h2>
      );
    case 'parrafo':
      return (
        <p className="text-base text-carbon/90 dark:text-beige-arena/80 leading-relaxed mb-4">
          {bloque.texto}
        </p>
      );
    case 'imagen':
      return (
        <figure className="my-6">
          <img
            src={bloque.url}
            alt={bloque.descripcion ?? ''}
            className="w-full rounded-xl shadow-medium object-cover max-h-96"
          />
          {bloque.descripcion && (
            <figcaption className="text-xs text-gris-piedra dark:text-beige-arena/50 text-center mt-2">
              {bloque.descripcion}
            </figcaption>
          )}
        </figure>
      );
    default:
      return null;
  }
};

const PublicacionDetallePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: pub, isLoading, isError } = usePublicacion(slug ?? null);
  const { mutate: eliminar, isPending: eliminando } = useEliminarPublicacion();

  const esAutor = user && pub && user.id === pub.autorId;
  const esAdmin = user && (user.rol === RoleEnum.Admin || user.rol === RoleEnum.Superadmin);
  const puedeEditar = esAutor || esAdmin;

  const handleEliminar = () => {
    if (!pub) return;
    if (!confirm('¿Eliminar esta publicación? Esta acción no se puede deshacer.')) return;
    eliminar(pub.id, {
      onSuccess: () => navigate('/investigaciones'),
    });
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('es-BO', { year: 'numeric', month: 'long', day: 'numeric' });

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto pt-40 pb-12 px-4 space-y-4">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    );
  }

  if (isError || !pub) {
    return (
      <div className="max-w-3xl mx-auto pt-40 pb-12 px-4 text-center">
        <p className="text-red-500 mb-4">No se encontró la publicación.</p>
        <Link to="/investigaciones">
          <Button>← Volver al listado</Button>
        </Link>
      </div>
    );
  }

  return (
    <motion.article
      data-testid="publicacion-detalle"
      className="max-w-3xl mx-auto pt-40 pb-12 px-4"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Breadcrumb */}
      <nav className="text-sm text-gris-piedra dark:text-beige-arena/50 mb-6">
        <Link to="/investigaciones" className="hover:text-verde-brote transition-colors">
          Investigaciones
        </Link>
        <span className="mx-2">/</span>
        <span className="text-carbon dark:text-beige-arena">{pub.titulo}</span>
      </nav>

      {/* Título */}
      <h1 className="text-3xl md:text-4xl font-extrabold font-serif text-carbon dark:text-beige-arena mb-3">
        {pub.titulo}
      </h1>

      {/* Meta */}
      <div className="flex flex-wrap gap-4 text-sm text-gris-piedra dark:text-beige-arena/60 mb-6 pb-6 border-b border-carbon/10 dark:border-white/10">
        <span>Por <strong className="text-carbon dark:text-beige-arena">{pub.autor.nombre}</strong></span>
        {pub.fechaPublicacion && <span>{formatDate(pub.fechaPublicacion)}</span>}
        {pub.fechaUltimaEdicion && (
          <span className="italic">Editado: {formatDate(pub.fechaUltimaEdicion)}</span>
        )}
      </div>

      {/* Portada (primera imagen si existe) */}
      {pub.imagenes?.[0] && (
        <img
          src={pub.imagenes[0].url}
          alt={pub.imagenes[0].descripcion ?? pub.titulo}
          className="w-full rounded-xl shadow-medium mb-8 object-cover max-h-80"
        />
      )}

      {/* Contenido */}
      <div data-testid="contenido-publicacion">
        {pub.contenido.map((bloque, idx) => (
          <BloqueRenderer key={idx} bloque={bloque} idx={idx} />
        ))}
      </div>

      {/* Galería adicional */}
      {pub.imagenes.length > 1 && (
        <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-3">
          {pub.imagenes.slice(1).map((img) => (
            <img
              key={img.id}
              src={img.url}
              alt={img.descripcion ?? ''}
              className="w-full h-36 object-cover rounded-lg shadow-sm"
            />
          ))}
        </div>
      )}

      {/* Acciones admin/autor */}
      {puedeEditar && (
        <div className="mt-10 flex gap-3 pt-6 border-t border-carbon/10 dark:border-white/10">
          <Link to={`/investigaciones/${pub.id}/editar`} data-testid="btn-editar-publicacion">
            <Button>Editar</Button>
          </Link>
          <Button
            variant="danger"
            onClick={handleEliminar}
            disabled={eliminando}
            data-testid="btn-eliminar-publicacion"
          >
            {eliminando ? 'Eliminando…' : 'Eliminar'}
          </Button>
        </div>
      )}
    </motion.article>
  );
};

export default PublicacionDetallePage;
