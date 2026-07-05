import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useUI } from '../../../hooks/useUI';
import { useAuth } from '../../../hooks/useAuth';
import { useProyecto } from '../../../hooks/useProyectos';
import { useOrganizacion } from '../../../hooks/useOrganizaciones';
import { useEmpresa } from '../../../hooks/useEmpresas';
import type { DetailRef } from '../../../contexts/UIContext';
import type { Ref } from '../../../types/api';
import Skeleton from '../../ui/Skeleton';
import Button from '../../ui/Button';

// ── Icons ────────────────────────────────────────────────────────────────────
const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const MapPinIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);
const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const BuildingIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><path d="M9 9h6M9 12h6M9 15h6"/>
  </svg>
);

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtYear = (y: string | number | null | undefined) => (y ? String(y) : null);
const fmtDate = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleDateString('es-BO', { year: 'numeric', month: 'short' }) : null;

// ── Reutilizables ─────────────────────────────────────────────────────────────
const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-5">
    <h3 className="text-xs font-bold uppercase tracking-widest text-gris-piedra dark:text-beige-arena/50 mb-2 pb-1 border-b border-carbon/10 dark:border-white/10">
      {title}
    </h3>
    {children}
  </div>
);

const Chips: React.FC<{ items: Ref[]; color?: string }> = ({ items, color = 'terracota' }) =>
  items.length > 0 ? (
    <div className="flex flex-wrap gap-1.5">
      {items.map((i) => (
        <span
          key={i.id}
          className={`text-xs font-medium px-2.5 py-0.5 rounded-full bg-${color}/15 text-${color} dark:bg-${color}/20 dark:text-beige-arena`}
        >
          {i.nombre}
        </span>
      ))}
    </div>
  ) : <p className="text-xs text-gris-piedra dark:text-beige-arena/50 italic">Sin datos</p>;

const MetaRow: React.FC<{ icon?: React.ReactNode; label: string; value: string | null | undefined }> = ({ icon, label, value }) =>
  value ? (
    <div className="flex items-start gap-2 text-sm mb-1.5">
      {icon && <span className="text-verde-brote mt-0.5 shrink-0">{icon}</span>}
      <span className="text-gris-piedra dark:text-beige-arena/60 shrink-0">{label}:</span>
      <span className="text-carbon dark:text-beige-arena font-medium">{value}</span>
    </div>
  ) : null;

