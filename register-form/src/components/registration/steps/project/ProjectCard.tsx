import React, { useEffect, useMemo } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import type { Path } from 'react-hook-form';
import type { ProjectFormContext, ProjectUbicacionForm } from '../../../../types';
import Input from '../../../ui/Input';
import Select from '../../../ui/Select';
import Checkbox from '../../../ui/Checkbox';
import Button from '../../../ui/Button';
import ProjectLocationMapPicker from '../../ProjectLocationMapPicker';
import { isDepartamentoDuplicated } from '../../../../utils/projectLocationValidation';
import MunicipiosEditor from './MunicipiosEditor';
import ProjectOrgsSelector from './ProjectOrgsSelector';
import type { Step5Props } from './types';

const OTHER_OPTION = '__other__';

type ProjectCardProps = Step5Props & {
  index: number;
  onRemove: () => void;
};

const ProjectCard: React.FC<ProjectCardProps> = ({ index, onRemove, departments, projectTypes, projectAreas, helpTypes, localActors, species, agriculturalPractices, developmentAreas }) => {
  const { control, register, watch, setValue, formState: { errors } } = useFormContext<ProjectFormContext>();
  const { fields: ubicacionesFields, append: appendUbicacion, remove: removeUbicacion } = useFieldArray({
    control,
    name: `proyectos.${index}.ubicaciones` as const,
  });

  // valores actuales de las ubicaciones para este proyecto (usado para validar duplicados)
  const ubicacionesValues = (watch(`proyectos.${index}.ubicaciones`) as ProjectUbicacionForm[] | undefined) ?? [];

  const projectAreaId = watch(`proyectos.${index}.area`);
  const ayudasOtros = (watch(`proyectos.${index}.ayudas.otros`) as string[] | undefined) ?? [];
  const actoresOtros = (watch(`proyectos.${index}.actores.otros`) as string[] | undefined) ?? [];
  const conservacionEspeciesOtros = (watch(`proyectos.${index}.conservacion.especies.otros`) as string[] | undefined) ?? [];
  const conservacionPracticasOtros = (watch(`proyectos.${index}.conservacion.practicasAgricolas.otros`) as string[] | undefined) ?? [];
  const desarrolloOtros = (watch(`proyectos.${index}.desarrollo.otros`) as string[] | undefined) ?? [];

  const areaInfo = useMemo(() => projectAreas.find(({ id }) => String(id) === projectAreaId), [projectAreas, projectAreaId]);

  const isConservation = areaInfo?.nombre?.toLowerCase().includes('conserv');
  const isDevelopment = areaInfo?.nombre?.toLowerCase().includes('desarrollo');

  const addOtrosEntry = (path: Path<ProjectFormContext>, current: string[]) => {
    setValue(path, [...current, '']);
  };

  const removeOtrosEntry = (path: Path<ProjectFormContext>, current: string[], entryIndex: number) => {
    setValue(path, current.filter((_, idx) => idx !== entryIndex));
  };

  const projectErrors = errors.proyectos?.[index];

  const selectedTipoId = watch(`proyectos.${index}.tipo.id` as const);
  useEffect(() => {
    if (!isConservation) {
      setValue(`proyectos.${index}.conservacion.especies.seleccionados`, []);
      setValue(`proyectos.${index}.conservacion.especies.otros`, []);
      setValue(`proyectos.${index}.conservacion.practicasAgricolas.seleccionados`, []);
      setValue(`proyectos.${index}.conservacion.practicasAgricolas.otros`, []);
    }
    if (!isDevelopment) {
      setValue(`proyectos.${index}.desarrollo.seleccionados`, []);
      setValue(`proyectos.${index}.desarrollo.otros`, []);
    }
  }, [index, isConservation, isDevelopment, setValue]);

  return (
    <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 rounded-lg relative animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-bold text-heading-primary dark:text-gray-600">Proyecto #{index + 1}</h4>
        <Button variant="destructive" size="sm" type="button" onClick={onRemove}>
          Eliminar
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        <Input
          label="Nombre del proyecto"
          {...register(`proyectos.${index}.nombre` as const, { required: 'El nombre es requerido.' })}
          error={projectErrors?.nombre?.message}
          className="md:col-span-2"
        />

        <Input
          label="Descripción (opcional)"
          {...register(`proyectos.${index}.descripcion` as const)}
          className="md:col-span-2"
        />

        <Input
          label="Fecha de inicio"
          type="date"
          {...register(`proyectos.${index}.fechaInicio` as const, {
            required: 'La fecha inicial es requerida',
            validate: (val: string) => {
              if (!val) return 'La fecha inicial es requerida';
              const selected = new Date(val);
              const today = new Date();
              selected.setHours(0,0,0,0);
              today.setHours(0,0,0,0);
              return selected.getTime() <= today.getTime() || 'La fecha de inicio no puede ser posterior a hoy';
            }
          })}
          error={projectErrors?.fechaInicio?.message}
        />

        <Input
          label="Fecha de fin (opcional)"
          type="date"
          {...register(`proyectos.${index}.fechaFin` as const, {
            validate: (val: string | undefined) => {
              if (!val) return true;
              const startVal = watch(`proyectos.${index}.fechaInicio`);
              if (!startVal) return true;
              const start = new Date(startVal);
              const end = new Date(val);
              start.setHours(0,0,0,0);
              end.setHours(0,0,0,0);
              return end.getTime() >= start.getTime() || 'La fecha de fin no puede ser anterior a la fecha de inicio';
            }
          })}
          error={projectErrors?.fechaFin?.message}
        />

        <Select
          label="Tipo de proyecto"
          {...register(`proyectos.${index}.tipo.id` as const)}
        >
          <option value="">Seleccione...</option>
          {projectTypes.map(({ id, nombre }) => (
            <option key={id} value={String(id)}>{nombre}</option>
          ))}
          <option value={OTHER_OPTION}>Otro (especificar)</option>
        </Select>

        {selectedTipoId === OTHER_OPTION && (
          <Input
            label="Si seleccionó 'Otro', especifique"
            {...register(`proyectos.${index}.tipo.otros` as const, { required: 'Indique el tipo de proyecto' })}
            error={projectErrors?.tipo?.otros?.message}
          />
        )}

        <div className="md:col-span-2">
          <p className="form-label question-accent">Ubicaciones del proyecto (puede añadir varios departamentos, cada uno con varios municipios)</p>
          <ProjectLocationMapPicker />
          <div className="space-y-3">
            {ubicacionesFields.map((uField, uIndex) => (
              <div key={uField.id} className="p-3 border rounded bg-white/50">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                  <Select
                    label={`Departamento`}
                    {...register(`proyectos.${index}.ubicaciones.${uIndex}.departamento` as const, {
                      required: 'Seleccione el departamento',
                      validate: (val: string) => {
                        if (!val) return true;
                        const duplicate = isDepartamentoDuplicated(ubicacionesValues, uIndex, val);
                        return !duplicate || 'Este departamento ya fue seleccionado para este proyecto';
                      }
                    })}
                    className="md:col-span-2"
                  >
                    <option value="">Seleccione...</option>
                    {departments.map(({ id, nombre }) => (
                      <option
                        key={id}
                        value={String(id)}
                        disabled={isDepartamentoDuplicated(ubicacionesValues, uIndex, String(id))}
                      >
                        {nombre}
                      </option>
                    ))}
                  </Select>

                  <div className="flex items-center justify-end gap-2">
                    <Button type="button" variant="destructive" size="sm" onClick={() => removeUbicacion(uIndex)} disabled={ubicacionesFields.length === 1}>
                      Quitar ubicación
                    </Button>
                  </div>
                </div>

                <div className="mt-3">
                  <MunicipiosEditor proyectoIndex={index} ubicacionIndex={uIndex} departments={departments} />
                </div>
              </div>
            ))}

            <Button type="button" variant="secondary" onClick={() => appendUbicacion({ departamento: '', municipiosTrabajo: [{ idMunicipio: '', idComunidadIndigena: '' }] })}>
              + Añadir ubicación (departamento)
            </Button>
          </div>
        </div>

        <div className="md:col-span-2">
          <p className="form-label question-accent">Tipos de ayuda asociados al proyecto</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {helpTypes.map(({ id, nombre }) => (
              <Checkbox key={id} label={nombre} value={String(id)} {...register(`proyectos.${index}.ayudas.seleccionados` as const)} />
            ))}
          </div>
          <div className="mt-3">
            {ayudasOtros?.map((_: unknown, otroIndex: number) => (
              <div key={`ayuda-otro-${otroIndex}`} className="flex items-center gap-3 mb-2">
                <Input
                  label={otroIndex === 0 ? 'Otros apoyos' : ''}
                  placeholder="Describa el apoyo"
                  {...register(`proyectos.${index}.ayudas.otros.${otroIndex}` as const)}
                />
                <Button type="button" variant="destructive" size="sm" onClick={() => removeOtrosEntry(`proyectos.${index}.ayudas.otros`, ayudasOtros, otroIndex)}>
                  Quitar
                </Button>
              </div>
            ))}
            <Button type="button" variant="secondary" onClick={() => addOtrosEntry(`proyectos.${index}.ayudas.otros`, ayudasOtros)}>
              + Añadir otro apoyo
            </Button>
          </div>
        </div>

        <div className="md:col-span-2">
          <p className="form-label question-accent">Actores locales involucrados</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {localActors.map(({ id, nombre }) => (
              <Checkbox key={id} label={nombre} value={String(id)} {...register(`proyectos.${index}.actores.seleccionados` as const)} />
            ))}
          </div>
          <div className="mt-3">
            {actoresOtros?.map((_: unknown, otroIndex: number) => (
              <div key={`actor-otro-${otroIndex}`} className="flex items-center gap-3 mb-2">
                <Input
                  label={otroIndex === 0 ? 'Otros actores' : ''}
                  placeholder="Describa el actor"
                  {...register(`proyectos.${index}.actores.otros.${otroIndex}` as const)}
                />
                <Button type="button" variant="destructive" size="sm" onClick={() => removeOtrosEntry(`proyectos.${index}.actores.otros`, actoresOtros, otroIndex)}>
                  Quitar
                </Button>
              </div>
            ))}
            <Button type="button" variant="secondary" onClick={() => addOtrosEntry(`proyectos.${index}.actores.otros`, actoresOtros)}>
              + Añadir otro actor
            </Button>
          </div>
        </div>

        <Select
          label="Área del proyecto"
          {...register(`proyectos.${index}.area` as const, { required: 'Seleccione el área' })}
          error={projectErrors?.area?.message}
        >
          <option value="">Seleccione...</option>
          {projectAreas.map(({ id, nombre }) => (
            <option key={id} value={String(id)}>{nombre}</option>
          ))}
        </Select>

        {isConservation && (
          <div className="md:col-span-2 mt-4">
            <p className="block text-carbon-muted text-sm font-medium mb-2">Conservación — especies y prácticas agrícolas</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <p className="form-sublabel">Especies bandera</p>
                <div className="space-y-2">
                  {species.map(({ id, nombre }) => (
                    <Checkbox key={id} label={nombre} value={String(id)} {...register(`proyectos.${index}.conservacion.especies.seleccionados` as const)} />
                  ))}
                </div>
                <div className="mt-3">
                  {conservacionEspeciesOtros?.map((_: unknown, otroIndex: number) => (
                    <div key={`especie-otro-${otroIndex}`} className="flex items-center gap-3 mb-2">
                      <Input
                        label={otroIndex === 0 ? 'Otras especies' : ''}
                        placeholder="Describa la especie"
                        {...register(`proyectos.${index}.conservacion.especies.otros.${otroIndex}` as const)}
                      />
                      <Button type="button" variant="destructive" size="sm" onClick={() => removeOtrosEntry(`proyectos.${index}.conservacion.especies.otros`, conservacionEspeciesOtros, otroIndex)}>
                        Quitar
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="secondary" onClick={() => addOtrosEntry(`proyectos.${index}.conservacion.especies.otros`, conservacionEspeciesOtros)}>
                    + Añadir otra especie
                  </Button>
                </div>
              </div>

                <div>
                <p className="form-sublabel">Prácticas agrícolas</p>
                <div className="space-y-2">
                  {agriculturalPractices.map(({ id, nombre }) => (
                    <Checkbox key={id} label={nombre} value={String(id)} {...register(`proyectos.${index}.conservacion.practicasAgricolas.seleccionados` as const)} />
                  ))}
                </div>
                <div className="mt-3">
                  {conservacionPracticasOtros?.map((_: unknown, otroIndex: number) => (
                    <div key={`practica-otro-${otroIndex}`} className="flex items-center gap-3 mb-2">
                      <Input
                        label={otroIndex === 0 ? 'Otras prácticas' : ''}
                        placeholder="Describa la práctica"
                        {...register(`proyectos.${index}.conservacion.practicasAgricolas.otros.${otroIndex}` as const)}
                      />
                      <Button type="button" variant="destructive" size="sm" onClick={() => removeOtrosEntry(`proyectos.${index}.conservacion.practicasAgricolas.otros`, conservacionPracticasOtros, otroIndex)}>
                        Quitar
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="secondary" onClick={() => addOtrosEntry(`proyectos.${index}.conservacion.practicasAgricolas.otros`, conservacionPracticasOtros)}>
                    + Añadir otra práctica
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {isDevelopment && (
          <div className="md:col-span-2 mt-4">
            <p className="form-label question-accent">Desarrollo — áreas de contribución</p>
            <div className="space-y-3">
              {developmentAreas.map(({ id, nombre }) => (
                <Checkbox key={id} label={nombre} value={String(id)} {...register(`proyectos.${index}.desarrollo.seleccionados` as const)} />
              ))}
            </div>
            <div className="mt-3">
              {desarrolloOtros?.map((_: unknown, otroIndex: number) => (
                <div key={`desarrollo-otro-${otroIndex}`} className="flex items-center gap-3 mb-2">
                  <Input
                    label={otroIndex === 0 ? 'Otras áreas' : ''}
                    placeholder="Describa el área de contribución"
                    {...register(`proyectos.${index}.desarrollo.otros.${otroIndex}` as const)}
                  />
                  <Button type="button" variant="destructive" size="sm" onClick={() => removeOtrosEntry(`proyectos.${index}.desarrollo.otros`, desarrolloOtros, otroIndex)}>
                    Quitar
                  </Button>
                </div>
              ))}
              <Button type="button" variant="secondary" onClick={() => addOtrosEntry(`proyectos.${index}.desarrollo.otros`, desarrolloOtros)}>
                + Añadir otra área
              </Button>
            </div>
          </div>
        )}

        {/* Organizaciones relacionadas al proyecto: selección desde catálogo de organizaciones registradas */}
        <div className="md:col-span-2">
          <ProjectOrgsSelector index={index} />
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
