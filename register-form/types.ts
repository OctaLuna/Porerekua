import React from 'react';

export type Section = {
  id: string;
  title: string;
  ref: React.RefObject<HTMLDivElement>;
};

export type FormStringArray = string[];

export type ProjectMunicipioTrabajoForm = {
  idMunicipio: string;
  idComunidadIndigena?: string;
};

export type ProjectUbicacionForm = {
  departamento: string;
  municipiosTrabajo: ProjectMunicipioTrabajoForm[];
};

export type ProjectAyudaForm = {
  seleccionados: FormStringArray;
  otros: FormStringArray;
};

export type ProjectConservacionForm = {
  especies: ProjectAyudaForm;
  practicasAgricolas: ProjectAyudaForm;
};

export type ProjectDesarrolloForm = {
  seleccionados: FormStringArray;
  otros: FormStringArray;
};

export type ProjectTipoForm = {
  id?: string;
  otros?: string;
};

export type ProjectFormData = {
  nombre: string;
  descripcion?: string;
  fechaInicio: string;
  fechaFin?: string;
  anioInicio: number;
  anioFin?: number;
  tipo: ProjectTipoForm;
  // Ahora soportamos múltiples ubicaciones: varios departamentos cada uno con varios municipios
  ubicaciones: ProjectUbicacionForm[];
  ayudas: ProjectAyudaForm;
  actores: ProjectAyudaForm;
  area: string;
  conservacion: ProjectConservacionForm;
  desarrollo: ProjectDesarrolloForm;
  // IDs de organizaciones ya registradas (seleccionadas desde el catálogo de organizaciones)
  organizacionesRelacionadas?: string[];
};

export type ProjectFormContext = {
  proyectos: ProjectFormData[];
};

export type RegistrationFormData = {
  nombre: string;
  cargo?: string;
  formaJuridica: {
    id?: string;
    otro?: string;
  };
  departamentos: FormStringArray;
  haApoyado?: 'Si' | 'No' | 'No, pero tiene intención';
  anioInicioApoyo?: number;
  apoyos: ProjectAyudaForm;
  motivosApoyo: ProjectAyudaForm;
  ods: FormStringArray;
  // Área seleccionada en el paso de Áreas de Trabajo
  workArea?: string;
  // Selección de sub-áreas cuando workArea === 'Desarrollo de Comunidades Indígenas'
  communityDevTypes?: FormStringArray;
  proyectos: ProjectFormData[];
};

export type OrganizationFormData = {
  nombre: string;
  tipo: {
    id?: string;
    otros?: string;
  };
  formaJuridica: {
    id?: string;
    otro?: string;
  };
  idDepartamento: string;
  esNacional?: 'Si' | 'No';
  anioInicioTrabajo?: number;
  proyectos: ProjectFormData[];
};