const PanelSkeleton: React.FC = () => (
  <div className="space-y-4 animate-pulse">
    <Skeleton className="w-full h-52 rounded-lg" />
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

// Tab component for organized sections
const Tabs: React.FC<{ tabs: { label: string; content: React.ReactNode }[] }> = ({ tabs }) => {
  const [active, setActive] = useState(0);
  return (
    <div>
      <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
        {tabs.map((t, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              active === i
                ? 'bg-verde-brote text-white'
                : 'bg-carbon/5 dark:bg-white/5 text-gris-piedra dark:text-beige-arena/70 hover:bg-verde-brote/10'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tabs[active].content}
    </div>
  );
};

// ── ProyectoView ─────────────────────────────────────────────────────────────
const ProyectoView: React.FC<{ id: number }> = ({ id }) => {
  const { data, isLoading, isError } = useProyecto(id);
  const { openDetailPanel } = useUI();

  if (isLoading) return <PanelSkeleton />;
  if (isError || !data) return <PanelMessage title="No se pudo cargar el proyecto." />;

  const esConservacion = data.area?.id === 1;
  const esDesarrollo = data.area?.id === 2;

  const localidades = (data.localidadesProyectos ?? []).map((l) => ({
    display: l.comunidad
      ? `${l.municipio?.nombre ?? ''} — ${l.comunidad.nombre}${l.municipio?.departamento?.nombre ? ` (${l.municipio.departamento.nombre})` : ''}`
      : `${l.municipio?.nombre ?? ''}${l.municipio?.departamento?.nombre ? ` (${l.municipio.departamento.nombre})` : ''}`.trim(),
    id: l.id,
  }));

  return (
    <>
      {/* Hero imagen */}
      <div className="relative w-full h-52 rounded-xl overflow-hidden mb-4 bg-verde-hoja-seca">
        {data.imagenPrincipalUrl && (
          <img src={data.imagenPrincipalUrl} alt={data.nombre} className="absolute inset-0 w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-carbon/70 to-transparent" />
        <div className="absolute bottom-3 left-4 right-4">
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${esConservacion ? 'bg-verde-brote text-white' : 'bg-terracota text-white'}`}>
            {data.area?.nombre ?? 'Sin área'}
          </span>
        </div>
      </div>

      <h2 className="text-2xl font-bold font-serif text-carbon dark:text-beige-arena mb-1">{data.nombre}</h2>
      <p className="text-sm text-verde-brote mb-4">{data.tipo?.nombre}</p>

      <Tabs tabs={[
        {
          label: 'General',
          content: (
            <div>
              {data.descripcion && (
                <p className="text-sm text-carbon/80 dark:text-beige-arena/80 mb-4 leading-relaxed">{data.descripcion}</p>
              )}
              <Section title="Información">
                <MetaRow icon={<CalendarIcon />} label="Inicio" value={fmtYear(data.anioInicio)} />
                <MetaRow icon={<CalendarIcon />} label="Fin" value={fmtYear(data.anioFin) ?? 'En curso'} />
                <MetaRow label="Área" value={data.area?.nombre} />
                <MetaRow label="Tipo" value={data.tipo?.nombre} />
                <MetaRow label="Estado" value={data.anioFin ? 'Finalizado' : 'Activo'} />
              </Section>
              {esConservacion && (
                <>
                  {(data.especiesAnimales ?? []).length > 0 && (
                    <Section title="Especies animales"><Chips items={data.especiesAnimales} color="verde-brote" /></Section>
                  )}
                  {(data.practicasAgricolas ?? []).length > 0 && (
                    <Section title="Prácticas agrícolas"><Chips items={data.practicasAgricolas} /></Section>
                  )}
                </>
              )}
              {esDesarrollo && (data.areasDesarrollo ?? []).length > 0 && (
                <Section title="Áreas de desarrollo comunitario"><Chips items={data.areasDesarrollo} color="azul-cobalto" /></Section>
              )}
              {(data.ayudas ?? []).length > 0 && (
                <Section title="Tipos de ayuda"><Chips items={data.ayudas} /></Section>
              )}
              {(data.actoresMunicipales ?? []).length > 0 && (
                <Section title="Actores municipales"><Chips items={data.actoresMunicipales} color="gris-piedra" /></Section>
              )}
            </div>
          ),
        },
        {
          label: `Localidades (${localidades.length})`,
          content: (
            <Section title="Municipios y comunidades">
              {localidades.length === 0
                ? <p className="text-xs text-gris-piedra italic">Sin localidades registradas</p>
                : (
                  <ul className="space-y-1.5">
                    {localidades.map((l) => (
                      <li key={l.id} className="flex items-start gap-2 text-sm">
                        <span className="text-verde-brote mt-0.5 shrink-0"><MapPinIcon /></span>
                        <span className="text-carbon dark:text-beige-arena/90">{l.display}</span>
                      </li>
                    ))}
                  </ul>
                )
              }
              {(data.lat && data.lng) && (
                <div className="mt-3 text-xs text-gris-piedra dark:text-beige-arena/50">
                  <span className="font-mono">
                    {data.department ?? data.municipality ?? 'Georef pendiente'} · {Number(data.lat).toFixed(4)}, {Number(data.lng).toFixed(4)}
                  </span>
                  {data.georefFailed && <span className="ml-2 text-amber-500">(georef sin resolver)</span>}
                </div>
              )}
            </Section>
          ),
        },
        {
          label: `Participantes (${(data.proyectosEmpresas ?? []).length + (data.proyectosOrganizaciones ?? []).length})`,
          content: (
            <div>
              {(data.proyectosEmpresas ?? []).length > 0 && (
                <Section title={`Empresas (${data.proyectosEmpresas.length})`}>
                  <div className="space-y-2">
                    {data.proyectosEmpresas.map((pe) => (
                      <div key={pe.idParticipacion} className="flex items-center gap-3 p-2 rounded-lg bg-carbon/3 dark:bg-white/3">
                        {pe.empresa.logoUrl
                          ? <img src={pe.empresa.logoUrl} alt={pe.empresa.nombre} className="w-9 h-9 rounded-full object-cover" />
                          : <div className="w-9 h-9 rounded-full bg-verde-brote/20 flex items-center justify-center text-xs font-bold text-verde-brote">{pe.empresa.nombre.charAt(0)}</div>
                        }
                        <div className="flex-grow min-w-0">
                          <p className="text-sm font-semibold text-carbon dark:text-beige-arena truncate">{pe.empresa.nombre}</p>
                          <p className="text-xs text-gris-piedra dark:text-beige-arena/50">
                            {fmtDate(pe.fechaInicio)}{pe.fechaFin ? ` → ${fmtDate(pe.fechaFin)}` : ' → activo'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Section>
              )}
              {(data.proyectosOrganizaciones ?? []).length > 0 && (
                <Section title={`Organizaciones (${data.proyectosOrganizaciones.length})`}>
                  <div className="space-y-2">
                    {data.proyectosOrganizaciones.map((po) => (
                      <div key={po.idParticipacion} className="flex items-center gap-3 p-2 rounded-lg bg-carbon/3 dark:bg-white/3">
                        {po.organizacion.logoUrl
                          ? <img src={po.organizacion.logoUrl} alt={po.organizacion.nombre} className="w-9 h-9 rounded-full object-cover" />
                          : <div className="w-9 h-9 rounded-full bg-terracota/20 flex items-center justify-center text-xs font-bold text-terracota">{po.organizacion.nombre.charAt(0)}</div>
                        }
                        <div className="flex-grow min-w-0">
                          <p className="text-sm font-semibold text-carbon dark:text-beige-arena truncate">{po.organizacion.nombre}</p>
                          <p className="text-xs text-gris-piedra dark:text-beige-arena/50">
                            {po.organizacion.esNacional ? 'Nacional' : 'Internacional'} · {fmtDate(po.fechaInicio)}{po.fechaFin ? ` → ${fmtDate(po.fechaFin)}` : ' → activo'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Section>
              )}
              {(data.proyectosEmpresas ?? []).length === 0 && (data.proyectosOrganizaciones ?? []).length === 0 && (
                <p className="text-sm text-gris-piedra italic">Sin participantes registrados</p>
              )}
            </div>
          ),
        },
        ...(data.imagenes && data.imagenes.length > 1 ? [{
          label: `Galería (${data.imagenes.length})`,
          content: (
            <div className="grid grid-cols-2 gap-2">
              {data.imagenes.map((img) => (
                <div key={img.id} className="relative aspect-video rounded-lg overflow-hidden bg-verde-hoja-seca/20">
                  <img src={img.url} alt={img.descripcion ?? ''} className="w-full h-full object-cover" />
                  {img.descripcion && (
                    <p className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 line-clamp-1">{img.descripcion}</p>
                  )}
                </div>
              ))}
            </div>
          ),
        }] : []),
      ]} />
    </>
  );
};

// ── OrganizacionView ─────────────────────────────────────────────────────────
const OrganizacionView: React.FC<{ id: number }> = ({ id }) => {
  const { data, isLoading, isError } = useOrganizacion(id);
  const { openDetailPanel } = useUI();

  if (isLoading) return <PanelSkeleton />;
  if (isError || !data) return <PanelMessage title="No se pudo cargar la organización." />;

  const proyectos = (data.proyectosOrganizaciones ?? []);
  const empresas = (data.organizacionesEmpresas ?? []);

  return (
    <>
      <div className="flex items-center gap-4 mb-5">
        {data.logoUrl
          ? <img src={data.logoUrl} alt={data.nombre} className="w-20 h-20 rounded-full object-cover border-4 border-white dark:border-verde-hoja-seca shadow-md" />
          : <div className="w-20 h-20 rounded-full border-4 border-white dark:border-verde-hoja-seca bg-verde-hoja-seca/50 flex items-center justify-center text-2xl font-bold font-serif text-beige-arena">{data.nombre.charAt(0)}</div>
        }
        <div>
          <h2 className="text-2xl font-bold font-serif text-carbon dark:text-beige-arena">{data.nombre}</h2>
          <p className="text-sm text-verde-brote">{data.tipo?.nombre}</p>
          <p className="text-xs text-gris-piedra mt-0.5">
            {data.esNacional ? '🇧🇴 Nacional' : '🌎 Internacional'} · {data.departamento?.nombre} · Desde {data.anioInicioTrabajo}
          </p>
        </div>
      </div>

      <Tabs tabs={[
        {
          label: 'Información',
          content: (
            <Section title="Datos generales">
              <MetaRow label="Tipo" value={data.tipo?.nombre} />
              <MetaRow icon={<MapPinIcon />} label="Departamento" value={data.departamento?.nombre} />
              <MetaRow label="Alcance" value={data.esNacional ? 'Nacional' : 'Internacional'} />
              <MetaRow icon={<CalendarIcon />} label="Inicio de trabajo" value={fmtYear(data.anioInicioTrabajo)} />
            </Section>
          ),
        },
        {
          label: `Proyectos (${proyectos.length})`,
          content: (
            <div className="space-y-2">
              {proyectos.length === 0
                ? <p className="text-sm text-gris-piedra italic">Sin proyectos asociados</p>
                : proyectos.map((po) => (
                    <button
                      key={po.idParticipacion}
                      onClick={() => openDetailPanel({ kind: 'proyecto', id: po.proyecto.id })}
                      className="w-full text-left flex items-start gap-3 p-2.5 rounded-lg bg-carbon/3 dark:bg-white/3 hover:bg-verde-brote/10 transition-colors"
                    >
                      {po.proyecto.imagenPrincipalUrl
                        ? <img src={po.proyecto.imagenPrincipalUrl} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />
                        : <div className="w-12 h-12 rounded-lg bg-verde-brote/10 shrink-0" />
                      }
                      <div className="flex-grow min-w-0">
                        <p className="text-sm font-semibold text-carbon dark:text-beige-arena line-clamp-1">{po.proyecto.nombre}</p>
                        <p className="text-xs text-gris-piedra dark:text-beige-arena/50">
                          {fmtDate(po.fechaInicio)}{po.fechaFin ? ` → ${fmtDate(po.fechaFin)}` : ' → activo'}
                          {po.proyecto.anioInicio && ` · Inicio ${po.proyecto.anioInicio}`}
                        </p>
                      </div>
                    </button>
                  ))
              }
            </div>
          ),
        },
        {
          label: `Empresas vinculadas (${empresas.length})`,
          content: (
            <div className="space-y-2">
              {empresas.length === 0
                ? <p className="text-sm text-gris-piedra italic">Sin empresas vinculadas</p>
                : empresas.map((oe, i) => (
                    <button
                      key={i}
                      onClick={() => openDetailPanel({ kind: 'empresa', id: oe.empresa.id })}
                      className="w-full text-left flex items-center gap-3 p-2.5 rounded-lg bg-carbon/3 dark:bg-white/3 hover:bg-verde-brote/10 transition-colors"
                    >
                      {oe.empresa.logoUrl
                        ? <img src={oe.empresa.logoUrl} alt="" className="w-9 h-9 rounded-full object-cover" />
                        : <div className="w-9 h-9 rounded-full bg-terracota/20 flex items-center justify-center text-xs font-bold text-terracota">{oe.empresa.nombre.charAt(0)}</div>
                      }
                      <span className="text-sm font-semibold text-carbon dark:text-beige-arena truncate">{oe.empresa.nombre}</span>
                    </button>
                  ))
              }
            </div>
          ),
        },
      ]} />
    </>
  );
};

// ── EmpresaView ───────────────────────────────────────────────────────────────
const EmpresaView: React.FC<{ id: number }> = ({ id }) => {
  const { data, isLoading, isError } = useEmpresa(id);
  const { openDetailPanel } = useUI();

  if (isLoading) return <PanelSkeleton />;
  if (isError || !data) return <PanelMessage title="No se pudo cargar la empresa." />;

  const proyectos = (data.proyectosEmpresas ?? []);
  const orgs = (data.organizacionesEmpresas ?? []);

  return (
    <>
      <div className="flex items-center gap-4 mb-5">
        {data.logoUrl
          ? <img src={data.logoUrl} alt={data.nombre} className="w-20 h-20 rounded-full object-cover border-4 border-white dark:border-verde-hoja-seca shadow-md" />
          : <div className="w-20 h-20 rounded-full border-4 border-white dark:border-verde-hoja-seca bg-verde-hoja-seca/50 flex items-center justify-center text-2xl font-bold font-serif text-beige-arena">{data.nombre.charAt(0)}</div>
        }
        <div>
          <h2 className="text-2xl font-bold font-serif text-carbon dark:text-beige-arena">{data.nombre}</h2>
          <p className="text-sm text-verde-brote">{data.formaJuridica?.nombre}</p>
          <p className="text-xs text-gris-piedra mt-0.5">Apoya desde {data.anioInicioApoyo}</p>
        </div>
      </div>

      <Tabs tabs={[
        {
          label: 'Información',
          content: (
            <div>
              <Section title="Datos generales">
                <MetaRow label="Forma jurídica" value={data.formaJuridica?.nombre} />
                <MetaRow icon={<CalendarIcon />} label="Apoya desde" value={fmtYear(data.anioInicioApoyo)} />
                <MetaRow icon={<BuildingIcon />} label="Proyectos participantes" value={String(proyectos.length)} />
              </Section>
              {data.departamentos.length > 0 && (
                <Section title="Departamentos"><Chips items={data.departamentos} color="azul-cobalto" /></Section>
              )}
              {data.motivos.length > 0 && (
                <Section title="Motivos de apoyo"><Chips items={data.motivos} /></Section>
              )}
              {data.apoyos.length > 0 && (
                <Section title="Tipos de apoyo"><Chips items={data.apoyos} color="verde-brote" /></Section>
              )}
              {data.ods.length > 0 && (
                <Section title="ODS alineados">
                  <div className="flex flex-wrap gap-1.5">
                    {data.ods.map((o) => (
                      <span key={o.id} className="text-xs font-semibold px-2 py-0.5 rounded-full bg-azul-cobalto/10 text-azul-cobalto dark:text-beige-arena border border-azul-cobalto/20">
                        ODS {o.id} · {o.nombre}
                      </span>
                    ))}
                  </div>
                </Section>
              )}
            </div>
          ),
        },
        {
          label: `Proyectos (${proyectos.length})`,
          content: (
            <div className="space-y-2">
              {proyectos.length === 0
                ? <p className="text-sm text-gris-piedra italic">Sin proyectos asociados</p>
                : proyectos.map((pe) => (
                    <button
                      key={pe.idParticipacion}
                      onClick={() => openDetailPanel({ kind: 'proyecto', id: pe.proyecto.id })}
                      className="w-full text-left flex items-start gap-3 p-2.5 rounded-lg bg-carbon/3 dark:bg-white/3 hover:bg-verde-brote/10 transition-colors"
                    >
                      {pe.proyecto.imagenPrincipalUrl
                        ? <img src={pe.proyecto.imagenPrincipalUrl} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />
                        : <div className="w-12 h-12 rounded-lg bg-verde-brote/10 shrink-0" />
                      }
                      <div className="flex-grow min-w-0">
                        <p className="text-sm font-semibold text-carbon dark:text-beige-arena line-clamp-1">{pe.proyecto.nombre}</p>
                        <p className="text-xs text-gris-piedra dark:text-beige-arena/50">
                          {fmtDate(pe.fechaInicio)}{pe.fechaFin ? ` → ${fmtDate(pe.fechaFin)}` : ' → activo'}
                          {pe.proyecto.anioInicio && ` · Inicio ${pe.proyecto.anioInicio}`}
                        </p>
                      </div>
                    </button>
                  ))
              }
            </div>
          ),
        },
        {
          label: `Organizaciones (${orgs.length})`,
          content: (
            <div className="space-y-2">
              {orgs.length === 0
                ? <p className="text-sm text-gris-piedra italic">Sin organizaciones vinculadas</p>
                : orgs.map((oe, i) => (
                    <button
                      key={i}
                      onClick={() => openDetailPanel({ kind: 'organizacion', id: oe.organizacion.id })}
                      className="w-full text-left flex items-center gap-3 p-2.5 rounded-lg bg-carbon/3 dark:bg-white/3 hover:bg-verde-brote/10 transition-colors"
                    >
                      {oe.organizacion.logoUrl
                        ? <img src={oe.organizacion.logoUrl} alt="" className="w-9 h-9 rounded-full object-cover" />
                        : <div className="w-9 h-9 rounded-full bg-verde-brote/20 flex items-center justify-center text-xs font-bold text-verde-brote">{oe.organizacion.nombre.charAt(0)}</div>
                      }
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-carbon dark:text-beige-arena truncate">{oe.organizacion.nombre}</p>
                        <p className="text-xs text-gris-piedra">{oe.organizacion.esNacional ? 'Nacional' : 'Internacional'}</p>
                      </div>
                    </button>
                  ))
              }
            </div>
          ),
        },
      ]} />
    </>
  );
};

// ── Login Prompt ──────────────────────────────────────────────────────────────
const LoginPrompt: React.FC = () => {
  const { openLoginPanel } = useUI();
  return (
    <PanelMessage title="Inicia sesión para ver el detalle">
      <p className="text-gris-piedra dark:text-beige-arena/80 mb-6 text-sm">
        El detalle completo de proyectos, organizaciones y empresas está disponible para usuarios autenticados.
      </p>
      <Button onClick={openLoginPanel}>Iniciar sesión</Button>
    </PanelMessage>
  );
};

// ── Detail Content ────────────────────────────────────────────────────────────
const DetailContent: React.FC<{ detailRef: DetailRef }> = ({ detailRef }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <LoginPrompt />;
  switch (detailRef.kind) {
    case 'proyecto': return <ProyectoView id={detailRef.id} />;
    case 'organizacion': return <OrganizacionView id={detailRef.id} />;
    case 'empresa': return <EmpresaView id={detailRef.id} />;
  }
};

// ── Panel principal ───────────────────────────────────────────────────────────
const DetailsPanel: React.FC = () => {
  const { closeDetailPanel, detailRef } = useUI();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') closeDetailPanel(); };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeDetailPanel]);

  if (!detailRef) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={closeDetailPanel}
      className="fixed inset-0 bg-carbon/60 backdrop-blur-sm z-[100] flex justify-end"
      aria-modal="true"
      role="dialog"
    >
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-fibra-natural dark:bg-carbon shadow-2xl w-full max-w-xl h-full relative"
        data-testid="details-panel"
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
