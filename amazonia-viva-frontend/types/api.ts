// ─────────────────────────────────────────────────────────────────────────────
// Tipos del backend real (api-rest-amazonia). Ver docs/CONTRATO_API.md.
// ─────────────────────────────────────────────────────────────────────────────

/** Sobre de paginación estándar del backend. */
export interface Paginated<T> {
  data: T[];
  page: number;
  limit: number;
  pages: number;
  total: number;
  has_next: boolean;
  has_prev: boolean;
}

/** Referencia catálogo { id, nombre } (tipo, area, ods, etc.). */
export interface Ref {
  id: number;
  nombre: string;
}

// ── Proyectos ────────────────────────────────────────────────────────────────

/** GET /proyectos (sin token): tarjeta resumida. */
export interface ProyectoCard {
  id: number;
  nombre: string;
  descripcionCorta: string | null;
  imagenPrincipalUrl: string | null;
  tipo: Ref | null;
  area: Ref | null;
  departamento: string | null;
}

/** GET /proyectos/map: proyecto con coordenadas (lat/lng llegan como string). */
export interface ProyectoMap {
  id: number;
  nombre: string;
  descripcion: string;
  anioInicio: number | null;
  anioFin: number | null;
  imagenPrincipalUrl: string | null;
  lat: string;
  lng: string;
  department: string | null;
  municipality: string | null;
  area: Ref | null;
  tipo: Ref | null;
}

/** GET /proyectos/filtros-disponibles. */
export interface ProyectoFiltros {
  areas: Ref[];
  tipos: Ref[];
  departamentos: Ref[];
  municipios: Array<Ref & { idDepartamento: number }>;
}

// ── Organizaciones / Empresas ────────────────────────────────────────────────

export interface OrganizacionCard {
  id: number;
  nombre: string;
  tipo: Ref | null;
  logoUrl: string | null;
  departamento: string | null;
  esNacional: boolean;
}

export interface EmpresaCard {
  id: number;
  nombre: string;
  formaJuridica: Ref | null;
  logoUrl: string | null;
  departamento: string | null;
}

/** GET /organizaciones/filtros-disponibles. */
export interface OrganizacionFiltros {
  tipos: Ref[];
  departamentos: Ref[];
}

/** GET /empresas/filtros-disponibles. */
export interface EmpresaFiltros {
  formas_juridicas: Ref[];
  departamentos: Ref[];
}

// ── Formularios públicos de alta (POST /formularios/*) ───────────────────────

/** Selección de catálogo: un id existente o un valor escrito ("otro"). */
export interface SelectConOtro {
  id?: number;
  otro?: string;
}

/** POST /formularios/organizaciones. */
export interface RegisterFormularioOrganizacion {
  nombre: string;
  idDepartamento: number;
  esNacional: boolean;
  tipo: SelectConOtro;
  anioInicioTrabajo: number;
}

/** POST /formularios/empresas. */
export interface RegisterFormularioEmpresa {
  nombre: string;
  formaJuridica: SelectConOtro;
  departamentos: number[];
  anioInicioApoyo: number;
  apoyos: { seleccionados?: number[]; otros?: string[] };
  motivosApoyo: { seleccionados?: number[]; otros?: string[] };
  ods: number[];
  organizaciones?: string[];
}

// ── Detalles (requieren token; la API envuelve cada uno en su clave) ──────────

/** Proyecto mini embebido en los detalles de organización/empresa. */
export interface ProyectoResumen {
  id: number;
  nombre: string;
  descripcion: string | null;
  imagenPrincipalUrl: string | null;
  anioInicio?: number | null;
  anioFin?: number | null;
  idArea?: number;
}

export interface EmpresaResumen {
  id: number;
  nombre: string;
  logoUrl: string | null;
  anioInicioApoyo: number | null;
}

export interface OrganizacionResumen {
  id: number;
  nombre: string;
  logoUrl: string | null;
  esNacional: boolean;
  anioInicioTrabajo: number | null;
}

export interface LocalidadProyecto {
  id: number;
  municipio: {
    id: number;
    nombre: string;
    departamento: { id: number; nombre: string; amazonico: boolean };
  };
  comunidad: { id: number; nombre: string } | null;
}

export interface ProyectoImagen {
  id: string;
  url: string;
  descripcion: string | null;
  orden: number;
}

/** GET /proyectos/:id → { proyecto }. Full detail with all relations. */
export interface ProyectoDetalle {
  id: number;
  nombre: string;
  descripcion: string | null;
  anioInicio: number | null;
  anioFin: number | null;
  imagenPrincipalUrl: string | null;
  lat: string | null;
  lng: string | null;
  department: string | null;
  municipality: string | null;
  georefFailed: boolean;
  area: Ref | null;
  tipo: Ref | null;
  ayudas: Ref[];
  actoresMunicipales: Ref[];
  especiesAnimales: Ref[];
  practicasAgricolas: Ref[];
  areasDesarrollo: Ref[];
  localidadesProyectos: LocalidadProyecto[];
  imagenes: ProyectoImagen[];
  proyectosEmpresas: Array<{
    idParticipacion: number;
    fechaInicio: string;
    fechaFin: string | null;
    empresa: EmpresaResumen;
  }>;
  proyectosOrganizaciones: Array<{
    idParticipacion: number;
    fechaInicio: string;
    fechaFin: string | null;
    organizacion: OrganizacionResumen;
  }>;
}

