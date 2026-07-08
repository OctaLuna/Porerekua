export type NamedResource = {
  id: number;
  nombre: string;
};

export type ComunidadIndigenaDto = NamedResource;

export type MunicipioDto = NamedResource & {
  comunidadesIndigenas: ComunidadIndigenaDto[];
};

export type DepartamentoDto = NamedResource & {
  municipios: MunicipioDto[];
};

export type FormasJuridicasResponse = {
  formasJuridicas: NamedResource[];
};

export type ApoyosResponse = {
  apoyos: NamedResource[];
};

export type MotivosResponse = {
  motivos: NamedResource[];
};

export type OdsResponse = {
  ods: NamedResource[];
};

export type TiposProyectosResponse = {
  tiposProyectos: NamedResource[];
};

export type AreasResponse = {
  areas: NamedResource[];
};

export type AyudasResponse = {
  ayudas: NamedResource[];
};

export type ActoresMunicipalesResponse = {
  actoresMunicipales: NamedResource[];
};

export type EspeciesResponse = {
  especiesAnimales: NamedResource[];
};

export type PracticasAgricolasResponse = {
  practicasAgricolas: NamedResource[];
};

export type AreasDesarrolloResponse = {
  areasDesarrollo: NamedResource[];
};

export type DepartamentosResponse = {
  departamentos: DepartamentoDto[];
};

export type FormOptions = {
  legalForms: NamedResource[];
  supports: NamedResource[];
  motives: NamedResource[];
  ods: NamedResource[];
  departments: DepartamentoDto[];
  projectTypes: NamedResource[];
  projectAreas: NamedResource[];
  helpTypes: NamedResource[];
  localActors: NamedResource[];
  species: NamedResource[];
  agriculturalPractices: NamedResource[];
  developmentAreas: NamedResource[];
  organizationTypes: NamedResource[];
};

export type TiposOrganizacionesResponse = {
  tiposOrganizaciones: NamedResource[];
};

export type RegisterFormaJuridicaDto = {
  id: number | null;
  otro: string | null;
};

export type RegisterAyudasDto = {
  seleccionados: number[] | null;
  otros: string[] | null;
};

export type RegisterActoresDto = {
  seleccionados: number[] | null;
  otros: string[] | null;
};

export type RegisterConservacionDto = {
  especies: RegisterAyudasDto;
  practicasAgricolas: RegisterAyudasDto;
};

export type RegisterDesarrolloDto = {
  seleccionados: number[] | null;
  otros: string[] | null;
};

export type RegisterMunicipioTrabajoDto = {
  idMunicipio: number;
  idComunidadIndigena: number | null;
};

export type RegisterTipoDto = {
  id: number | null;
  otros: string | null;
};

export type RegisterProyectosDto = {
  fechaInicio: string;
  fechaFin: string | null;
  nombre: string;
  descripcion: string | null;
  anioInicio: number;
  anioFin: number | null;
  tipo: RegisterTipoDto;
  departamento: number;
  municipiosTrabajo: RegisterMunicipioTrabajoDto[];
  ayudas: RegisterAyudasDto | null;
  actores: RegisterActoresDto | null;
  area: number;
  conservacion: RegisterConservacionDto | null;
  desarrollo: RegisterDesarrolloDto | null;
  organizaciones?: number[] | null;
};

export type RegisterApoyosDto = RegisterAyudasDto;

export type RegisterMotivosApoyosDto = RegisterAyudasDto;

export type RegisterFormularioEmpresaDto = {
  nombre: string;
  formaJuridica: RegisterFormaJuridicaDto;
  departamentos: number[];
  anioInicioApoyo: number;
  apoyos: RegisterApoyosDto;
  organizaciones: string[] | null;
  motivosApoyo: RegisterMotivosApoyosDto | null;
  ods: number[];
  proyectos: RegisterProyectosDto[] | null;
};

export type CommonResponseDto = {
  message: string;
};

export type RegisterFormularioOrganizacionDto = {
  nombre: string;
  idDepartamento: number;
  esNacional: boolean;
  tipo: RegisterTipoDto;
  formaJuridica: RegisterFormaJuridicaDto;
  anioInicioTrabajo: number;
  proyectos: RegisterProyectosDto[] | null;
};
