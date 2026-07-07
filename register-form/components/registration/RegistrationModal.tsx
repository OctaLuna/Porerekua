
import React, { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import type { RegistrationFormData } from '../../types';
import type { CommonResponseDto } from '../../types/api';
import { emptyOptions, useRegistrationFormOptions } from '../../hooks/useEmpresaFormOptions';
import { useSessionFormDraft } from '../../hooks/useSessionFormDraft';
import { apiClient, ApiError } from '../../utils/apiClient';
import parseApiError from '../../utils/errorHelper';
import ErrorBanner from '../ui/ErrorBanner';
import { mapEmpresaFormToDto } from '../../utils/empresaFormMapper';

import ProgressBar from './ProgressBar';
import Step1CompanyInfo from './steps/Step1_CompanyInfo';
import Step2AmazoniaRelation from './steps/Step2_AmazoniaRelation';
import Step3Motivation from './steps/Step3_Motivation';
import Step5_ProjectRegistration from './steps/Step5_ProjectRegistration';
import SuccessStep from './steps/SuccessStep';
import Button from '../ui/Button';

interface RegistrationModalProps {
  onClose: () => void;
}

const steps = [
  { id: 1, name: 'Identificación', fields: ['nombre', 'formaJuridica.id', 'departamentos'] },
  { id: 2, name: 'Relación', fields: ['haApoyado', 'anioInicioApoyo', 'apoyos.seleccionados'] },
  { id: 3, name: 'Motivación', fields: ['motivosApoyo.seleccionados', 'ods'] },
  { id: 4, name: 'Proyectos', fields: ['proyectos'] },
];

const registrationDefaultValues: RegistrationFormData = {
  nombre: '',
  cargo: '',
  formaJuridica: { id: '', otro: '' },
  departamentos: [''],
  haApoyado: undefined,
  anioInicioApoyo: undefined,
  apoyos: { seleccionados: [], otros: [] },
  motivosApoyo: { seleccionados: [], otros: [] },
  ods: [],
  proyectos: [],
};

const RegistrationModal: React.FC<RegistrationModalProps> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | undefined>();
  const [submitTechnical, setSubmitTechnical] = useState<string | undefined>();
  const [successMessage, setSuccessMessage] = useState<string>();

  const { data: formOptions, loading: loadingOptions, error: optionsError, reload } = useRegistrationFormOptions();
  const catalogOptions = formOptions ?? emptyOptions;
  const backendStatus = loadingOptions ? 'loading' : optionsError ? 'offline' : 'ready';
  const canUseBackendValidation = backendStatus === 'ready';
  const canSubmit = backendStatus === 'ready';

  const methods = useForm<RegistrationFormData>({
    mode: 'onChange',
    defaultValues: registrationDefaultValues
  });

  const { clearDraft } = useSessionFormDraft<RegistrationFormData>({
    storageKey: 'amazonia-form:registro-empresa-draft',
    form: methods,
    initialValues: registrationDefaultValues,
    currentStep,
    setCurrentStep,
    maxStep: steps.length - 1,
  });

  const totalSteps = steps.length;

  const nextStep = async () => {
    if (currentStep >= totalSteps - 1) {
      return;
    }

    if (!canUseBackendValidation) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps - 1));
      return;
    }

    const fieldsToValidate = steps[currentStep].fields;
    const isValid = await methods.trigger(fieldsToValidate as any);
    if (isValid) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };
  
  const onSubmit = async (data: RegistrationFormData) => {
    console.groupCollapsed('[Formulario Empresas] Envío al backend');
    try {
      setIsSubmitting(true);
      setSubmitError(undefined);
      setSubmitTechnical(undefined);
      console.log('Datos capturados desde el formulario', data);
      const payload = mapEmpresaFormToDto(data);
      console.log('Payload preparado para la API', payload);
      const response = await apiClient.post<CommonResponseDto>('/api/formularios/empresas', payload);
      console.log('Respuesta recibida del backend', response);
      clearDraft();
      setCurrentStep(0);
      setIsSuccess(true);
      setSuccessMessage(response?.message);
    } catch (error) {
      console.error('Error al enviar formulario de empresas', error);
      const parsed = parseApiError(error);
      // If there are field-level errors, map them to react-hook-form
      if (parsed.fieldErrors) {
        Object.entries(parsed.fieldErrors).forEach(([field, msg]) => {
          try {
            methods.setError(field as any, { type: 'server', message: msg });
          } catch (e) {
            // ignore mapping errors
            console.warn('No se pudo asignar el error de campo:', field, msg, e);
          }
        });
      }

      setSubmitError(parsed.userMessage || 'Ocurrió un error al enviar el formulario. Intenta nuevamente.');
      setSubmitTechnical(parsed.technical);
    } finally {
      setIsSubmitting(false);
      console.groupEnd();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white dark:bg-[#312F2A]/90 dark:backdrop-blur-[12px] border border-gray-200 dark:border-white/10 dark:shadow-[0_8px_32px_rgba(0,0,0,0.15)] rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col animate-fade-in-scale" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-200 dark:border-white/10 flex justify-between items-center">
          <h2 className="text-2xl font-serif font-bold text-gray-800 dark:text-[#F4F4F4]">Registro de Compromiso</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors text-2xl leading-none">&times;</button>
        </div>
        
        {isSuccess ? (
            <SuccessStep onClose={onClose} message={successMessage} />
        ) : (
          <FormProvider {...methods}>
            <form 
              onSubmit={methods.handleSubmit(onSubmit)} 
              className="flex flex-col flex-grow min-h-0"
            >
              <div className="p-8 overflow-y-auto flex-grow min-h-0">
                <ProgressBar currentStep={currentStep + 1} totalSteps={totalSteps} />
                <div className="mt-8 space-y-4">
                  {loadingOptions && (
                    <div className="rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-4 py-3 text-sm text-earth-brown-adaptive dark:text-gray-300 flex items-center justify-between gap-3">
                      <span>Cargando catálogos del formulario. La estructura ya está disponible.</span>
                      <span className="inline-flex items-center rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-2.5 py-1 text-[0.72rem] font-medium tracking-wide uppercase">
                        Puede tardar hasta 10 min
                      </span>
                    </div>
                  )}

                  {optionsError && (
                    <div className="p-4 rounded-md border border-red-500 dark:border-red-600 text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20">
                      <p>{optionsError}</p>
                      <p className="mt-2 text-red-600 dark:text-red-400">
                        Se muestran las preguntas del formulario mientras intentamos cargar las opciones.
                      </p>
                      <Button type="button" variant="secondary" className="mt-3" onClick={reload}>Reintentar</Button>
                    </div>
                  )}

                  {!canUseBackendValidation && (
                    <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 px-4 py-3 text-xs text-carbon-muted dark:text-gray-400">
                      El formulario está en modo navegación libre mientras se resuelven los catálogos. Podés avanzar y volver entre pasos, pero el envío queda bloqueado hasta recuperar conexión.
                    </div>
                  )}

                  {currentStep === 0 && (
                    <Step1CompanyInfo legalForms={catalogOptions.legalForms} departments={catalogOptions.departments} />
                  )}
                  {currentStep === 1 && (
                    <Step2AmazoniaRelation supports={catalogOptions.supports} />
                  )}
                  {currentStep === 2 && (
                    <Step3Motivation motives={catalogOptions.motives} ods={catalogOptions.ods} />
                  )}
                  {currentStep === 3 && (
                    <Step5_ProjectRegistration
                      departments={catalogOptions.departments}
                      projectTypes={catalogOptions.projectTypes}
                      projectAreas={catalogOptions.projectAreas}
                      helpTypes={catalogOptions.helpTypes}
                      localActors={catalogOptions.localActors}
                      species={catalogOptions.species}
                      agriculturalPractices={catalogOptions.agriculturalPractices}
                      developmentAreas={catalogOptions.developmentAreas}
                    />
                  )}
                </div>
              </div>

              <div className="px-6 pt-8 pb-6 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center rounded-b-2xl">
                <Button type="button" variant="secondary" onClick={prevStep} disabled={currentStep === 0} className="bg-gray-100 dark:bg-gray-700 text-earth-brown-adaptive dark:text-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 focus:ring-gray-400">
                  Anterior
                </Button>
                
                {currentStep < totalSteps - 1 ? (
                  <Button type="button" variant="primary" onClick={nextStep}>
                    Siguiente
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="primary"
                    disabled={isSubmitting || !canSubmit}
                    onClick={canSubmit ? methods.handleSubmit(onSubmit) : undefined}
                  >
                    {isSubmitting ? 'Enviando...' : canSubmit ? 'Finalizar Registro' : 'Sin conexión al backend'}
                  </Button>
                )}
              </div>

              {submitError && (
                <div className="px-6 pb-6">
                  <ErrorBanner
                    message={submitError}
                    technical={submitTechnical}
                    onRetry={() => { methods.handleSubmit(onSubmit)().catch(() => {}); }}
                  />
                </div>
              )}
            </form>
          </FormProvider>
        )}
      </div>
    </div>
  );
};

export default RegistrationModal;
