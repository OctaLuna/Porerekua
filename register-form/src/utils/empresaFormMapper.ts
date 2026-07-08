import type { RegistrationFormData, ProjectFormData, OrganizationFormData } from '../types';
import type {
  RegisterFormularioEmpresaDto,
  RegisterFormularioOrganizacionDto,
  RegisterApoyosDto,
  RegisterProyectosDto,
  RegisterMunicipioTrabajoDto,
  RegisterAyudasDto,
  RegisterConservacionDto,
  RegisterDesarrolloDto,
  RegisterTipoDto,
} from '../types/api';

const parseNumericArray = (values: (string | number | null | undefined)[] | undefined): number[] => (
  values?.map((value) => {
    const numeric = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(numeric) ? numeric : undefined;
  }).filter((value): value is number => typeof value === 'number') ?? []
);

const sanitizeStringArray = (values: (string | null | undefined)[] | undefined): string[] => (
  values?.map((value) => value?.trim()).filter((value): value is string => Boolean(value && value.length > 0)) ?? []
);

const formatDateForApi = (value?: string): string | null => {
  if (!value) {
    return null;
  }
  const [year, month, day] = value.split('-');
  if (year && month && day) {
    return `${day}-${month}-${year}`;
  }
  return value;
};

const mapTipo = (tipo: ProjectFormData['tipo']): RegisterTipoDto => ({
  id: tipo.id ? Number(tipo.id) : null,
  otros: tipo.otros?.trim() || null,
});

const mapMunicipios = (municipios: ProjectFormData['ubicaciones'][number]['municipiosTrabajo']): RegisterMunicipioTrabajoDto[] => (
  municipios
    .map(({ idMunicipio, idComunidadIndigena }) => {
      if (!idMunicipio) {
        return null;
      }
      const municipioId = Number(idMunicipio);
      if (!Number.isFinite(municipioId)) {
        return null;
      }
      const comunidadId = idComunidadIndigena ? Number(idComunidadIndigena) : null;
      return {
        idMunicipio: municipioId,
        idComunidadIndigena: Number.isFinite(comunidadId ?? NaN) ? comunidadId : null,
      };
    })
    .filter((value): value is RegisterMunicipioTrabajoDto => value !== null)
);

const mapApoyos = (value: ProjectFormData['ayudas']): RegisterAyudasDto | null => {
  const seleccionados = parseNumericArray(value?.seleccionados);
  const otros = sanitizeStringArray(value?.otros);
  if (seleccionados.length === 0 && otros.length === 0) {
    return null;
  }
  return {
    seleccionados: seleccionados.length > 0 ? seleccionados : null,
    otros: otros.length > 0 ? otros : null,
  };
};

const mapConservacion = (project: ProjectFormData): RegisterConservacionDto | null => {
  const especiesSeleccionados = parseNumericArray(project.conservacion.especies.seleccionados);
  const especiesOtros = sanitizeStringArray(project.conservacion.especies.otros);
  const practicasSeleccionados = parseNumericArray(project.conservacion.practicasAgricolas.seleccionados);
  const practicasOtros = sanitizeStringArray(project.conservacion.practicasAgricolas.otros);

  if (especiesSeleccionados.length === 0 && especiesOtros.length === 0 && practicasSeleccionados.length === 0 && practicasOtros.length === 0) {
    return null;
  }

  return {
    especies: {
      seleccionados: especiesSeleccionados.length > 0 ? especiesSeleccionados : null,
      otros: especiesOtros.length > 0 ? especiesOtros : null,
    },
    practicasAgricolas: {
      seleccionados: practicasSeleccionados.length > 0 ? practicasSeleccionados : null,
      otros: practicasOtros.length > 0 ? practicasOtros : null,
    },
  };
};

const mapDesarrollo = (project: ProjectFormData): RegisterDesarrolloDto | null => {
  const seleccionados = parseNumericArray(project.desarrollo.seleccionados);
  const otros = sanitizeStringArray(project.desarrollo.otros);
  if (seleccionados.length === 0 && otros.length === 0) {
    return null;
  }
  return {
    seleccionados: seleccionados.length > 0 ? seleccionados : null,
    otros: otros.length > 0 ? otros : null,
  };
};

