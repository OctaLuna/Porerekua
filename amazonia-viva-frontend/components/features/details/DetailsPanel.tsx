import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useUI } from '../../../hooks/useUI';
import { useAuth } from '../../../hooks/useAuth';
import { useProyecto } from '../../../hooks/useProyectos';
import { useOrganizacion } from '../../../hooks/useOrganizaciones';
import { useEmpresa } from '../../../hooks/useEmpresas';
import type { DetailRef } from '../../../contexts/UIContext';
import type { ProyectoResumen, Ref } from '../../../types/api';
import Skeleton from '../../ui/Skeleton';
import Button from '../../ui/Button';

const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;

const joinDetalle = (...parts: Array<string | number | null | undefined>): string =>
  parts.filter((t): t is string | number => t !== null && t !== undefined && t !== '').join(' · ');

// ── Bloques reutilizables ────────────────────────────────────────────────────

const Chips: React.FC<{ title: string; items: Ref[] }> = ({ title, items }) =>
  items.length > 0 ? (
    <div className="mb-4">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-gris-piedra mb-2">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {items.map((i) => (
          <span key={i.id} className="bg-terracota/20 text-terracota dark:bg-terracota/30 dark:text-beige-arena text-xs font-semibold px-2.5 py-0.5 rounded-full">
            {i.nombre}
          </span>
        ))}
      </div>
    </div>
  ) : null;

