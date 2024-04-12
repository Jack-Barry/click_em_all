import type { ZodFormattedError } from "zod";
import {
  type FormStoreErrors,
  formStore,
  type FormStoreInit,
} from "./formStore";

/**
 * Provides light wrapper around `formStore` to allow populating error messages
 *   based on Zod schema validation results
 */
export function formStoreZod<K extends string = string>(
  initialState: FormStoreInit<K>
) {
  const store = formStore(initialState);

  function applyValidationErrors(
    validationErrors: ZodFormattedError<Record<K, string>>
  ) {
    const formErrors = Object.entries(validationErrors).reduce<FormStoreErrors>(
      (result, [key, value]) => {
        if (Array.isArray(value)) {
          result[key] = value;
        } else {
          result[key] = (value as { _errors: string[] })?._errors;
        }
        return result;
      },
      {}
    );
    store.setErrors(formErrors);
  }

  return {
    store,
    applyValidationErrors,
  };
}
