import type { FormFieldState } from "./types";

/** Generates a blank form field state */
export function makeFormField(): FormFieldState {
  return {
    value: "",
    touched: false,
    changed: false,
    dirty: false,
    errors: [],
  };
}
