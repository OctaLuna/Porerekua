import { useCallback, useEffect, useState } from 'react';
import { apiClient, ApiError } from '../utils/apiClient';
import type {
  FormOptions,
  FormasJuridicasResponse,
  ApoyosResponse,
  MotivosResponse,
  OdsResponse,
  DepartamentosResponse,
  TiposProyectosResponse,
  AreasResponse,
  AyudasResponse,
  ActoresMunicipalesResponse,
  EspeciesResponse,
  PracticasAgricolasResponse,
  AreasDesarrolloResponse,
  TiposOrganizacionesResponse,
} from '../types/api';

type UseRegistrationFormOptionsResult = {
  data?: FormOptions;
  loading: boolean;
  error?: string;
  reload: () => void;
};

export const emptyOptions: FormOptions = {
  legalForms: [],
  supports: [],
  motives: [],
  ods: [],
  departments: [],
  projectTypes: [],
  projectAreas: [],
  helpTypes: [],
  localActors: [],
  species: [],
  agriculturalPractices: [],
  developmentAreas: [],
  organizationTypes: [],
};

export function useRegistrationFormOptions(): UseRegistrationFormOptionsResult {
  const [data, setData] = useState<FormOptions>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  const fetchOptions = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    console.groupCollapsed('[Catálogos] Cargando opciones de formulario');
    console.log('Solicitando catálogos desde la API...');
    try {
      const [
        legalFormsRes,
        supportsRes,
        motivesRes,
        odsRes,
        departmentsRes,
        projectTypesRes,
        projectAreasRes,
        helpTypesRes,
        localActorsRes,
        speciesRes,
        agriculturalPracticesRes,
        developmentAreasRes,
        organizationTypesRes,
      ] = await Promise.all([
        apiClient.get<FormasJuridicasResponse>('/api/formas-juridicas/forms'),
        apiClient.get<ApoyosResponse>('/api/apoyos/forms'),
        apiClient.get<MotivosResponse>('/api/motivos/forms'),
        apiClient.get<OdsResponse>('/api/ods'),
        apiClient.get<DepartamentosResponse>('/api/departamentos'),
        apiClient.get<TiposProyectosResponse>('/api/tipos-proyectos/forms'),
        apiClient.get<AreasResponse>('/api/areas'),
        apiClient.get<AyudasResponse>('/api/ayudas/forms'),
        apiClient.get<ActoresMunicipalesResponse>('/api/actores-municipales/forms'),
        apiClient.get<EspeciesResponse>('/api/especies-animales/forms'),
        apiClient.get<PracticasAgricolasResponse>('/api/practicas-agricolas/forms'),
        apiClient.get<AreasDesarrolloResponse>('/api/areas-desarrollo'),
        apiClient.get<TiposOrganizacionesResponse>('/api/tipos-organizaciones/forms'),
      ]);

      setData({
        legalForms: legalFormsRes.formasJuridicas ?? [],
        supports: supportsRes.apoyos ?? [],
        motives: motivesRes.motivos ?? [],
        ods: odsRes.ods ?? [],
        departments: departmentsRes.departamentos ?? [],
        projectTypes: projectTypesRes.tiposProyectos ?? [],
        projectAreas: projectAreasRes.areas ?? [],
        helpTypes: helpTypesRes.ayudas ?? [],
        localActors: localActorsRes.actoresMunicipales ?? [],
        species: speciesRes.especiesAnimales ?? [],
        agriculturalPractices: agriculturalPracticesRes.practicasAgricolas ?? [],
        developmentAreas: developmentAreasRes.areasDesarrollo ?? [],
        organizationTypes: organizationTypesRes.tiposOrganizaciones ?? [],
      });
      console.log('Catálogos recibidos', {
        legalForms: legalFormsRes.formasJuridicas?.length ?? 0,
        supports: supportsRes.apoyos?.length ?? 0,
        motives: motivesRes.motivos?.length ?? 0,
        ods: odsRes.ods?.length ?? 0,
        departments: departmentsRes.departamentos?.length ?? 0,
        projectTypes: projectTypesRes.tiposProyectos?.length ?? 0,
        projectAreas: projectAreasRes.areas?.length ?? 0,
        helpTypes: helpTypesRes.ayudas?.length ?? 0,
        localActors: localActorsRes.actoresMunicipales?.length ?? 0,
        species: speciesRes.especiesAnimales?.length ?? 0,
  agriculturalPractices: agriculturalPracticesRes.practicasAgricolas?.length ?? 0,
        developmentAreas: developmentAreasRes.areasDesarrollo?.length ?? 0,
        organizationTypes: organizationTypesRes.tiposOrganizaciones?.length ?? 0,
      });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'No fue posible cargar las opciones del formulario';
      setData(emptyOptions);
      setError(message);
      console.error(err);
    } finally {
      console.groupEnd();
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOptions();
  }, [fetchOptions]);

  return {
    data,
    loading,
    error,
    reload: fetchOptions,
  };
}

export { useRegistrationFormOptions as useEmpresaFormOptions };
