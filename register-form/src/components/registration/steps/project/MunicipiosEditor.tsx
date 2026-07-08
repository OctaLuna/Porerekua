import React from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import type { ProjectFormContext, ProjectUbicacionForm } from '../../../../types';
import type { DepartamentoDto } from '../../../../types/api';
import Select from '../../../ui/Select';
import Button from '../../../ui/Button';
import { getUsedComunidadIds, isMunicipioDuplicated } from '../../../../utils/projectLocationValidation';

type MunicipiosEditorProps = {
  proyectoIndex: number;
  ubicacionIndex: number;
  departments: DepartamentoDto[];
};

// Subcomponente que gestiona los municipios dentro de una ubicación (departamento)
const MunicipiosEditor: React.FC<MunicipiosEditorProps> = ({ proyectoIndex, ubicacionIndex, departments }) => {
  const { control, register, watch } = useFormContext<ProjectFormContext>();
  const { fields: municipioFields, append: appendMunicipio, remove: removeMunicipio } = useFieldArray({
    control,
    name: `proyectos.${proyectoIndex}.ubicaciones.${ubicacionIndex}.municipiosTrabajo` as const,
  });

  // Watch all ubicaciones for this proyecto to compute duplicates across the project
  const ubicacionesAll = (watch(`proyectos.${proyectoIndex}.ubicaciones`) as ProjectUbicacionForm[] | undefined) ?? [];
  const departmentId = watch(`proyectos.${proyectoIndex}.ubicaciones.${ubicacionIndex}.departamento` as const);
  const selectedDepartment = departments.find(({ id }) => String(id) === departmentId);

  return (
    <div>
      {municipioFields.map((field, municipioIndex) => {
        const currentSelectedMunicipio = watch(`proyectos.${proyectoIndex}.ubicaciones.${ubicacionIndex}.municipiosTrabajo.${municipioIndex}.idMunicipio` as const) ?? '';
        const currentSelectedComunidad = watch(`proyectos.${proyectoIndex}.ubicaciones.${ubicacionIndex}.municipiosTrabajo.${municipioIndex}.idComunidadIndigena` as const) ?? '';

        const usedComunidadIds = getUsedComunidadIds(ubicacionesAll, ubicacionIndex, municipioIndex);

        return (
          <div key={field.id} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end mb-2">
            <Select
              label="Municipio"
              {...register(`proyectos.${proyectoIndex}.ubicaciones.${ubicacionIndex}.municipiosTrabajo.${municipioIndex}.idMunicipio` as const, {
                required: 'Seleccione el municipio',
                validate: (val: string) => {
                  if (!val) return true;
                  // if same municipio selected elsewhere with same comunidad (including empty), it's invalid
                  const duplicate = isMunicipioDuplicated(ubicacionesAll, ubicacionIndex, municipioIndex, val, currentSelectedComunidad ?? '');
                  return !duplicate || 'Este municipio ya fue seleccionado con la misma comunidad indígena';
                }
              })}
            >
              <option value="">Seleccione...</option>
              {selectedDepartment?.municipios?.map(({ id, nombre }) => (
                <option
                  key={id}
                  value={String(id)}
                  disabled={isMunicipioDuplicated(ubicacionesAll, ubicacionIndex, municipioIndex, String(id), currentSelectedComunidad ?? '')}
                >
                  {nombre}
                </option>
              ))}
            </Select>

            <Select
              label="Comunidad indígena (opcional)"
              {...register(`proyectos.${proyectoIndex}.ubicaciones.${ubicacionIndex}.municipiosTrabajo.${municipioIndex}.idComunidadIndigena` as const, {
                validate: (val: string | undefined) => {
                  if (!val) return true;
                  // if this comunidad is already used elsewhere, invalid
                  const isUsedElsewhere = usedComunidadIds.has(String(val));
                  return !isUsedElsewhere || 'Esta comunidad indígena ya fue seleccionada en este proyecto';
                }
              })}
            >
              <option value="">Seleccione...</option>
              {selectedDepartment?.municipios?.flatMap(({ id, comunidadesIndigenas }) =>
                String(id) === currentSelectedMunicipio ? comunidadesIndigenas.map(({ id: comunidadId, nombre }) => (
                  <option key={comunidadId} value={String(comunidadId)} disabled={usedComunidadIds.has(String(comunidadId))}>{nombre}</option>
                )) : []
              )}
            </Select>

            <div className="md:col-span-2 flex justify-end">
              <Button type="button" variant="destructive" size="sm" onClick={() => removeMunicipio(municipioIndex)} disabled={municipioFields.length === 1}>
                Quitar
              </Button>
            </div>
          </div>
        );
      })}

      <Button type="button" variant="secondary" onClick={() => appendMunicipio({ idMunicipio: '', idComunidadIndigena: '' })}>
        + Añadir municipio
      </Button>
    </div>
  );
};

export default MunicipiosEditor;