const mapProyecto = (project: ProjectFormData): RegisterProyectosDto[] | null => {
  if (!project.nombre?.trim()) {
    return null;
  }

  if (!project.area) {
    return null;
  }
  const area = Number(project.area);
  if (!Number.isFinite(area)) {
    return null;
  }

  // Map organizaciones relacionadas (IDs en string) a números
  const organizacionesRelacionadas = parseNumericArray(project.organizacionesRelacionadas ?? []);

  const base = {
    fechaInicio: formatDateForApi(project.fechaInicio) ?? '',
    fechaFin: formatDateForApi(project.fechaFin),
    nombre: project.nombre.trim(),
    descripcion: project.descripcion?.trim() || null,
    anioInicio: project.anioInicio,
    anioFin: project.anioFin ?? null,
    tipo: mapTipo(project.tipo),
    ayudas: mapApoyos(project.ayudas),
    actores: mapApoyos(project.actores),
    area,
    conservacion: mapConservacion(project),
    desarrollo: mapDesarrollo(project),
    organizaciones: organizacionesRelacionadas.length > 0 ? organizacionesRelacionadas : null,
  } as Omit<RegisterProyectosDto, 'departamento' | 'municipiosTrabajo'>;

  const results: RegisterProyectosDto[] = [];

  (project.ubicaciones ?? []).forEach((ubic) => {
    if (!ubic.departamento) return; // skip invalid ubicacion
    const departamento = Number(ubic.departamento);
    if (!Number.isFinite(departamento)) return; // skip invalid ubicacion

    const municipiosTrabajo = mapMunicipios(ubic.municipiosTrabajo);
    if (municipiosTrabajo.length === 0) return; // skip if no municipios

    results.push({
      ...base,
      departamento,
      municipiosTrabajo,
    });
  });

  return results.length > 0 ? results : null;
};

const mapApoyosEmpresa = (apoyos: RegistrationFormData['apoyos']): RegisterApoyosDto => {
  const seleccionados = parseNumericArray(apoyos?.seleccionados);
  const otros = sanitizeStringArray(apoyos?.otros);
  return {
    seleccionados: seleccionados.length > 0 ? seleccionados : null,
    otros: otros.length > 0 ? otros : null,
  };
};

export const mapEmpresaFormToDto = (form: RegistrationFormData): RegisterFormularioEmpresaDto => {
  const departamentos = parseNumericArray(form.departamentos);
  const proyectos = form.proyectos?.flatMap((p) => mapProyecto(p) ?? []) ?? [];
  // company-level organizaciones no se recolectan aquí (se registran por proyecto)
  const motivosSeleccionados = parseNumericArray(form.motivosApoyo?.seleccionados);
  const motivosOtros = sanitizeStringArray(form.motivosApoyo?.otros);
  const motivosApoyo = (motivosSeleccionados.length > 0 || motivosOtros.length > 0)
    ? {
        seleccionados: motivosSeleccionados.length > 0 ? motivosSeleccionados : null,
        otros: motivosOtros.length > 0 ? motivosOtros : null,
      }
    : null;

  return {
    nombre: form.nombre.trim(),
    formaJuridica: {
      id: form.formaJuridica.id && form.formaJuridica.id !== '' && form.formaJuridica.id !== '__other__' ? Number(form.formaJuridica.id) : null,
      otro: form.formaJuridica.otro?.trim() || null,
    },
    departamentos,
    anioInicioApoyo: form.anioInicioApoyo ?? new Date().getFullYear(),
    apoyos: mapApoyosEmpresa(form.apoyos),
    organizaciones: null,
    motivosApoyo,
    ods: parseNumericArray(form.ods),
    proyectos: proyectos.length > 0 ? proyectos : null,
  };
};

export const mapOrganizationFormToDto = (form: OrganizationFormData): RegisterFormularioOrganizacionDto => {
  const departamentoId = Number(form.idDepartamento);
  const proyectos = form.proyectos?.flatMap((p) => mapProyecto(p) ?? []) ?? [];
  const tipoId = Number(form.tipo.id);

  return {
    nombre: form.nombre.trim(),
    idDepartamento: Number.isFinite(departamentoId) ? departamentoId : 0,
    esNacional: form.esNacional === 'Si',
    tipo: {
      id: Number.isFinite(tipoId) ? tipoId : null,
      otros: form.tipo.otros?.trim() || null,
    },
    formaJuridica: {
      id: form.formaJuridica.id && form.formaJuridica.id !== '' && form.formaJuridica.id !== '__other__' ? Number(form.formaJuridica.id) : null,
      otro: form.formaJuridica.otro?.trim() || null,
    },
    anioInicioTrabajo: form.anioInicioTrabajo ?? new Date().getFullYear(),
    proyectos: proyectos.length > 0 ? proyectos : null,
  };
};
