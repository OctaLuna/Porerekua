
import React, { useEffect, useMemo, useState } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import type { ProjectFormData, ProjectFormContext } from '../../../types';
import type { DepartamentoDto, NamedResource } from '../../../types/api';
import Input from '../../ui/Input';
import Select from '../../ui/Select';
import Checkbox from '../../ui/Checkbox';
import Button from '../../ui/Button';
import useRegisteredOrganizations from '../../../hooks/useRegisteredOrganizations';
import OrganizationModal from '../OrganizationModal';
import ProjectLocationMapPicker from '../ProjectLocationMapPicker';

type Step5Props = {
  departments: DepartamentoDto[];
  projectTypes: NamedResource[];
  projectAreas: NamedResource[];
  helpTypes: NamedResource[];
  localActors: NamedResource[];
  species: NamedResource[];
  agriculturalPractices: NamedResource[];
  developmentAreas: NamedResource[];
};

const buildEmptyProject = (): ProjectFormData => ({
  nombre: '',
  descripcion: '',
  fechaInicio: '',
  fechaFin: '',
  anioInicio: new Date().getFullYear(),
  anioFin: undefined,
  tipo: {},
  ubicaciones: [{ departamento: '', municipiosTrabajo: [{ idMunicipio: '', idComunidadIndigena: '' }] }],
  ayudas: { seleccionados: [], otros: [] },
  actores: { seleccionados: [], otros: [] },
  area: '',
  conservacion: {
    especies: { seleccionados: [], otros: [] },
    practicasAgricolas: { seleccionados: [], otros: [] },
  },
  desarrollo: { seleccionados: [], otros: [] },
  organizacionesRelacionadas: [],
});

const Step5_ProjectRegistration: React.FC<Step5Props> = (props) => {
  const { control } = useFormContext<ProjectFormContext>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'proyectos',
  });

  const addNewProject = () => {
    if (fields.length < 10) {
      append(buildEmptyProject());
    }
  };

  return (
    <div className="animate-fade-in">
      <h3 className="text-xl font-semibold mb-2 text-heading-primary dark:text-gray-950">Registro de Proyectos</h3>
      <p className="text-sm text-carbon-muted mb-6">Añada los principales proyectos que su empresa realiza en la Amazonia (máximo 10).</p>

      <div className="space-y-6">
        {fields.map((field, index) => (
          <ProjectCard
            key={field.id}
            index={index}
            onRemove={() => remove(index)}
            {...props}
          />
        ))}
      </div>

      {fields.length < 10 && (
        <Button
          type="button"
          variant="secondary"
          onClick={addNewProject}
          className="mt-6 bg-green-50 dark:bg-opacity-10 text-earth-brown-adaptive dark:text-gray-600 hover:bg-green-100 dark:hover:bg-opacity-20 focus:ring-green-600"
        >
          + Añadir Nuevo Proyecto
        </Button>
      )}
    </div>
  );
};

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
  const ubicacionesValues = (watch(`proyectos.${index}.ubicaciones`) as any[] | undefined) ?? [];

  const projectAreaId = watch(`proyectos.${index}.area`);
  const ayudasOtros = (watch(`proyectos.${index}.ayudas.otros`) as string[] | undefined) ?? [];
  const actoresOtros = (watch(`proyectos.${index}.actores.otros`) as string[] | undefined) ?? [];
  const conservacionEspeciesOtros = (watch(`proyectos.${index}.conservacion.especies.otros`) as string[] | undefined) ?? [];
  const conservacionPracticasOtros = (watch(`proyectos.${index}.conservacion.practicasAgricolas.otros`) as string[] | undefined) ?? [];
  const desarrolloOtros = (watch(`proyectos.${index}.desarrollo.otros`) as string[] | undefined) ?? [];

  const areaInfo = useMemo(() => projectAreas.find(({ id }) => String(id) === projectAreaId), [projectAreas, projectAreaId]);

  const isConservation = areaInfo?.nombre?.toLowerCase().includes('conserv');
  const isDevelopment = areaInfo?.nombre?.toLowerCase().includes('desarrollo');

  const addOtrosEntry = (path: string, current: string[]) => {
    setValue(path as any, [...current, '']);
  };

  const removeOtrosEntry = (path: string, current: string[], entryIndex: number) => {
    setValue(path as any, current.filter((_, idx) => idx !== entryIndex));
  };

  const projectErrors = errors.proyectos?.[index];

  // helpers for conditional 'Otro' option and year validation
  const OTHER_OPTION = '__other__';
  const currentYear = new Date().getFullYear();
  const selectedTipoId = watch(`proyectos.${index}.tipo.id` as const) as string | undefined;
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
          error={projectErrors?.nombre?.message as string | undefined}
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
          error={projectErrors?.fechaInicio?.message as string | undefined}
        />

        <Input
          label="Fecha de fin (opcional)"
          type="date"
          {...register(`proyectos.${index}.fechaFin` as const, {
            validate: (val: string) => {
              if (!val) return true;
              const startVal = watch(`proyectos.${index}.fechaInicio`) as string | undefined;
              if (!startVal) return true;
              const start = new Date(startVal);
              const end = new Date(val);
              start.setHours(0,0,0,0);
              end.setHours(0,0,0,0);
              return end.getTime() >= start.getTime() || 'La fecha de fin no puede ser anterior a la fecha de inicio';
            }
          })}
          error={projectErrors?.fechaFin?.message as string | undefined}
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
            error={projectErrors?.tipo?.otros?.message as string | undefined}
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
                        const others = ubicacionesValues.map((u) => String(u?.departamento)).filter((v, i, arr) => v && arr.indexOf(v) === i);
                        // allow if this value is unique or equals the current (no change)
                        const duplicate = ubicacionesValues.some((u, i) => i !== uIndex && String(u?.departamento) === String(val));
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
                        disabled={ubicacionesValues.some((u, i) => i !== uIndex && String(u?.departamento) === String(id))}
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
          error={projectErrors?.area?.message as string | undefined}
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
          <ProjectOrgsSelector index={index} register={register} />
        </div>
      </div>
    </div>
  );
};