/** GET /organizaciones/:id → { organizacion }. */
export interface OrganizacionDetalle {
  id: number;
  nombre: string;
  esNacional: boolean;
  anioInicioTrabajo: number | null;
  logoUrl: string | null;
  tipo: Ref | null;
  departamento: Ref | null;
  proyectosOrganizaciones: Array<{
    idParticipacion: number;
    fechaInicio: string;
    fechaFin: string | null;
    proyecto: ProyectoResumen;
  }>;
  organizacionesEmpresas: Array<{
    empresa: EmpresaResumen;
  }>;
}

/** GET /empresas/:id → { empresa }. */
export interface EmpresaDetalle {
  id: number;
  nombre: string;
  anioInicioApoyo: number | null;
  logoUrl: string | null;
  formaJuridica: Ref | null;
  motivos: Ref[];
  apoyos: Ref[];
  ods: Ref[];
  departamentos: Ref[];
  proyectosEmpresas: Array<{
    idParticipacion: number;
    fechaInicio: string;
    fechaFin: string | null;
    proyecto: ProyectoResumen;
  }>;
  organizacionesEmpresas: Array<{
    organizacion: OrganizacionResumen;
  }>;
}

// ── Auth ─────────────────────────────────────────────────────────────────────

export enum RoleEnum {
  Superadmin = 1,
  Admin = 2,
  Investigador = 3,
}

export interface AuthToken {
  accessToken: string;
  tipo: string;
  expiresIn: string;
}

export interface Usuario {
  id: number;
  email: string;
  nombre: string;
  rol: RoleEnum;
  activo: boolean;
  fechaExpiracion: string | null;
  createdAt: string;
  updatedAt: string;
}

// ── Solicitudes de acceso ────────────────────────────────────────────────────

export interface CrearSolicitud {
  nombreSolicitante: string;
  emailSolicitante: string;
  institucion: string;
  proposito: string;
}

export type EstadoSolicitud = 'pendiente' | 'aprobada' | 'rechazada';

/** GET /auth/solicitudes (item). */
export interface Solicitud {
  id: number;
  nombreSolicitante: string;
  emailSolicitante: string;
  institucion: string;
  proposito: string;
  estado: EstadoSolicitud;
  fechaExpiracionAcceso: string | null;
  idRevisor: number | null;
  idUsuarioCreado: number | null;
  notaRechazo: string | null;
  fechaRevision: string | null;
  createdAt: string;
}

/** PATCH /auth/solicitudes/:id/aprobar. */
export interface AprobarSolicitud {
  fechaExpiracionAcceso: string; // ISO 8601
  passwordTemporal: string;
}

/** PATCH /auth/solicitudes/:id/rechazar. */
export interface RechazarSolicitud {
  notaRechazo?: string;
}

// ── Gestión de usuarios (Admin) ──────────────────────────────────────────────

/** POST /auth/register. */
export interface RegisterUsuario {
  email: string;
  nombre: string;
  password: string;
  rol: RoleEnum;
}

/** PATCH /auth/usuarios/:id. */
export interface UpdateUsuario {
  nombre?: string;
  rol?: RoleEnum;
  activo?: boolean;
}

// ── Dashboard filtros disponibles ────────────────────────────────────────────

/** GET /dashboard/filtros-disponibles */
export interface DashboardFiltrosDisponibles {
  departamentos: Array<{ id: number; nombre: string; amazonico: boolean }>;
  tipos_proyecto: Ref[];
  areas_proyecto: Ref[];
  tipos_ayuda: Ref[];
  actores_municipales: Ref[];
  comunidades_indigenas: Ref[];
  formas_juridicas: Ref[];
  motivos_apoyo: Ref[];
  tipos_apoyo: Ref[];
  ods: Ref[];
  tipos_organizacion: Ref[];
  rango_anios: { desde: number; hasta: number };
}

// ── Publicaciones ─────────────────────────────────────────────────────────────

export type TipoBloque = 'subtitulo' | 'parrafo' | 'imagen';

export interface BloqueContenido {
  tipo: TipoBloque;
  texto?: string;
  url?: string;
  descripcion?: string;
}

export interface PublicacionImagenApi {
  id: string;
  url: string;
  descripcion: string | null;
  orden: number;
}

export interface AutorResumen {
  id: number;
  nombre: string;
}

