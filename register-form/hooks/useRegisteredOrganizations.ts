import { useCallback, useEffect, useState } from 'react';
import { apiClient, ApiError } from '../utils/apiClient';
import parseApiError from '../utils/errorHelper';
import type { NamedResource } from '../types/api';

type Result = {
  data?: NamedResource[];
  loading: boolean;
  error?: string;
  reload: () => void;
};

export default function useRegisteredOrganizations(): Result {
  const [data, setData] = useState<NamedResource[]>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    try {
      // Primero intentamos el endpoint de catálogo documentado: /api/organizaciones
      // (este devuelve { organizaciones: [...] } según la especificación).
      try {
        const resAny = await apiClient.get<any>('/api/organizaciones');
        if (resAny && Array.isArray(resAny.organizaciones)) {
          setData(resAny.organizaciones as NamedResource[]);
        } else if (Array.isArray(resAny)) {
          // por si el endpoint devolviera directamente un array
          setData(resAny as NamedResource[]);
        } else {
          // si la respuesta no tiene la forma esperada, dejamos como vacío
          setData([]);
        }
      } catch (e) {
        // Si no existe o falla, intentamos la ruta alternativa usada para POST
        if (e instanceof ApiError && e.status === 404) {
          const fallback = await apiClient.get<any>('/api/formularios/organizaciones');
          if (fallback && Array.isArray(fallback)) {
            setData(fallback as NamedResource[]);
          } else if (fallback && Array.isArray(fallback.organizaciones)) {
            setData(fallback.organizaciones as NamedResource[]);
          } else {
            setData([]);
          }
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
    fetch();
  }, [fetch]);

  return { data, loading, error, reload: fetch };
}
