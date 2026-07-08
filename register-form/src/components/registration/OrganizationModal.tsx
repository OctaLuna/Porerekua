import React, { useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import type { OrganizationFormData } from '../../types';
import { registerFormularioOrganizacionSchema } from '../../types/api.schema';
import { useRegistrationFormOptions } from '../../hooks/useEmpresaFormOptions';
import { useSessionFormDraft } from '../../hooks/useSessionFormDraft';
import { useFormSubmission } from '../../hooks/useFormSubmission';
import ErrorBanner from '../ui/ErrorBanner';
import { mapOrganizationFormToDto } from '../../utils/empresaFormMapper';

import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import Step5_ProjectRegistration from './steps/Step5_ProjectRegistration';
import SuccessStep from './steps/SuccessStep';

const OTHER_OPTION = '__other__';

const organizationDefaultValues: OrganizationFormData = {
  nombre: '',
  tipo: { id: '', otros: '' },
  formaJuridica: { id: '', otro: '' },
  idDepartamento: '',
  esNacional: undefined,
  anioInicioTrabajo: undefined,
  proyectos: [],
};

interface Props {
  onClose: () => void;
  isNested?: boolean;
}

const OrganizationModal: React.FC<Props> = ({ onClose, isNested }) => {
  const { data: formOptions, loading: loadingOptions, error: optionsError, reload } = useRegistrationFormOptions();

  const methods = useForm<OrganizationFormData>({
    mode: 'onChange',
    defaultValues: organizationDefaultValues,
  });

  const { clearDraft } = useSessionFormDraft<OrganizationFormData>({
    storageKey: 'amazonia-form:registro-organizacion-draft',
    form: methods,
    initialValues: organizationDefaultValues,
  });

  const { register, handleSubmit, watch, setValue, formState: { errors } } = methods;
  const selectedType = watch('tipo.id');
  const selectedLegalFormId = watch('formaJuridica.id');

  useEffect(() => {
    if (selectedType !== OTHER_OPTION) {
      setValue('tipo.otros', '');
    }
  }, [selectedType, setValue]);

  useEffect(() => {
    if (selectedLegalFormId !== OTHER_OPTION) {
      setValue('formaJuridica.otro', '');
    }
  }, [selectedLegalFormId, setValue]);

  const { submit: onSubmit, isSubmitting, isSuccess, submitError, submitTechnical, successMessage } = useFormSubmission({
    methods,
    mapToDto: (data: OrganizationFormData) => mapOrganizationFormToDto({
      ...data,
      tipo: {
        id: data.tipo.id === OTHER_OPTION ? undefined : data.tipo.id,
        otros: data.tipo.id === OTHER_OPTION ? data.tipo.otros : '',
      },
    }),
    dtoSchema: registerFormularioOrganizacionSchema,
    endpoint: '/api/formularios/organizaciones',
    clearDraft,
    errorLogLabel: 'formulario de organizaciones',
  });

  const FormContainer = isNested ? 'div' : 'form';

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[500] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-[#312F2A]/90 dark:backdrop-blur-[12px] border border-gray-200 dark:border-white/10 dark:shadow-[0_8px_32px_rgba(0,0,0,0.15)] rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="p-5 border-b border-gray-200 dark:border-white/10 flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-[#F4F4F4]">Registra tu Organización</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors text-2xl leading-none">×</button>
        </div>

        {isSuccess ? (
          <SuccessStep onClose={onClose} message={successMessage} />
        ) : (
          <FormProvider {...methods}>
            <FormContainer 
              onSubmit={isNested ? undefined : (e: React.FormEvent) => {
                e.preventDefault();
                e.stopPropagation();
                void handleSubmit(onSubmit)(e);
              }}
              className="p-6 overflow-y-auto flex flex-col gap-6"
            >
              {optionsError && (
                <div className="p-4 border border-red-500 dark:border-red-600 rounded-md text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20">
                  <p>{optionsError}</p>
                  <Button type="button" variant="secondary" className="mt-3" onClick={reload}>Reintentar</Button>
                </div>
              )}

              {loadingOptions && (
                <div className="p-6 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50 animate-pulse text-center text-earth-brown-adaptive dark:text-gray-300">
                  Cargando opciones del formulario...
                </div>
              )}

              {!loadingOptions && formOptions && (
                <>
                  <Input
                    label="Nombre de la organización"
                    {...register('nombre', { required: 'El nombre es requerido' })}
                    error={errors.nombre?.message}
                  />

                  <Select
                    label="Tipo de organización"
                    {...register('tipo.id', { required: 'Seleccione el tipo de organización' })}
                    error={errors.tipo?.id?.message}
                  >
                    <option value="">Seleccione...</option>
                    {formOptions.organizationTypes.map(({ id, nombre }) => (
                      <option key={id} value={String(id)}>{nombre}</option>
                    ))}
                    <option value={OTHER_OPTION}>Otro (especificar)</option>
                  </Select>

                  {selectedType === OTHER_OPTION && (
                    <Input
                      label="Especifique el tipo de organización"
                      {...register('tipo.otros', { required: 'Indique el tipo de organización' })}
                      error={errors.tipo?.otros?.message}
                    />
                  )}

                  <Select
                    label="Forma jurídica"
                    {...register('formaJuridica.id', { required: 'Seleccione una forma jurídica' })}
                    error={errors.formaJuridica?.id?.message}
                  >
                    <option value="">Seleccione...</option>
                    {formOptions.legalForms.map(({ id, nombre }) => (
                      <option key={id} value={String(id)}>{nombre}</option>
                    ))}
                    <option value={OTHER_OPTION}>Otro (especificar)</option>
                  </Select>

                  {selectedLegalFormId === OTHER_OPTION && (
                    <Input
                      label="Especifique la forma jurídica"
                      {...register('formaJuridica.otro', { required: 'Indique la forma jurídica' })}
                      error={errors.formaJuridica?.otro?.message}
                    />
                  )}

                  <Select
                    label="Departamento de la sede central"
                    {...register('idDepartamento', { required: 'Seleccione el departamento' })}
                    error={errors.idDepartamento?.message}
                  >
                    <option value="">Seleccione...</option>
                    {formOptions.departments.map(({ id, nombre }) => (
                      <option key={id} value={String(id)}>{nombre}</option>
                    ))}
                  </Select>

                  <Select
                    label="¿La organización es de alcance nacional?"
                    {...register('esNacional', { required: 'Seleccione una opción' })}
                    error={errors.esNacional?.message}
                  >
                    <option value="">Seleccione...</option>
                    <option value="Si">Sí</option>
                    <option value="No">No</option>
                  </Select>

                  <Input
                    label="Año de inicio del trabajo en Bolivia"
                    type="number"
                    {...register('anioInicioTrabajo', {
                      valueAsNumber: true,
                      min: { value: 1900, message: 'Año inválido' },
                    })}
                    error={errors.anioInicioTrabajo?.message}
                  />

                  <Step5_ProjectRegistration
                    departments={formOptions.departments}
                    projectTypes={formOptions.projectTypes}
                    projectAreas={formOptions.projectAreas}
                    helpTypes={formOptions.helpTypes}
                    localActors={formOptions.localActors}
                    species={formOptions.species}
                    agriculturalPractices={formOptions.agriculturalPractices}
                    developmentAreas={formOptions.developmentAreas}
                  />
                </>
              )}

              <div className="flex justify-end gap-3">
                <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                <Button 
                  type={isNested ? "button" : "submit"} 
                  variant="primary" 
                  disabled={isSubmitting || loadingOptions}
                  onClick={isNested ? () => { void handleSubmit(onSubmit)(); } : undefined}
                >
                  {isSubmitting ? 'Enviando...' : 'Registrar Organización'}
                </Button>
              </div>

              {submitError && (
                <div className="text-sm">
                  <ErrorBanner
                    message={submitError}
                    technical={submitTechnical}
                    onRetry={() => { handleSubmit(onSubmit)().catch(() => {}); }}
                  />
                </div>
              )}
            </FormContainer>
          </FormProvider>
        )}
      </div>
    </div>
  );
};

export default OrganizationModal;