/** GET /publicaciones (list) */
export interface PublicacionCard {
  id: string;
  titulo: string;
  slug: string;
  estado: 'borrador' | 'publicado';
  fechaCreacion: string;
  fechaPublicacion: string | null;
  autor: AutorResumen;
  imagenes: PublicacionImagenApi[];
}

/** GET /publicaciones/:slug */
export interface PublicacionDetalle {
  id: string;
  titulo: string;
  slug: string;
  contenido: BloqueContenido[];
  estado: 'borrador' | 'publicado';
  fechaCreacion: string;
  fechaUltimaEdicion: string | null;
  fechaPublicacion: string | null;
  autorId: number;
  editadoPorId: number | null;
  autor: AutorResumen;
  imagenes: PublicacionImagenApi[];
}

/** POST /publicaciones */
export interface CrearPublicacion {
  titulo: string;
  contenido: BloqueContenido[];
  estado?: 'borrador' | 'publicado';
}

/** PATCH /publicaciones/:id */
export interface EditarPublicacion {
  titulo?: string;
  contenido?: BloqueContenido[];
  estado?: 'borrador' | 'publicado';
}

// ── Dashboard público (sin token) ────────────────────────────────────────────

/** GET /dashboard/publico/resumen */
export interface DashboardPublicoResumen {
  total_proyectos: number;
  total_empresas: number;
  total_organizaciones: number;
  proyectos_activos: number;
  departamentos_con_actividad: number;
}

/** GET /dashboard/publico/por-region (array) */
export interface DashboardPublicoPorRegion {
  departamento: string;
  total_proyectos: number;
  total_empresas: number;
  amazonico: boolean;
}

// ── Logs de auditoría (Admin+) ───────────────────────────────────────────────

export type TipoLog = 'aplicacion' | 'seguridad';
export type SeveridadLog = 'info' | 'warn' | 'error' | 'critico';

export interface LogAuditoria {
  id: string;
  tipo: TipoLog;
  severidad: SeveridadLog;
  usuarioId: number | null;
  accion: string;
  detalle: Record<string, unknown> | null;
  ipOrigen: string | null;
  createdAt: string;
}

export interface FiltrosLogs {
  tipo?: TipoLog;
  severidad?: SeveridadLog;
  usuario_id?: number;
  fecha_desde?: string;
  fecha_hasta?: string;
  page?: number;
  limit?: number;
}

// ── Dashboard (requieren token) ──────────────────────────────────────────────

/** GET /dashboard/resumen. */
export interface DashboardResumen {
  total_empresas: number;
  total_organizaciones: number;
  total_proyectos: number;
  proyectos_conservacion: number;
  proyectos_desarrollo: number;
  proyectos_activos: number;
  proyectos_finalizados: number;
  empresas_con_proyectos: number;
  organizaciones_con_proyectos: number;
  departamentos_amazonicos: number;
  municipios_cubiertos: number;
  comunidades_indigenas_beneficiadas: number;
  organizaciones_nacionales: number;
  organizaciones_internacionales: number;
  total_ods_cubiertos: number;
  anio_inicio_mas_antiguo: number;
  anio_inicio_mas_reciente: number;
  ultima_actualizacion: string;
}

/** GET /dashboard/por-region (array). */
export interface DashboardPorRegion {
  id_departamento: number;
  departamento: string;
  amazonico: boolean;
  total_empresas: number;
  total_organizaciones: number;
  total_proyectos: number;
  proyectos_conservacion: number;
  proyectos_desarrollo: number;
}

/** GET /dashboard/por-tipo (array). */
export interface DashboardPorTipo {
  id_area: number;
  area: string;
  id_tipo: number;
  tipo_proyecto: string;
  total_proyectos: number;
  proyectos_activos: number;
  proyectos_finalizados: number;
  empresas_participantes: number;
  organizaciones_participantes: number;
  departamentos_cubiertos: number;
}

/** GET /dashboard/timeline (array). */
export interface DashboardTimeline {
  anio: number;
  nuevas_empresas: number;
  nuevas_organizaciones: number;
  nuevos_proyectos: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Tipos legados del mock (en inglés). @deprecated — se eliminan al migrar cada
// módulo a los tipos reales de arriba. No usar en código nuevo.
// ─────────────────────────────────────────────────────────────────────────────

/** @deprecated usar ProyectoCard / ProyectoMap. */
export interface Project {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  location: {
    lat: number;
    lng: number;
  };
  tags: string[];
  foundationId: string;
}

/** @deprecated usar OrganizacionCard / EmpresaCard. */
export interface Foundation {
  id: string;
  name: string;
  description: string;
  logoUrl: string;
}

/** @deprecated sin módulo backend equivalente (ver gap en docs/CONTRATO_API.md §7). */
export interface Investigation {
  id: string;
  title: string;
  authors: string[];
  summary: string;
  imageUrl: string;
  pdfUrl: string;
}