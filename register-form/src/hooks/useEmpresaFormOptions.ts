import { useCallback, useEffect, useState } from 'react';
import { apiClient, ApiError } from '../utils/apiClient';
import type { FormOptions } from '../types/api';
import {
  formasJuridicasResponseSchema,
  apoyosResponseSchema,
  motivosResponseSchema,
  odsResponseSchema,
  departamentosResponseSchema,
  tiposProyectosResponseSchema,
  areasResponseSchema,
  ayudasResponseSchema,
  actoresMunicipalesResponseSchema,
  especiesResponseSchema,
  practicasAgricolasResponseSchema,
  areasDesarrolloResponseSchema,
  tiposOrganizacionesResponseSchema,
} from '../types/api.schema';

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
        apiClient.get('/api/formas-juridicas/forms', formasJuridicasResponseSchema),
        apiClient.get('/api/apoyos/forms', apoyosResponseSchema),
        apiClient.get('/api/motivos/forms', motivosResponseSchema),
        apiClient.get('/api/ods', odsResponseSchema),
        apiClient.get('/api/departamentos', departamentosResponseSchema),
        apiClient.get('/api/tipos-proyectos/forms', tiposProyectosResponseSchema),
        apiClient.get('/api/areas', areasResponseSchema),
        apiClient.get('/api/ayudas/forms', ayudasResponseSchema),
        apiClient.get('/api/actores-municipales/forms', actoresMunicipalesResponseSchema),
        apiClient.get('/api/especies-animales/forms', especiesResponseSchema),
        apiClient.get('/api/practicas-agricolas/forms', practicasAgricolasResponseSchema),
        apiClient.get('/api/areas-desarrollo', areasDesarrolloResponseSchema),
        apiClient.get('/api/tipos-organizaciones/forms', tiposOrganizacionesResponseSchema),
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
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'No fue posible cargar las opciones del formulario';
      setData(emptyOptions);
      setError(message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchOptions();
  }, [fetchOptions]);

  return {
    data,
    loading,
    error,
    reload: () => { void fetchOptions(); },
  };
}

export { useRegistrationFormOptions as useEmpresaFormOptions };
