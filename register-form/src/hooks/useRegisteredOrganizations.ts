import { useCallback, useEffect, useState } from 'react';
import { apiClient, ApiError } from '../utils/apiClient';
import parseApiError from '../utils/errorHelper';
import type { NamedResource } from '../types/api';
import { organizacionesCatalogSchema } from '../types/api.schema';

type Result = {
  data?: NamedResource[];
  loading: boolean;
  error?: string;
  reload: () => void;
};

const extractOrganizaciones = (payload: NamedResource[] | { organizaciones: NamedResource[] }): NamedResource[] => (
  Array.isArray(payload) ? payload : payload.organizaciones
);

export default function useRegisteredOrganizations(): Result {
  const [data, setData] = useState<NamedResource[]>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  const fetchOrganizations = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    try {
      // Primero intentamos el endpoint de catálogo documentado: /api/organizaciones
      // (este devuelve { organizaciones: [...] } según la especificación).
      try {
        const res = await apiClient.get('/api/organizaciones', organizacionesCatalogSchema);
        setData(extractOrganizaciones(res));
      } catch (e) {
        // Si no existe o falla, intentamos la ruta alternativa usada para POST
        if (e instanceof ApiError && e.status === 404) {
          const fallback = await apiClient.get('/api/formularios/organizaciones', organizacionesCatalogSchema);
          setData(extractOrganizaciones(fallback));
        } else {
          throw e;
        }
      }
    } catch (err) {
      const parsed = parseApiError(err);
      // Si el servidor respondió 404 o el catálogo está vacío damos un mensaje claro
      if (err instanceof ApiError && err.status === 404) {
        setError('Aún no hay organizaciones registradas. Puedes crear una desde "Registrar Organización".');
      } else {
        setError(parsed.userMessage || 'No fue posible cargar las organizaciones registradas');
      }
      setData([]);
      // Mantener detalles técnicos en consola para debugging
      console.error('useRegisteredOrganizations error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchOrganizations();
  }, [fetchOrganizations]);

  return { data, loading, error, reload: () => { void fetchOrganizations(); } };
}
