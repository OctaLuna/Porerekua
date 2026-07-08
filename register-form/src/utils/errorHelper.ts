import { ApiError } from './apiClient';

type ParsedApiError = {
  userMessage: string;
  technical?: string;
  fieldErrors?: Record<string, string> | undefined;
};

const isRecord = (value: unknown): value is Record<string, unknown> => (
  typeof value === 'object' && value !== null
);

export function parseApiError(error: unknown): ParsedApiError {
  // Default fallback
  const defaultMsg = 'Ocurrió un error al enviar el formulario. Intenta nuevamente.';

  if (error instanceof ApiError) {
    const details: unknown = error.details;

    // Determine a friendly top-level message depending on status
    if (error.status === 0) {
      return { userMessage: 'No se pudo conectar con el servidor. Revisa tu conexión e intenta de nuevo.', technical: JSON.stringify(details ?? error.message) };
    }
    if (error.status && error.status >= 500) {
      return { userMessage: 'Error en el servidor. Intenta más tarde.', technical: JSON.stringify(details ?? error.message) };
    }

    // Validation / payload errors
    if (details) {
      if (isRecord(details)) {
        // If the API returns an object with field-level errors
        if (isRecord(details.errors)) {
          const fieldErrors: Record<string, string> = {};
          Object.entries(details.errors).forEach(([k, v]) => {
            fieldErrors[k] = Array.isArray(v) ? v.join(' ') : String(v);
          });
          return { userMessage: 'Hay errores en algunos campos. Revíselos por favor.', technical: JSON.stringify(details), fieldErrors };
        }

        // If message is an array (list of messages) or string
        if (Array.isArray(details.message)) {
          return { userMessage: details.message.join(' '), technical: JSON.stringify(details) };
        }

        if (typeof details.message === 'string') {
          return { userMessage: details.message, technical: JSON.stringify(details) };
        }

        // Unknown structured details
        return { userMessage: defaultMsg, technical: JSON.stringify(details) };
      }

      // If details itself is a string
      if (typeof details === 'string') {
        return { userMessage: details, technical: details };
      }

      // Unknown details shape
      return { userMessage: defaultMsg, technical: JSON.stringify(details) };
    }

    // Fallback to ApiError's message
    return { userMessage: error.message || defaultMsg, technical: JSON.stringify(error) };
  }

  // Non-ApiError fallback
  return { userMessage: defaultMsg, technical: typeof error === 'string' ? error : JSON.stringify(error) };
}

export default parseApiError;
