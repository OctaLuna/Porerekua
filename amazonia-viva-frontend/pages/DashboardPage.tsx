import React, { useMemo, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  ComposedChart,
} from 'recharts';
import Card from '../components/ui/Card';
import Skeleton from '../components/ui/Skeleton';
import Button from '../components/ui/Button';
import { gsap } from '../components/animations/gsap-setup';
import { prefersReducedMotion } from '../components/animations/motion';
import { useAuth } from '../hooks/useAuth';
import { useUI } from '../hooks/useUI';
import {
  useDashboardFiltros,
  useDashboardPorRegion,
  useDashboardPorTipo,
  useDashboardPorTipoFiltrado,
  useDashboardPublicoPorRegion,
  useDashboardPublicoResumen,
  useDashboardResumen,
  useDashboardTimeline,
} from '../hooks/useDashboard';

// ── Colores de marca (paleta del sitio) ───────────────────────────────────────
const COLORS = {
  verde: '#7A9A3E',
  terracota: '#F39C12',
  azul: '#007BFF',
  amarillo: '#F0D43A',
  morado: '#8B5CF6',
  gris: '#78716C',
};
const AREA_COLORS = [COLORS.verde, COLORS.terracota, COLORS.azul, COLORS.amarillo, COLORS.morado, COLORS.gris];

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (v: number | null | undefined) => (v ?? 0).toLocaleString('es-BO');

const cardCls = 'p-5 bg-blanco-puro/95 dark:bg-noche-selva/60 backdrop-blur-md border border-carbon/10 dark:border-white/10 shadow-medium rounded-2xl';

const containerV = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.07 } } };
const itemV = { hidden: { y: 16, opacity: 0 }, visible: { y: 0, opacity: 1 } };

const ArrowUpRightIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="7" y1="17" x2="17" y2="7" />
    <polyline points="7 7 17 7 17 17" />
  </svg>
);