// pequeño subcomponente para mantener el ProjectCard más limpio
const ProjectOrgsSelector: React.FC<{ index: number; register?: ReturnType<typeof useFormContext>['register'] }> = ({ index }) => {
  const { data: registeredOrgs, loading: loadingOrgs, error: orgsError, reload } = useRegisteredOrganizations();
  const { watch, setValue } = useFormContext<ProjectFormContext>();
  const [showOrgModal, setShowOrgModal] = useState(false);
  const [query, setQuery] = useState('');

  const fieldName = `proyectos.${index}.organizacionesRelacionadas` as const;
  const current = (watch(fieldName) as string[] | undefined) ?? [];

  const openModal = () => setShowOrgModal(true);
  const closeModal = () => {
    setShowOrgModal(false);
    // intentar recargar el catálogo cuando se cierra el modal
    reload();
  };

  const toggle = (id: number) => {
    const sid = String(id);
    const next = current.includes(sid) ? current.filter((v) => v !== sid) : [...current, sid];
    setValue(fieldName as any, next, { shouldValidate: true, shouldDirty: true });
  };

  const filtered = (registeredOrgs ?? []).filter((o) => o.nombre.toLowerCase().includes(query.trim().toLowerCase()));

  const selectAllVisible = () => {
    const ids = filtered.map((o) => String(o.id));
    const merged = Array.from(new Set([...current, ...ids]));
    setValue(fieldName as any, merged, { shouldValidate: true, shouldDirty: true });
  };

  const clearAll = () => setValue(fieldName as any, [], { shouldValidate: true, shouldDirty: true });

  return (
  <div>
  <p className="form-label question-accent">Organizaciones relacionadas al proyecto (seleccione una o varias)</p>

      {loadingOrgs && <p className="text-sm text-carbon-muted">Cargando organizaciones...</p>}

      {orgsError && (
        <div className="space-y-2">
          <div className="p-3 border rounded bg-amber-50 text-amber-800 text-sm">
            <p>{orgsError}</p>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={reload}>Reintentar</Button>
            <Button type="button" variant="primary" onClick={openModal}>Registrar nueva organización</Button>
          </div>
        </div>
      )}

      {!loadingOrgs && registeredOrgs && registeredOrgs.length === 0 && !orgsError && (
        <div className="space-y-2">
          <p className="text-sm text-carbon-muted">Aún no hay organizaciones registradas.</p>
          <div className="flex gap-2">
            <Button type="button" variant="primary" onClick={openModal}>Registrar organización</Button>
          </div>
        </div>
      )}

      {!loadingOrgs && registeredOrgs && registeredOrgs.length > 0 && (
          <div className="space-y-4">
          <div className="flex gap-2 items-center">
            <input
              type="search"
              placeholder="Buscar organización..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full px-3 py-2 border rounded focus:outline-none"
            />
            <Button type="button" variant="secondary" onClick={selectAllVisible}>Seleccionar visibles</Button>
            <Button type="button" variant="destructive" onClick={clearAll}>Limpiar</Button>
          </div>

          <div className="max-h-40 overflow-auto border rounded p-2 bg-white dark:bg-gray-800 dark:border-gray-700">
            {filtered.length === 0 ? (
              <p className="text-sm text-carbon-muted">No se encontraron organizaciones que coincidan.</p>
            ) : (
              <div className="space-y-2">
                {filtered.map(({ id, nombre }) => (
                  <label key={id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={current.includes(String(id))}
                      onChange={() => toggle(id)}
                    />
                    <span className="text-sm text-heading-primary dark:text-gray-600">{nombre}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {showOrgModal && <OrganizationModal onClose={closeModal} isNested={true} />}
    </div>
  );
};

export default Step5_ProjectRegistration;

// Subcomponente que gestiona los municipios dentro de una ubicación (departamento)
const MunicipiosEditor: React.FC<{ proyectoIndex: number; ubicacionIndex: number; departments: DepartamentoDto[] }> = ({ proyectoIndex, ubicacionIndex, departments }) => {
  const { control, register, watch, formState: { errors } } = useFormContext<ProjectFormContext>();
  const { fields: municipioFields, append: appendMunicipio, remove: removeMunicipio } = useFieldArray({
    control,
    name: `proyectos.${proyectoIndex}.ubicaciones.${ubicacionIndex}.municipiosTrabajo` as const,
  });

  // Watch all ubicaciones for this proyecto to compute duplicates across the project
  const ubicacionesAll = (watch(`proyectos.${proyectoIndex}.ubicaciones`) as any[] | undefined) ?? [];
  const departmentId = watch(`proyectos.${proyectoIndex}.ubicaciones.${ubicacionIndex}.departamento` as const);
  const selectedDepartment = departments.find(({ id }) => String(id) === departmentId);

  const projectErrors = (errors.proyectos as any)?.[proyectoIndex];

  return (
    <div>
      {municipioFields.map((field, municipioIndex) => {
  const currentSelectedMunicipio = watch(`proyectos.${proyectoIndex}.ubicaciones.${ubicacionIndex}.municipiosTrabajo.${municipioIndex}.idMunicipio` as const) as string ?? '';
  const currentSelectedComunidad = watch(`proyectos.${proyectoIndex}.ubicaciones.${ubicacionIndex}.municipiosTrabajo.${municipioIndex}.idComunidadIndigena` as const) as string ?? '';

        // compute if a comunidad option should be disabled: if same comunidad selected elsewhere (non-empty)
        const usedComunidadIds = new Set<string>();
        ubicacionesAll.forEach((u, ui) => {
          (u?.municipiosTrabajo ?? []).forEach((m: any, mi: number) => {
            if (ui === ubicacionIndex && mi === municipioIndex) return; // skip current
            const cid = m?.idComunidadIndigena;
            if (cid) usedComunidadIds.add(String(cid));
          });
        });

        // compute duplicates for municipio: same municipio id AND same comunidad id
        const hasDuplicateMunicipio = (municipioId: string, comunidadId: string) => {
          return ubicacionesAll.some((u, ui) => (
            (u?.municipiosTrabajo ?? []).some((m: any, mi: number) => {
              if (ui === ubicacionIndex && mi === municipioIndex) return false; // skip current
              const mid = String(m?.idMunicipio ?? '');
              const cid = String(m?.idComunidadIndigena ?? '');
              return mid === String(municipioId) && cid === String(comunidadId);
            })
          ));
        };

        return (
          <div key={field.id} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end mb-2">
            <Select
              label="Municipio"
              {...register(`proyectos.${proyectoIndex}.ubicaciones.${ubicacionIndex}.municipiosTrabajo.${municipioIndex}.idMunicipio` as const, {
                required: 'Seleccione el municipio',
                validate: (val: string) => {
                  if (!val) return true;
                  // if same municipio selected elsewhere with same comunidad (including empty), it's invalid
                  const duplicate = hasDuplicateMunicipio(val, currentSelectedComunidad ?? '');
                  return !duplicate || 'Este municipio ya fue seleccionado con la misma comunidad indígena';
                }
              })}
            >
              <option value="">Seleccione...</option>
              {selectedDepartment?.municipios?.map(({ id, nombre }) => (
                <option
                  key={id}
                  value={String(id)}
                  disabled={hasDuplicateMunicipio(String(id), currentSelectedComunidad ?? '')}
                >
                  {nombre}
                </option>
              ))}
            </Select>

            <Select
              label="Comunidad indígena (opcional)"
              {...register(`proyectos.${proyectoIndex}.ubicaciones.${ubicacionIndex}.municipiosTrabajo.${municipioIndex}.idComunidadIndigena` as const, {
                validate: (val: string) => {
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
