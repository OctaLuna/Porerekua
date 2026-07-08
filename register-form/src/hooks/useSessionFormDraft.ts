import { useCallback, useEffect, useRef } from 'react';
import type { FieldValues, UseFormReturn } from 'react-hook-form';

type DraftSnapshot<T> = {
  version: 1;
  updatedAt: string;
  currentStep?: number;
  values: Partial<T>;
};

type UseSessionFormDraftOptions<T extends FieldValues> = {
  storageKey: string;
  form: UseFormReturn<T>;
  initialValues: T;
  currentStep?: number;
  setCurrentStep?: (step: number) => void;
  maxStep?: number;
  enabled?: boolean;
};

const hasStorage = (): boolean => typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined';

const isPlainObject = (value: unknown): value is Record<string, unknown> => (
  value !== null && typeof value === 'object' && !Array.isArray(value)
);

const mergeDraftValues = <T>(base: T, draft: Partial<T>): T => {
  if (Array.isArray(base) || Array.isArray(draft)) {
    return (draft ?? base) as T;
  }

  if (!isPlainObject(base) || !isPlainObject(draft)) {
    return (draft ?? base) as T;
  }

  const merged = { ...base } as Record<string, unknown>;

  Object.entries(draft).forEach(([key, draftValue]) => {
    if (draftValue === undefined) {
      return;
    }

    merged[key] = mergeDraftValues((base as Record<string, unknown>)[key], draftValue as never);
  });

  return merged as T;
};

export function useSessionFormDraft<T extends FieldValues>({
  storageKey,
  form,
  initialValues,
  currentStep = 0,
  setCurrentStep,
  maxStep,
  enabled = true,
}: UseSessionFormDraftOptions<T>) {
  const hydratedRef = useRef(false);

  const clearDraft = useCallback(() => {
    if (!hasStorage()) {
      return;
    }

    window.sessionStorage.removeItem(storageKey);
  }, [storageKey]);

  const persistDraft = useCallback((values: T, step: number) => {
    if (!enabled || !hasStorage()) {
      return;
    }

    const nextStep = typeof maxStep === 'number'
      ? Math.max(0, Math.min(step, maxStep))
      : step;

    const snapshot: DraftSnapshot<T> = {
      version: 1,
      updatedAt: new Date().toISOString(),
      currentStep: nextStep,
      values,
    };

    window.sessionStorage.setItem(storageKey, JSON.stringify(snapshot));
  }, [enabled, maxStep, storageKey]);

  useEffect(() => {
    if (!enabled || hydratedRef.current || !hasStorage()) {
      return;
    }

    hydratedRef.current = true;

    const rawSnapshot = window.sessionStorage.getItem(storageKey);
    if (!rawSnapshot) {
      return;
    }

    try {
      const snapshot = JSON.parse(rawSnapshot) as Partial<DraftSnapshot<T>>;
      if (!snapshot?.values) {
        return;
      }

      const restoredValues = mergeDraftValues(initialValues, snapshot.values);
      form.reset(restoredValues);

      if (typeof snapshot.currentStep === 'number' && setCurrentStep) {
        const restoredStep = typeof maxStep === 'number'
          ? Math.max(0, Math.min(snapshot.currentStep, maxStep))
          : snapshot.currentStep;
        setCurrentStep(restoredStep);
      }
    } catch (error) {
      console.warn('No se pudo restaurar el borrador temporal del formulario', error);
      window.sessionStorage.removeItem(storageKey);
    }
  }, [enabled, form, initialValues, maxStep, setCurrentStep, storageKey]);

  useEffect(() => {
    if (!enabled || !hydratedRef.current || !hasStorage()) {
      return;
    }

    const subscription = form.watch((values) => {
      persistDraft(values as T, currentStep);
    });

    return () => subscription.unsubscribe();
  }, [currentStep, enabled, form, persistDraft]);

  useEffect(() => {
    if (!enabled || !hydratedRef.current || !hasStorage()) {
      return;
    }

    persistDraft(form.getValues(), currentStep);
  }, [currentStep, enabled, form, persistDraft]);

  return { clearDraft };
}
