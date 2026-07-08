import type { ProjectUbicacionForm } from '../types';

/**
 * true si `value` ya fue seleccionado como departamento en otra ubicación
 * del mismo proyecto (excluyendo la ubicación en `currentIndex`).
 */
export const isDepartamentoDuplicated = (
  ubicaciones: ProjectUbicacionForm[],
  currentIndex: number,
  value: string,
): boolean => ubicaciones.some((u, i) => i !== currentIndex && String(u.departamento) === String(value));

/**
 * IDs de comunidad indígena ya usados en cualquier municipio del proyecto,
 * excluyendo la fila (ubicacionIndex, municipioIndex) que se está editando.
 */
export const getUsedComunidadIds = (
  ubicaciones: ProjectUbicacionForm[],
  ubicacionIndex: number,
  municipioIndex: number,
): Set<string> => {
  const used = new Set<string>();
  ubicaciones.forEach((u, ui) => {
    (u.municipiosTrabajo ?? []).forEach((m, mi) => {
      if (ui === ubicacionIndex && mi === municipioIndex) return;
      if (m.idComunidadIndigena) used.add(String(m.idComunidadIndigena));
    });
  });
  return used;
};

/**
 * true si la combinación (municipioId, comunidadId) ya existe en otra fila
 * de municipiosTrabajo del proyecto, excluyendo la fila que se está editando.
 */
export const isMunicipioDuplicated = (
  ubicaciones: ProjectUbicacionForm[],
  ubicacionIndex: number,
  municipioIndex: number,
  municipioId: string,
  comunidadId: string,
): boolean => ubicaciones.some((u, ui) => (
  (u.municipiosTrabajo ?? []).some((m, mi) => {
    if (ui === ubicacionIndex && mi === municipioIndex) return false;
    const mid = String(m.idMunicipio ?? '');
    const cid = String(m.idComunidadIndigena ?? '');
    return mid === String(municipioId) && cid === String(comunidadId);
  })
));
