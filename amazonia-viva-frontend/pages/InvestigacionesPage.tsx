import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { usePublicaciones } from '../hooks/usePublicaciones';
import { useAuth } from '../hooks/useAuth';
import { RoleEnum } from '../types/api';
import Skeleton from '../components/ui/Skeleton';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useUI } from '../hooks/useUI';

const CalendarIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);

const UserIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const PlusIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const SearchIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const InvestigacionesPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { user } = useAuth();
  const { openRegistrationPanel } = useUI();

  const { data, isLoading, isError } = usePublicaciones({
    page,
    limit: 9,
    ...(search ? { search } : {}),
  });

  const pubs = data?.data ?? [];
  const totalPages = data?.pages ?? 1;
  const isInvestigador = user?.rol === RoleEnum.Investigador;
  const isAdmin = user && (user.rol === RoleEnum.Admin || user.rol === RoleEnum.Superadmin);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('es-BO', { year: 'numeric', month: 'long', day: 'numeric' });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat filter blur-[6px] saturate-90 brightness-[0.75] scale-105"
        style={{ backgroundImage: 'url(/images/background/bgInv.jpg)' }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-noche-selva/35" aria-hidden="true" />
      <div className="relative z-10 container mx-auto mt-40 mb-12 px-4 sm:px-6 lg:px-8 pt-12 pb-12 space-y-8 rounded-2xl border border-white/40 dark:border-beige-arena/10 bg-beige-arena/80 dark:bg-noche-selva/55 backdrop-blur-md shadow-medium">

        <div className="space-y-2">
          {/* Header */}
          <div className="flex flex-col items-center gap-4 text-center">
            <div>
              <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.25em] text-terracota mb-2">Conocimiento para la Amazonía</p>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold font-serif text-carbon dark:text-beige-arena mt-1 mb-3">
                Investigaciones y Publicaciones
              </h1>
              <p className="text-sm sm:text-base leading-relaxed text-gris-piedra dark:text-beige-arena/80">
                {data ? `${data.total} publicación${data.total !== 1 ? 'es' : ''}` : ''}
              </p>
            </div>
            <div className="flex justify-center gap-2 flex-wrap">
              {isInvestigador && (
                <Link to="/investigaciones/nueva" data-testid="btn-nueva-publicacion">
                  <Button className="flex items-center gap-2">
                    <PlusIcon /> Nueva publicación
                  </Button>
                </Link>
              )}
              {isInvestigador && (
                <Link to="/mis-publicaciones">
                  <Button variant="secondary">Mis publicaciones</Button>
                </Link>
              )}
              {isAdmin && (
                <Link to="/mis-publicaciones">
                  <Button variant="neutral">Gestionar publicaciones</Button>
                </Link>
              )}
            </div>
          </div>

          {/* Búsqueda */}
          <form onSubmit={handleSearch} className="relative mx-auto w-full max-w-xl">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por título..."
              data-testid="input-busqueda-publicaciones"
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-blanco-puro/95 dark:bg-noche-selva/60 text-sm sm:text-base text-carbon dark:text-beige-arena placeholder:text-gris-piedra/70 dark:placeholder:text-beige-arena/50 backdrop-blur-md border border-carbon/10 dark:border-white/10 focus:ring-2 focus:ring-azul-cobalto focus:border-transparent transition-all"
            />
          </form>
        </div>

        {/* Grid de publicaciones */}
        {isError && (
          <p className="text-red-400 bg-red-900/20 rounded-lg px-4 py-3">
            Error al cargar las publicaciones. Inténtalo de nuevo.
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-grow">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="flex h-full flex-col bg-blanco-puro/95 dark:bg-noche-selva/60 rounded-xl overflow-hidden">
                  <Skeleton className="w-full h-44 shrink-0" />
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </Card>
              ))
            : pubs.map((pub) => (
                <motion.div
                  key={pub.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="h-full"
                >
                  <Link
                    to={`/investigaciones/${pub.slug}`}
                    data-testid={`pub-card-${pub.slug}`}
                    className="block h-full"
                  >
                    <Card className="flex h-full flex-col bg-blanco-puro/95 dark:bg-noche-selva/60 backdrop-blur-md border border-carbon/10 dark:border-white/10 shadow-medium rounded-xl overflow-hidden group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer motion-reduce:transform-none">
                      {pub.imagenes?.[0] ? (
                        <img
                          src={pub.imagenes[0].url}
                          alt={pub.imagenes[0].descripcion ?? pub.titulo}
                          className="w-full h-44 shrink-0 object-cover group-hover:scale-105 transition-transform duration-500 motion-reduce:transform-none"
                        />
                      ) : (
                        <div className="w-full h-44 shrink-0 bg-verde-brote/10 flex items-center justify-center">
                          <span className="text-verde-brote/40 text-4xl">🌿</span>
                        </div>
                      )}
                      <div className="flex flex-1 flex-col p-4 gap-2">
                        <h2 className="font-serif font-bold text-base sm:text-lg leading-snug text-carbon dark:text-beige-arena line-clamp-2 min-h-[2.75rem] group-hover:text-verde-brote transition-colors">
                          {pub.titulo}
                        </h2>
                        <div className="mt-auto space-y-1 pt-2">
                          <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gris-piedra dark:text-beige-arena/60 min-w-0">
                            <UserIcon className="shrink-0" />
                            <span className="truncate">{pub.autor.nombre}</span>
                          </div>
                          {pub.fechaPublicacion && (
                            <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gris-piedra dark:text-beige-arena/60">
                              <CalendarIcon className="shrink-0" />
                              <span className="truncate">{formatDate(pub.fechaPublicacion)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))}

          {!isLoading && pubs.length === 0 && (
            <div className="col-span-full text-center py-16">
              <p className="text-sm sm:text-base leading-relaxed text-gris-piedra dark:text-beige-arena/80">No se encontraron publicaciones.</p>
            </div>
          )}
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={!data?.has_prev}
              className="bg-blanco-puro/80 dark:bg-noche-selva/60"
            >
              ← Anterior
            </Button>
            <span className="px-4 py-2 text-sm text-carbon dark:text-beige-arena">
              Página {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={!data?.has_next}
              className="bg-blanco-puro/80 dark:bg-noche-selva/60"
            >
              Siguiente →
            </Button>
          </div>
        )}

        {/* Footer link */}
        {!user && (
          <div className="text-center pt-4">
            <button
              onClick={openRegistrationPanel}
              className="text-sm text-terracota hover:underline focus:outline-none focus:ring-2 focus:ring-terracota/50 rounded-sm"
            >
              ¿Eres Investigador? Solicitar acceso completo
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvestigacionesPage;