const AssociatedProjects: React.FC<{ proyectos: ProyectoResumen[] }> = ({ proyectos }) => {
  const { openDetailPanel } = useUI();
  if (proyectos.length === 0) return <p className="text-gris-piedra text-sm">No hay proyectos asociados.</p>;
  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {proyectos.map((p) => (
        <button
          key={p.id}
          onClick={() => openDetailPanel({ kind: 'proyecto', id: p.id })}
          className="w-48 h-56 flex-shrink-0 group relative rounded-lg overflow-hidden shadow-md cursor-pointer bg-verde-hoja-seca text-left"
        >
          {p.imagenPrincipalUrl ? (
            <img src={p.imagenPrincipalUrl} alt={p.nombre} className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
          ) : (
            <div className="absolute inset-0 bg-verde-hoja-seca" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
            <h4 className="font-bold text-sm leading-tight line-clamp-3">{p.nombre}</h4>
          </div>
        </button>
      ))}
    </div>
  );
};

const PanelSkeleton: React.FC = () => (
  <div className="space-y-4">
    <Skeleton className="w-full h-48 rounded-lg" />
    <Skeleton className="h-8 w-2/3" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-5/6" />
    <Skeleton className="h-24 w-full" />
  </div>
);

const PanelMessage: React.FC<{ title: string; children?: React.ReactNode }> = ({ title, children }) => (
  <div className="text-center py-12">
    <h2 className="text-2xl font-bold font-serif text-carbon dark:text-beige-arena mb-3">{title}</h2>
    {children}
  </div>
);

// ── Vistas por entidad ───────────────────────────────────────────────────────

const ProyectoView: React.FC<{ id: number }> = ({ id }) => {
  const { data, isLoading, isError } = useProyecto(id);
  if (isLoading) return <PanelSkeleton />;
  if (isError || !data) return <PanelMessage title="No se pudo cargar el proyecto." />;
  return (
    <>
      <div className="relative w-full h-64 rounded-lg overflow-hidden mb-6 bg-verde-hoja-seca">
        {data.imagenPrincipalUrl && <img src={data.imagenPrincipalUrl} alt={data.nombre} className="absolute inset-0 w-full h-full object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-t from-carbon/70 to-transparent" />
      </div>
      <h2 className="text-3xl font-bold font-serif text-carbon dark:text-beige-arena mb-2">{data.nombre}</h2>
      <p className="text-sm text-gris-piedra mb-4">{joinDetalle(data.area?.nombre, data.tipo?.nombre, data.department, data.municipality, data.anioInicio ?? undefined)}</p>
      {data.descripcion && <p className="text-gris-piedra dark:text-beige-arena/80 mb-6">{data.descripcion}</p>}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-4">
        <Chips title="Tipos de ayuda" items={data.ayudas} />
        <Chips title="Actores municipales" items={data.actoresMunicipales} />
        <Chips title="Especies animales" items={data.especiesAnimales} />
        <Chips title="Prácticas agrícolas" items={data.practicasAgricolas} />
      </div>
    </>
  );
};

const OrganizacionView: React.FC<{ id: number }> = ({ id }) => {
  const { data, isLoading, isError } = useOrganizacion(id);
  if (isLoading) return <PanelSkeleton />;
  if (isError || !data) return <PanelMessage title="No se pudo cargar la organización." />;
  const proyectos = data.proyectosOrganizaciones.map((p) => p.proyecto);
  return (
    <>
      <div className="flex items-center gap-6 mb-6">
        {data.logoUrl ? (
          <img src={data.logoUrl} alt={data.nombre} className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-verde-hoja-seca" />
        ) : (
          <div className="w-24 h-24 rounded-full border-4 border-white dark:border-verde-hoja-seca bg-verde-hoja-seca/50 flex items-center justify-center text-3xl font-bold font-serif text-beige-arena">{data.nombre.charAt(0).toUpperCase()}</div>
        )}
        <div>
          <h2 className="text-3xl font-bold font-serif text-carbon dark:text-beige-arena">{data.nombre}</h2>
          <p className="text-sm text-gris-piedra mt-1">{joinDetalle(data.tipo?.nombre, data.departamento?.nombre, data.esNacional ? 'Nacional' : 'Internacional', data.anioInicioTrabajo ?? undefined)}</p>
        </div>
      </div>
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-gris-piedra mb-4">Proyectos Asociados ({proyectos.length})</h3>
        <AssociatedProjects proyectos={proyectos} />
      </div>
    </>
  );
};

const EmpresaView: React.FC<{ id: number }> = ({ id }) => {
  const { data, isLoading, isError } = useEmpresa(id);
  if (isLoading) return <PanelSkeleton />;
  if (isError || !data) return <PanelMessage title="No se pudo cargar la empresa." />;
  const proyectos = data.proyectosEmpresas.map((p) => p.proyecto);
  return (
    <>
      <div className="flex items-center gap-6 mb-6">
        {data.logoUrl ? (
          <img src={data.logoUrl} alt={data.nombre} className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-verde-hoja-seca" />
        ) : (
          <div className="w-24 h-24 rounded-full border-4 border-white dark:border-verde-hoja-seca bg-verde-hoja-seca/50 flex items-center justify-center text-3xl font-bold font-serif text-beige-arena">{data.nombre.charAt(0).toUpperCase()}</div>
        )}
        <div>
          <h2 className="text-3xl font-bold font-serif text-carbon dark:text-beige-arena">{data.nombre}</h2>
          <p className="text-sm text-gris-piedra mt-1">{joinDetalle(data.formaJuridica?.nombre, data.anioInicioApoyo ?? undefined)}</p>
        </div>
      </div>
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-4">
        <Chips title="Departamentos" items={data.departamentos} />
        <Chips title="Motivos" items={data.motivos} />
        <Chips title="Apoyos" items={data.apoyos} />
        <Chips title="ODS" items={data.ods} />
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gris-piedra mb-4">Proyectos Asociados ({proyectos.length})</h3>
          <AssociatedProjects proyectos={proyectos} />
        </div>
      </div>
    </>
  );
};

const LoginPrompt: React.FC = () => {
  const { openLoginPanel } = useUI();
  return (
    <PanelMessage title="Inicia sesión para ver el detalle">
      <p className="text-gris-piedra dark:text-beige-arena/80 mb-6">
        El detalle completo de proyectos, organizaciones y empresas está disponible solo para usuarios autenticados.
      </p>
      <Button onClick={openLoginPanel}>Iniciar sesión</Button>
    </PanelMessage>
  );
};

const DetailContent: React.FC<{ detailRef: DetailRef }> = ({ detailRef }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <LoginPrompt />;
  switch (detailRef.kind) {
    case 'proyecto':
      return <ProyectoView id={detailRef.id} />;
    case 'organizacion':
      return <OrganizacionView id={detailRef.id} />;
    case 'empresa':
      return <EmpresaView id={detailRef.id} />;
  }
};

const DetailsPanel: React.FC = () => {
  const { closeDetailPanel, detailRef } = useUI();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeDetailPanel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeDetailPanel]);

  if (!detailRef) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onClick={closeDetailPanel}
      className="fixed inset-0 bg-carbon/60 backdrop-blur-sm z-[100] flex justify-end"
      aria-modal="true"
      role="dialog"
    >
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-fibra-natural dark:bg-carbon shadow-2xl w-full max-w-lg h-full relative"
      >
        <div className="p-6 h-full overflow-y-auto">
          <button
            onClick={closeDetailPanel}
            className="absolute top-4 right-4 text-gris-piedra hover:text-carbon dark:hover:text-beige-arena transition-colors z-10"
            aria-label="Cerrar panel de detalles"
          >
            <XIcon />
          </button>
          <div className="pt-10">
            <DetailContent detailRef={detailRef} />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DetailsPanel;