// ── Stat Card (estilo dashboard: número grande + botón circular + acento) ──────
const StatCard = ({
  title, value, subtitle, isLoading, accent = false,
}: {
  title: string; value: string | number; subtitle?: string; isLoading: boolean; accent?: boolean;
}) => (
  <div
    className={`flex min-h-[132px] flex-col justify-between rounded-2xl border p-5 shadow-medium backdrop-blur-md transition-transform duration-300 hover:-translate-y-0.5 motion-reduce:transform-none ${
      accent
        ? 'bg-verde-brote text-blanco-puro border-verde-brote'
        : 'bg-blanco-puro/95 dark:bg-noche-selva/60 text-carbon dark:text-beige-arena border-carbon/10 dark:border-white/10'
    }`}
  >
    <div className="flex items-start justify-between gap-2">
      <p className={`text-sm font-semibold ${accent ? 'text-blanco-puro/90' : 'text-gris-piedra dark:text-beige-arena/70'}`}>{title}</p>
      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${accent ? 'bg-white/20 text-blanco-puro' : 'bg-verde-brote/10 text-verde-brote'}`}>
        <ArrowUpRightIcon />
      </span>
    </div>
    {isLoading ? (
      <Skeleton className={`h-9 w-1/2 ${accent ? 'opacity-40' : ''}`} />
    ) : (
      <p className={`font-serif text-4xl font-extrabold ${accent ? 'text-blanco-puro' : 'text-carbon dark:text-beige-arena'}`}>
        {fmt(typeof value === 'number' ? value : undefined) || value}
      </p>
    )}
    <p className={`text-xs ${accent ? 'text-blanco-puro/80' : 'text-gris-piedra dark:text-beige-arena/50'}`}>
      {subtitle ?? ' '}
    </p>
  </div>
);

// ── Anillo de progreso (estilo "Project Progress 41%") ────────────────────────
const ProgressRing: React.FC<{ pct: number; label: string; sublabel?: string; color?: string }> = ({
  pct, label, sublabel, color = COLORS.verde,
}) => {
  const ref = useRef<SVGCircleElement>(null);
  const R = 52;
  const C = 2 * Math.PI * R;
  const clamped = Math.max(0, Math.min(100, pct));
  const off = C * (1 - clamped / 100);

  useEffect(() => {
    if (!ref.current) return;
    if (prefersReducedMotion()) {
      gsap.set(ref.current, { strokeDashoffset: off });
      return;
    }
    gsap.fromTo(ref.current, { strokeDashoffset: C }, { strokeDashoffset: off, duration: 1.1, ease: 'power2.out' });
  }, [off, C]);

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative h-36 w-36">
        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
          <circle cx="60" cy="60" r={R} fill="none" strokeWidth="12" className="text-verde-brote/15" stroke="currentColor" />
          <circle ref={ref} cx="60" cy="60" r={R} fill="none" strokeWidth="12" strokeLinecap="round" stroke={color} strokeDasharray={C} strokeDashoffset={C} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-serif text-3xl font-extrabold text-carbon dark:text-beige-arena">{clamped}%</span>
        </div>
      </div>
      <p className="mt-2 text-sm font-semibold text-gris-piedra dark:text-beige-arena/70">{label}</p>
      {sublabel && <p className="text-xs text-gris-piedra dark:text-beige-arena/50">{sublabel}</p>}
    </div>
  );
};

// ── Dashboard Público (sin sesión) ────────────────────────────────────────────
const PublicDashboard: React.FC = () => {
  const { data: resumen, isLoading: rLoading } = useDashboardPublicoResumen();
  const { data: porRegion, isLoading: rRegionLoading } = useDashboardPublicoPorRegion();
  const { openLoginPanel } = useUI();

  const regionData = useMemo(
    () => (porRegion ?? []).map((r) => ({ name: r.departamento, proyectos: r.total_proyectos, empresas: r.total_empresas })),
    [porRegion],
  );

  return (
    <div className="space-y-8">
      {/* KPIs públicos */}
      <motion.div
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4"
        variants={containerV} initial="hidden" animate="visible"
      >
        <motion.div variants={itemV}><StatCard title="Proyectos" value={resumen?.total_proyectos ?? 0} isLoading={rLoading} accent /></motion.div>
        <motion.div variants={itemV}><StatCard title="Proyectos Activos" value={resumen?.proyectos_activos ?? 0} isLoading={rLoading} /></motion.div>
        <motion.div variants={itemV}><StatCard title="Empresas" value={resumen?.total_empresas ?? 0} isLoading={rLoading} /></motion.div>
        <motion.div variants={itemV}><StatCard title="Organizaciones" value={resumen?.total_organizaciones ?? 0} isLoading={rLoading} /></motion.div>
        <motion.div variants={itemV}><StatCard title="Departamentos" value={resumen?.departamentos_con_actividad ?? 0} isLoading={rLoading} /></motion.div>
      </motion.div>

      {/* Gráfica por región + anillo de progreso */}
      {!rRegionLoading && regionData.length > 0 && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className={`${cardCls} lg:col-span-2`}>
            <h3 className="text-xl font-bold font-serif text-carbon dark:text-beige-arena mb-4">
              Actividad por Departamento
            </h3>
            <ResponsiveContainer width="100%" height={260}>
              <ReBarChart data={regionData} layout="vertical" margin={{ left: 16, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb33" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="proyectos" name="Proyectos" fill={COLORS.verde} radius={[0, 6, 6, 0]} />
                <Bar dataKey="empresas" name="Empresas" fill={COLORS.terracota} radius={[0, 6, 6, 0]} />
              </ReBarChart>
            </ResponsiveContainer>
          </Card>

          <Card className={`${cardCls} flex flex-col items-center justify-center`}>
            <h3 className="mb-2 self-start text-lg font-bold font-serif text-carbon dark:text-beige-arena">Proyectos activos</h3>
            <ProgressRing
              pct={resumen?.total_proyectos ? Math.round(((resumen.proyectos_activos ?? 0) / resumen.total_proyectos) * 100) : 0}
              label="del total en marcha"
              sublabel={`${resumen?.proyectos_activos ?? 0} de ${resumen?.total_proyectos ?? 0}`}
            />
          </Card>
        </div>
      )}

      {/* CTA para login */}
      <Card className={`${cardCls} text-center py-8`}>
        <h3 className="text-xl font-bold font-serif text-carbon dark:text-beige-arena mb-2">
          Ver análisis completo
        </h3>
        <p className="text-gris-piedra dark:text-beige-arena/70 mb-4 text-sm">
          Inicia sesión para ver el desglose por tipo de proyecto, la evolución histórica y todos los indicadores.
        </p>
        <Button onClick={openLoginPanel}>Iniciar sesión</Button>
      </Card>
    </div>
  );
};

// ── Dashboard Privado (con sesión) ────────────────────────────────────────────
const PrivateDashboard: React.FC = () => {
  const { data: resumen, isLoading: rLoading } = useDashboardResumen();
  const { data: porTipo, isLoading: tLoading } = useDashboardPorTipo();
  const { data: porRegion, isLoading: regLoading } = useDashboardPorRegion();
  const { data: timeline, isLoading: tlLoading } = useDashboardTimeline();

  const porTipoData = useMemo(
    () =>
      (porTipo ?? [])
        .map((t) => ({
          name: t.tipo_proyecto.length > 28 ? t.tipo_proyecto.slice(0, 28) + '…' : t.tipo_proyecto,
          proyectos: t.total_proyectos,
          activos: t.proyectos_activos,
          empresas: t.empresas_participantes,
          departamentos: t.departamentos_cubiertos,
        }))
        .sort((a, b) => b.proyectos - a.proyectos)
        .slice(0, 10),
    [porTipo],
  );

  const porRegionData = useMemo(
    () =>
      (porRegion ?? [])
        .map((r) => ({
          name: r.departamento,
          proyectos: r.total_proyectos,
          conservacion: r.proyectos_conservacion,
          desarrollo: r.proyectos_desarrollo,
          empresas: r.total_empresas,
          orgs: r.total_organizaciones,
        }))
        .sort((a, b) => b.proyectos - a.proyectos),
    [porRegion],
  );

  const timelineData = useMemo(
    () => (timeline ?? []).map((t) => ({ anio: String(t.anio), proyectos: t.nuevos_proyectos, empresas: t.nuevas_empresas, orgs: t.nuevas_organizaciones })),
    [timeline],
  );

  const pieData = useMemo(
    () => resumen
      ? [
          { name: 'Conservación', value: resumen.proyectos_conservacion },
          { name: 'Desarrollo', value: resumen.proyectos_desarrollo },
        ]
      : [],
    [resumen],
  );

  return (
    <div className="space-y-8">
      {/* KPIs principales */}
      <motion.div className="grid grid-cols-1 sm:grid-cols-3 gap-5" variants={containerV} initial="hidden" animate="visible">
        <motion.div variants={itemV}><StatCard title="Total Proyectos" value={resumen?.total_proyectos ?? 0} isLoading={rLoading} accent /></motion.div>
        <motion.div variants={itemV}><StatCard title="Organizaciones" value={resumen?.total_organizaciones ?? 0} isLoading={rLoading} /></motion.div>
        <motion.div variants={itemV}><StatCard title="Empresas" value={resumen?.total_empresas ?? 0} isLoading={rLoading} /></motion.div>
      </motion.div>

      {/* KPIs secundarios — fila 1 */}
      <motion.div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4" variants={containerV} initial="hidden" animate="visible">
        <motion.div variants={itemV}><StatCard title="Proyectos Activos" value={resumen?.proyectos_activos ?? 0} isLoading={rLoading} /></motion.div>
        <motion.div variants={itemV}><StatCard title="Proyectos Finalizados" value={resumen?.proyectos_finalizados ?? 0} isLoading={rLoading} /></motion.div>
        <motion.div variants={itemV}><StatCard title="Emp. con Proyectos" value={resumen?.empresas_con_proyectos ?? 0} isLoading={rLoading} /></motion.div>
        <motion.div variants={itemV}><StatCard title="Orgs. con Proyectos" value={resumen?.organizaciones_con_proyectos ?? 0} isLoading={rLoading} /></motion.div>
      </motion.div>

      {/* KPIs secundarios — fila 2 */}
      <motion.div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4" variants={containerV} initial="hidden" animate="visible">
        <motion.div variants={itemV}><StatCard title="Conservación" value={resumen?.proyectos_conservacion ?? 0} isLoading={rLoading} /></motion.div>
        <motion.div variants={itemV}><StatCard title="Desarrollo" value={resumen?.proyectos_desarrollo ?? 0} isLoading={rLoading} /></motion.div>
        <motion.div variants={itemV}><StatCard title="Departamentos" value={resumen?.departamentos_amazonicos ?? 0} isLoading={rLoading} /></motion.div>
        <motion.div variants={itemV}><StatCard title="Municipios" value={resumen?.municipios_cubiertos ?? 0} isLoading={rLoading} /></motion.div>
        <motion.div variants={itemV}><StatCard title="Comunidades" value={resumen?.comunidades_indigenas_beneficiadas ?? 0} isLoading={rLoading} /></motion.div>
        <motion.div variants={itemV}><StatCard title="ODS Cubiertos" value={resumen?.total_ods_cubiertos ?? 0} isLoading={rLoading} /></motion.div>
      </motion.div>

      {/* KPIs adicionales */}
      <motion.div className="grid grid-cols-2 sm:grid-cols-4 gap-4" variants={containerV} initial="hidden" animate="visible">
        <motion.div variants={itemV}><StatCard title="Orgs. Nacionales" value={resumen?.organizaciones_nacionales ?? 0} isLoading={rLoading} /></motion.div>
        <motion.div variants={itemV}><StatCard title="Orgs. Internacionales" value={resumen?.organizaciones_internacionales ?? 0} isLoading={rLoading} /></motion.div>
        <motion.div variants={itemV}><StatCard title="Año más antiguo" value={resumen?.anio_inicio_mas_antiguo ?? '—'} isLoading={rLoading} /></motion.div>
        <motion.div variants={itemV}><StatCard title="Año más reciente" value={resumen?.anio_inicio_mas_reciente ?? '—'} isLoading={rLoading} /></motion.div>
      </motion.div>

      {/* Progreso + distribución área + por región */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Anillo: % proyectos activos */}
        <Card className={`${cardCls} flex flex-col items-center justify-center`}>
          <h3 className="mb-2 self-start text-lg font-bold font-serif text-carbon dark:text-beige-arena">Proyectos activos</h3>
          {rLoading ? <Skeleton className="h-36 w-36 rounded-full" /> : (
            <ProgressRing
              pct={resumen?.total_proyectos ? Math.round(((resumen.proyectos_activos ?? 0) / resumen.total_proyectos) * 100) : 0}
              label="en marcha"
              sublabel={`${resumen?.proyectos_activos ?? 0} de ${resumen?.total_proyectos ?? 0}`}
            />
          )}
        </Card>

        {/* Donut: Conservación vs Desarrollo */}
        <Card className={cardCls}>
          <h3 className="text-lg font-bold font-serif text-carbon dark:text-beige-arena mb-3">Distribución por Área</h3>
          {rLoading ? <Skeleton className="h-48 w-full" /> : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={82} paddingAngle={3} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                  {pieData.map((_, i) => <Cell key={i} fill={AREA_COLORS[i % AREA_COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Bar stacked: proyectos por región */}
        <Card className={`${cardCls} lg:col-span-2`}>
          <h3 className="text-lg font-bold font-serif text-carbon dark:text-beige-arena mb-3">Proyectos por Departamento</h3>
          {regLoading ? <Skeleton className="h-48 w-full" /> : (
            <ResponsiveContainer width="100%" height={220}>
              <ReBarChart data={porRegionData} layout="vertical" margin={{ left: 8, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb33" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" width={85} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="conservacion" name="Conservación" stackId="a" fill={COLORS.verde} />
                <Bar dataKey="desarrollo" name="Desarrollo" stackId="a" fill={COLORS.terracota} radius={[0, 6, 6, 0]} />
              </ReBarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* Timeline */}
      <Card className={cardCls}>
        <h3 className="text-lg font-bold font-serif text-carbon dark:text-beige-arena mb-3">Evolución histórica de registros</h3>
        {tlLoading ? <Skeleton className="h-56 w-full" /> : (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={timelineData} margin={{ left: 0, right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb33" />
              <XAxis dataKey="anio" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="proyectos" name="Proyectos" stroke={COLORS.verde} strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="empresas" name="Empresas" stroke={COLORS.terracota} strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="orgs" name="Organizaciones" stroke={COLORS.azul} strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* Por tipo de proyecto */}
      <Card className={cardCls}>
        <h3 className="text-lg font-bold font-serif text-carbon dark:text-beige-arena mb-3">Proyectos por Tipo</h3>
        {tLoading ? <Skeleton className="h-64 w-full" /> : (
          <ResponsiveContainer width="100%" height={320}>
            <ReBarChart data={porTipoData} layout="vertical" margin={{ left: 8, right: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb33" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="name" type="category" width={140} tick={{ fontSize: 10 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="activos" name="Activos" stackId="a" fill={COLORS.verde} />
              <Bar dataKey="proyectos" name="Total" fill={COLORS.azul} radius={[0, 6, 6, 0]} />
            </ReBarChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* Tabla: por tipo con métricas adicionales */}
      <Card className={cardCls}>
        <h3 className="text-lg font-bold font-serif text-carbon dark:text-beige-arena mb-3">Detalle por Tipo de Proyecto</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-carbon/10 dark:border-white/10">
                <th className="text-left py-2 px-3 text-gris-piedra dark:text-beige-arena/60 font-semibold">Tipo</th>
                <th className="text-right py-2 px-3 text-gris-piedra dark:text-beige-arena/60 font-semibold">Proyectos</th>
                <th className="text-right py-2 px-3 text-gris-piedra dark:text-beige-arena/60 font-semibold">Activos</th>
                <th className="text-right py-2 px-3 text-gris-piedra dark:text-beige-arena/60 font-semibold">Empresas</th>
                <th className="text-right py-2 px-3 text-gris-piedra dark:text-beige-arena/60 font-semibold">Departamentos</th>
              </tr>
            </thead>
            <tbody>
              {tLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}><td colSpan={5} className="py-2 px-3"><Skeleton className="h-4 w-full" /></td></tr>
                  ))
                : (porTipo ?? []).sort((a, b) => b.total_proyectos - a.total_proyectos).map((t) => (
                    <tr key={t.id_tipo} className="border-b border-carbon/5 dark:border-white/5 hover:bg-carbon/2 dark:hover:bg-white/2">
                      <td className="py-2 px-3 text-carbon dark:text-beige-arena">{t.tipo_proyecto}</td>
                      <td className="py-2 px-3 text-right font-semibold text-carbon dark:text-beige-arena">{t.total_proyectos}</td>
                      <td className="py-2 px-3 text-right text-verde-brote">{t.proyectos_activos}</td>
                      <td className="py-2 px-3 text-right text-gris-piedra dark:text-beige-arena/70">{t.empresas_participantes}</td>
                      <td className="py-2 px-3 text-right text-gris-piedra dark:text-beige-arena/70">{t.departamentos_cubiertos}</td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
      </Card>

      {/* Análisis Interactivo */}
      <AnalisisInteractivo />

      {resumen?.ultima_actualizacion && (
        <p className="text-center text-xs text-beige-arena/50">
          Última actualización: {new Date(resumen.ultima_actualizacion).toLocaleString('es-BO')}
        </p>
      )}
    </div>
  );
};

// ── Análisis Interactivo ──────────────────────────────────────────────────────
type MetricaKey = 'total_proyectos' | 'proyectos_activos' | 'proyectos_finalizados' | 'empresas_participantes' | 'organizaciones_participantes' | 'departamentos_cubiertos';
type ChartType = 'bar' | 'line' | 'area' | 'radar';

const METRICAS: { key: MetricaKey; label: string }[] = [
  { key: 'total_proyectos', label: 'Total proyectos' },
  { key: 'proyectos_activos', label: 'Proyectos activos' },
  { key: 'proyectos_finalizados', label: 'Finalizados' },
  { key: 'empresas_participantes', label: 'Empresas' },
  { key: 'organizaciones_participantes', label: 'Organizaciones' },
  { key: 'departamentos_cubiertos', label: 'Departamentos' },
];

const CHART_TYPES: { type: ChartType; label: string; icon: string }[] = [
  { type: 'bar', label: 'Barras', icon: '▬' },
  { type: 'line', label: 'Línea', icon: '〰' },
  { type: 'area', label: 'Área', icon: '▒' },
  { type: 'radar', label: 'Radar', icon: '⬡' },
];

const AREA_COLOR_MAP: Record<number | string, string> = {
  1: COLORS.verde,
  2: COLORS.terracota,
  all: COLORS.azul,
};

const AnalisisInteractivo: React.FC = () => {
  const [area, setArea] = useState<number | undefined>();
  const [departamento, setDepartamento] = useState<number | undefined>();
  const [metrica, setMetrica] = useState<MetricaKey>('total_proyectos');
  const [chartType, setChartType] = useState<ChartType>('bar');

  const { data: filtros } = useDashboardFiltros();
  const { data: rawData, isLoading } = useDashboardPorTipoFiltrado({ area, departamento });

  const chartData = useMemo(
    () =>
      (rawData ?? [])
        .map((t) => ({
          name: t.tipo_proyecto.length > 22 ? t.tipo_proyecto.slice(0, 22) + '…' : t.tipo_proyecto,
          [metrica]: (t as unknown as Record<string, number>)[metrica],
        }))
        .sort((a, b) => ((b[metrica] as number) ?? 0) - ((a[metrica] as number) ?? 0))
        .slice(0, 12),
    [rawData, metrica],
  );

  const activeColor = AREA_COLOR_MAP[area ?? 'all'];
  const metricaLabel = METRICAS.find((m) => m.key === metrica)?.label ?? metrica;

  const renderChart = () => {
    if (isLoading) return <Skeleton className="h-72 w-full" />;
    if (!chartData.length) return <p className="text-center text-gris-piedra dark:text-beige-arena/50 py-12">Sin datos para los filtros seleccionados.</p>;

    if (chartType === 'radar') {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={chartData}>
            <PolarGrid stroke="#e5e7eb33" />
            <PolarAngleAxis dataKey="name" tick={{ fontSize: 10 }} />
            <PolarRadiusAxis tick={{ fontSize: 9 }} />
            <Radar dataKey={metrica} name={metricaLabel} fill={activeColor} fillOpacity={0.4} stroke={activeColor} strokeWidth={2} />
            <Tooltip />
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={chartData} layout="vertical" margin={{ left: 8, right: 24 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb22" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 11 }} />
          <YAxis dataKey="name" type="category" width={130} tick={{ fontSize: 10 }} />
          <Tooltip
            contentStyle={{ borderRadius: 8, fontSize: 12 }}
            formatter={(v) => [v, metricaLabel]}
          />
          <AnimatePresence mode="wait">
            {chartType === 'bar' && (
              <Bar key="bar" dataKey={metrica} name={metricaLabel} fill={activeColor} radius={[0, 6, 6, 0]}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill={`${activeColor}${Math.round(255 - i * 12).toString(16).padStart(2, '0')}`} />
                ))}
              </Bar>
            )}
            {chartType === 'line' && (
              <Line key="line" type="monotone" dataKey={metrica} name={metricaLabel} stroke={activeColor} strokeWidth={2.5} dot={{ r: 5, fill: activeColor }} />
            )}
            {chartType === 'area' && (
              <Area key="area" type="monotone" dataKey={metrica} name={metricaLabel} fill={activeColor} fillOpacity={0.25} stroke={activeColor} strokeWidth={2} />
            )}
          </AnimatePresence>
        </ComposedChart>
      </ResponsiveContainer>
    );
  };

  return (
    <Card className={cardCls}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h3 className="text-xl font-bold font-serif text-carbon dark:text-beige-arena">Análisis Interactivo</h3>
          <p className="text-xs text-gris-piedra dark:text-beige-arena/50 mt-0.5">
            Filtra por área y departamento · Cambia métrica y tipo de gráfica
          </p>
        </div>
        {/* Chart type pills */}
        <div className="flex gap-1.5 shrink-0">
          {CHART_TYPES.map((ct) => (
            <button
              key={ct.type}
              onClick={() => setChartType(ct.type)}
              title={ct.label}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                chartType === ct.type
                  ? 'bg-verde-brote text-white shadow-sm scale-105'
                  : 'bg-carbon/5 dark:bg-white/5 text-gris-piedra dark:text-beige-arena/70 hover:bg-verde-brote/10'
              }`}
            >
              <span className="mr-1">{ct.icon}</span>{ct.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5 p-3 rounded-xl bg-carbon/3 dark:bg-white/3 border border-carbon/5 dark:border-white/5">
        {/* Área */}
        <div>
          <label className="block text-xs font-semibold text-gris-piedra dark:text-beige-arena/60 mb-1">Área</label>
          <select
            value={area ?? ''}
            onChange={(e) => setArea(e.target.value ? Number(e.target.value) : undefined)}
            className="w-full px-3 py-2 rounded-lg text-sm bg-blanco-puro dark:bg-noche-selva border border-carbon/10 dark:border-white/10 text-carbon dark:text-beige-arena focus:ring-2 focus:ring-verde-brote focus:outline-none"
          >
            <option value="">Todas las áreas</option>
            <option value="1">Conservación</option>
            <option value="2">Desarrollo comunitario</option>
          </select>
        </div>

        {/* Departamento */}
        <div>
          <label className="block text-xs font-semibold text-gris-piedra dark:text-beige-arena/60 mb-1">Departamento</label>
          <select
            value={departamento ?? ''}
            onChange={(e) => setDepartamento(e.target.value ? Number(e.target.value) : undefined)}
            className="w-full px-3 py-2 rounded-lg text-sm bg-blanco-puro dark:bg-noche-selva border border-carbon/10 dark:border-white/10 text-carbon dark:text-beige-arena focus:ring-2 focus:ring-verde-brote focus:outline-none"
          >
            <option value="">Todos los departamentos</option>
            {(filtros?.departamentos ?? []).filter((d) => d.amazonico).map((d) => (
              <option key={d.id} value={d.id}>{d.nombre}</option>
            ))}
          </select>
        </div>

        {/* Métrica */}
        <div>
          <label className="block text-xs font-semibold text-gris-piedra dark:text-beige-arena/60 mb-1">Métrica del eje X</label>
          <select
            value={metrica}
            onChange={(e) => setMetrica(e.target.value as MetricaKey)}
            className="w-full px-3 py-2 rounded-lg text-sm bg-blanco-puro dark:bg-noche-selva border border-carbon/10 dark:border-white/10 text-carbon dark:text-beige-arena focus:ring-2 focus:ring-verde-brote focus:outline-none"
          >
            {METRICAS.map((m) => (
              <option key={m.key} value={m.key}>{m.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Indicador de filtros activos */}
      {(area !== undefined || departamento !== undefined) && (
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs text-verde-brote font-medium">
            Filtros activos:
            {area === 1 && ' Conservación'}
            {area === 2 && ' Desarrollo comunitario'}
            {departamento && filtros && ` · ${filtros.departamentos.find((d) => d.id === departamento)?.nombre ?? ''}`}
          </span>
          <button
            onClick={() => { setArea(undefined); setDepartamento(undefined); }}
            className="text-xs text-gris-piedra hover:text-terracota underline transition-colors"
          >
            Limpiar
          </button>
        </div>
      )}

      {/* Chart */}
      <motion.div
        key={`${chartType}-${metrica}-${area}-${departamento}`}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {renderChart()}
      </motion.div>

      {/* Summary pills */}
      {!isLoading && rawData && rawData.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-carbon/5 dark:border-white/5">
          <span className="text-xs text-gris-piedra dark:text-beige-arena/50">
            {rawData.length} tipo{rawData.length !== 1 ? 's' : ''} de proyecto · Total: {rawData.reduce((s, t) => s + t.total_proyectos, 0)} proyectos
          </span>
        </div>
      )}
    </Card>
  );
};

// ── Página principal ──────────────────────────────────────────────────────────
const DashboardPage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/images/background/bgDash.jpg)' }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-noche-selva/35" aria-hidden="true" />

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 pt-40 pb-12 min-h-screen space-y-8">
        <div className="bg-beige-arena/80 dark:bg-noche-selva/55 backdrop-blur-md rounded-2xl border border-white/40 dark:border-beige-arena/10 p-6 sm:p-8">
          <h1 className="text-4xl md:text-5xl font-extrabold font-serif text-beige-arena">
            Dashboard de Impacto
          </h1>
          {!isAuthenticated && (
            <p className="text-beige-arena/70 mt-1 text-sm">
              Vista pública — inicia sesión para ver el análisis completo
            </p>
          )}
        </div>

        {isAuthenticated ? <PrivateDashboard /> : <PublicDashboard />}
      </div>
    </div>
  );
};

export default DashboardPage;
