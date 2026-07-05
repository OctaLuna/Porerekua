import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Navigate } from 'react-router-dom';
import { useCrearPublicacion, useEditarPublicacion, usePublicacion, useSubirImagenPublicacion } from '../../hooks/usePublicaciones';
import { useAuth } from '../../hooks/useAuth';
import { RoleEnum, type BloqueContenido } from '../../types/api';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

const UploadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" />
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
  </svg>
);

const PublicacionEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: existing, isLoading: loadingExisting } = usePublicacion(
    isEditing ? (id as string) : null
  );
  const { mutate: crear, isPending: creando, error: errorCrear } = useCrearPublicacion();
  const { mutate: editar, isPending: editando, error: errorEditar } = useEditarPublicacion();
  const { mutate: subirImg, isPending: subiendoImg } = useSubirImagenPublicacion();

  const [titulo, setTitulo] = useState('');
  const [estado, setEstado] = useState<'borrador' | 'publicado'>('borrador');
  const [bloques, setBloques] = useState<BloqueContenido[]>([{ tipo: 'parrafo', texto: '' }]);
  const [publicacionId, setPublicacionId] = useState<string | null>(null);

  useEffect(() => {
    if (existing) {
      setTitulo(existing.titulo);
      setEstado(existing.estado);
      setBloques(existing.contenido.length > 0 ? existing.contenido : [{ tipo: 'parrafo', texto: '' }]);
      setPublicacionId(existing.id);
    }
  }, [existing]);

  if (!user) return <Navigate to="/" replace />;
  const puedeEditar = user.rol === RoleEnum.Investigador ||
    user.rol === RoleEnum.Admin ||
    user.rol === RoleEnum.Superadmin;
  if (!puedeEditar) return <Navigate to="/investigaciones" replace />;

  if (isEditing && loadingExisting) {
    return (
      <div className="max-w-3xl mx-auto py-10 space-y-4">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const addBloque = (tipo: BloqueContenido['tipo']) => {
    setBloques((prev) => [...prev, tipo === 'imagen' ? { tipo, url: '' } : { tipo, texto: '' }]);
  };

  const updateBloque = (idx: number, partial: Partial<BloqueContenido>) => {
    setBloques((prev) => prev.map((b, i) => (i === idx ? { ...b, ...partial } : b)));
  };

  const removeBloque = (idx: number) => {
    setBloques((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleImageUpload = (idx: number, file: File) => {
    if (!publicacionId) {
      alert('Guarda la publicación primero antes de subir imágenes.');
      return;
    }
    subirImg(
      { id: publicacionId, file },
      {
        onSuccess: (img) => {
          updateBloque(idx, { tipo: 'imagen', url: img.url });
        },
      }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dto = { titulo, contenido: bloques, estado };
    if (isEditing && id) {
      editar({ id, dto }, { onSuccess: () => navigate('/mis-publicaciones') });
    } else {
      crear(dto, {
        onSuccess: (pub) => {
          setPublicacionId(pub.id);
          navigate('/mis-publicaciones');
        },
      });
    }
  };

  const isPending = creando || editando;
  const error = errorCrear || errorEditar;

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold font-serif text-carbon dark:text-beige-arena mb-6">
        {isEditing ? 'Editar publicación' : 'Nueva publicación'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Título */}
        <div>
          <label className="block text-sm font-medium text-carbon dark:text-beige-arena mb-1">
            Título *
          </label>
          <input
            required
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            data-testid="input-titulo-publicacion"
            placeholder="Título de la publicación"
            className="w-full px-4 py-2.5 rounded-lg bg-blanco-puro/95 dark:bg-noche-selva/60 border border-carbon/10 dark:border-white/10 focus:ring-2 focus:ring-verde-brote focus:border-transparent transition-all text-carbon dark:text-beige-arena"
          />
        </div>

        {/* Estado */}
        <div className="flex gap-4 items-center">
          <span className="text-sm font-medium text-carbon dark:text-beige-arena">Estado:</span>
          {(['borrador', 'publicado'] as const).map((s) => (
            <label key={s} className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="radio"
                name="estado"
                value={s}
                checked={estado === s}
                onChange={() => setEstado(s)}
                data-testid={`radio-estado-${s}`}
                className="accent-verde-brote"
              />
              <span className="capitalize text-carbon dark:text-beige-arena">{s}</span>
            </label>
          ))}
        </div>

        {/* Bloques de contenido */}
        <div>
          <label className="block text-sm font-medium text-carbon dark:text-beige-arena mb-2">
            Contenido
          </label>
          <div className="space-y-3">
            {bloques.map((bloque, idx) => (
              <div
                key={idx}
                className="relative bg-blanco-puro/80 dark:bg-noche-selva/40 rounded-xl border border-carbon/10 dark:border-white/10 p-4"
                data-testid={`bloque-${idx}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-mono bg-carbon/10 dark:bg-white/10 px-2 py-0.5 rounded text-gris-piedra dark:text-beige-arena/60">
                    {bloque.tipo}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeBloque(idx)}
                    className="ml-auto text-red-400 hover:text-red-600 transition-colors"
                    title="Eliminar bloque"
                  >
                    <TrashIcon />
                  </button>
                </div>

                {bloque.tipo === 'subtitulo' && (
                  <input
                    value={bloque.texto ?? ''}
                    onChange={(e) => updateBloque(idx, { texto: e.target.value })}
                    placeholder="Subtítulo..."
                    data-testid={`input-subtitulo-${idx}`}
                    className="w-full px-3 py-2 rounded-lg bg-transparent border border-carbon/10 dark:border-white/10 text-lg font-bold text-carbon dark:text-beige-arena focus:ring-2 focus:ring-verde-brote focus:outline-none"
                  />
                )}

                {bloque.tipo === 'parrafo' && (
                  <textarea
                    value={bloque.texto ?? ''}
                    onChange={(e) => updateBloque(idx, { texto: e.target.value })}
                    rows={4}
                    placeholder="Escribe el párrafo aquí..."
                    data-testid={`textarea-parrafo-${idx}`}
                    className="w-full px-3 py-2 rounded-lg bg-transparent border border-carbon/10 dark:border-white/10 text-carbon dark:text-beige-arena/90 focus:ring-2 focus:ring-verde-brote focus:outline-none resize-y"
                  />
                )}

                {bloque.tipo === 'imagen' && (
                  <div className="space-y-2">
                    {bloque.url ? (
                      <img src={bloque.url} alt={bloque.descripcion ?? ''} className="w-full rounded-lg max-h-48 object-cover" />
                    ) : (
                      <div className="border-2 border-dashed border-carbon/20 dark:border-white/20 rounded-lg p-6 text-center">
                        <label className="cursor-pointer flex flex-col items-center gap-2 text-gris-piedra dark:text-beige-arena/50">
                          <UploadIcon />
                          <span className="text-sm">
                            {subiendoImg ? 'Subiendo...' : publicacionId ? 'Seleccionar imagen' : 'Guarda primero para subir imágenes'}
                          </span>
                          {publicacionId && (
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) handleImageUpload(idx, f);
                              }}
                            />
                          )}
                        </label>
                      </div>
                    )}
                    <input
                      value={bloque.descripcion ?? ''}
                      onChange={(e) => updateBloque(idx, { descripcion: e.target.value })}
                      placeholder="Descripción de la imagen (alt text)"
                      className="w-full px-3 py-1.5 rounded-lg bg-transparent border border-carbon/10 dark:border-white/10 text-sm text-carbon dark:text-beige-arena/80 focus:ring-2 focus:ring-verde-brote focus:outline-none"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Agregar bloque */}
          <div className="flex gap-2 mt-3">
            <span className="text-xs text-gris-piedra dark:text-beige-arena/50 self-center">Agregar:</span>
            {(['subtitulo', 'parrafo', 'imagen'] as const).map((tipo) => (
              <Button
                key={tipo}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addBloque(tipo)}
                data-testid={`btn-add-bloque-${tipo}`}
                className="capitalize"
              >
                <PlusIcon /> {tipo}
              </Button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-500 text-sm bg-red-500/10 rounded-lg px-4 py-2">
            {error.message}
          </p>
        )}

        {/* Acciones */}
        <div className="flex gap-3 pt-2">
          <Button
            type="submit"
            disabled={isPending}
            data-testid="btn-guardar-publicacion"
          >
            {isPending ? 'Guardando…' : isEditing ? 'Guardar cambios' : 'Crear publicación'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate('/mis-publicaciones')}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PublicacionEditorPage;
