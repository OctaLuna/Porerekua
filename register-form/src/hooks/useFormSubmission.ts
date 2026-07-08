import { useState } from 'react';
import type { FieldValues, Path, UseFormReturn } from 'react-hook-form';
import type { ZodType } from 'zod';
import { apiClient } from '../utils/apiClient';
import parseApiError from '../utils/errorHelper';
import { commonResponseSchema } from '../types/api.schema';

type UseFormSubmissionOptions<TFormData extends FieldValues, TDto> = {
  methods: UseFormReturn<TFormData>;
  mapToDto: (data: TFormData) => TDto;
  dtoSchema: ZodType<TDto>;
  endpoint: string;
  clearDraft: () => void;
  onSuccess?: () => void;
  errorLogLabel: string;
};

type UseFormSubmissionResult<TFormData extends FieldValues> = {
  submit: (data: TFormData) => Promise<void>;
  isSubmitting: boolean;
  isSuccess: boolean;
  submitError?: string;
  submitTechnical?: string;
  successMessage?: string;
};

export function useFormSubmission<TFormData extends FieldValues, TDto>({
  methods,
  mapToDto,
  dtoSchema,
  endpoint,
  clearDraft,
  onSuccess,
  errorLogLabel,
}: UseFormSubmissionOptions<TFormData, TDto>): UseFormSubmissionResult<TFormData> {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | undefined>();
  const [submitTechnical, setSubmitTechnical] = useState<string | undefined>();
  const [successMessage, setSuccessMessage] = useState<string>();

  const submit = async (data: TFormData) => {
    try {
      setIsSubmitting(true);
      setSubmitError(undefined);
      setSubmitTechnical(undefined);
      const payload = dtoSchema.parse(mapToDto(data));
      const response = await apiClient.post(endpoint, payload, commonResponseSchema);
      clearDraft();
      setIsSuccess(true);
      setSuccessMessage(response.message);
      onSuccess?.();
    } catch (error) {
      console.error(`Error al enviar ${errorLogLabel}`, error);
      const parsed = parseApiError(error);
      // If there are field-level errors, map them to react-hook-form
      if (parsed.fieldErrors) {
        Object.entries(parsed.fieldErrors).forEach(([field, msg]) => {
          try {
            methods.setError(field as Path<TFormData>, { type: 'server', message: msg });
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
    }
  };

  return { submit, isSubmitting, isSuccess, submitError, submitTechnical, successMessage };
}
