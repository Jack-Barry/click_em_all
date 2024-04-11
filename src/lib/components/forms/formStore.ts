import { derived, writable } from "svelte/store";

/** Event from an `HTMLInputElement` */
type InputEvent = Event & {
  currentTarget: EventTarget & HTMLInputElement;
};

/** State tracked for each field in in `FormStoreState` */
export type FormStoreField = {
  /** Value to initialize field with */
  defaultValue: string;
  /** Current value of the field */
  value: string;
  /** Field has been edited at some point */
  dirty: boolean;
  /** Field value does not currently match `defaultValue` */
  hasChanged: boolean;
  /** User has visited field */
  touched: boolean;
  /** `hasChanged` should take case-sensitivity into account */
  caseSensitive: boolean;
  /** Error messages related to the field */
  errors: string[];
};

/** Object used to initialize a field's state */
export type FormStoreInitField = Partial<
  Pick<FormStoreField, "defaultValue" | "caseSensitive">
>;

/** Object used to initialize `FormStoreState` */
export type FormStoreInit<K extends string = string> = Record<
  K,
  FormStoreInitField | string
>;

/** State of form fields */
export type FormStoreState<K extends string = string> = Record<
  K,
  FormStoreField
>;

/** Object of errors to apply to a form */
export type FormStoreErrors<K extends string = string> = Partial<
  Record<K, string[]>
>;

export type FormStore<K extends string = string> = ReturnType<
  typeof formStore<K>
>;

/**
 * Provides a custom store for handling form interactions
 */
export function formStore<K extends string = string>(
  initialState: FormStoreInit<K>
) {
  const baseState = writable(formStoreStateFromInit(initialState));

  const fields = derived(baseState, ($fields: FormStoreState<K>) => {
    Object.keys($fields).forEach((key) => {
      const field = $fields[key as keyof typeof $fields];
      field.hasChanged = fieldHasChanged(field);
    });
    return $fields;
  });

  const hasChanges = derived(fields, ($fields: FormStoreState<K>) =>
    Object.values<FormStoreField>($fields).some((v) => v.hasChanged)
  );

  const hasErrors = derived(fields, ($fields: FormStoreState<K>) =>
    Object.values<FormStoreField>($fields).some((v) => !!v.errors.length)
  );

  function setErrors(errors: FormStoreErrors) {
    baseState.update((prev) => {
      Object.keys(prev).forEach((key) => {
        const k = key as K;
        prev[k].errors = errors[k] || [];
      });
      return prev;
    });
  }

  function clearErrors() {
    setErrors({});
  }

  function setErrorsOnField(key: K, errors: string[]) {
    baseState.update((prev) => {
      prev[key].errors = errors;
      return prev;
    });
  }

  function resetFieldValue(
    key: K,
    options: {
      resetDirty?: boolean;
      resetTouched?: boolean;
      resetErrors?: boolean;
    } = {}
  ) {
    baseState.update((prev) => {
      prev[key].value = prev[key].defaultValue;

      if (options.resetDirty) {
        prev[key].dirty = false;
      }

      if (options.resetTouched) {
        prev[key].touched = false;
      }

      if (options.resetErrors) {
        prev[key].errors = [];
      }

      return prev;
    });
  }

  function setAllFieldsTouched() {
    baseState.update((prev) => {
      Object.keys(prev).forEach((key) => {
        prev[key as K].touched = true;
      });
      return prev;
    });
  }

  function onInput(e: InputEvent) {
    baseState.update((prev) => {
      const key = e.currentTarget.name as K;
      prev[key].dirty = true;
      prev[key].value = e.currentTarget.value;
      return prev;
    });
  }

  function onBlur(e: InputEvent) {
    baseState.update((prev) => {
      const key = e.currentTarget.name as K;
      prev[key].touched = true;
      return prev;
    });
  }

  return {
    /** State of form's constituent fields */
    fields,
    /** At least one value in the form has changed */
    hasChanges,
    /** At least one field in the form has errors */
    hasErrors,
    /**
     * Callback to invoke for `on:input` to update current field value
     *
     * Uses `name` attribute from `input` as key of `fields`
     */
    onInput,
    /**
     * Callback to invoke for `on:blur`
     *
     * Uses `name` attribute from `input` as key of `fields`
     */
    onBlur,
    /** Function to set `errors` on entire form in one pass */
    setErrors,
    /** Function to set `errors` on specified field */
    setErrorsOnField,
    /** Function to reset specified field */
    resetFieldValue,
    /** Function to clear *all* errors in the form */
    clearErrors,
  };
}

function formStoreStateFromInit<K extends string = string>(
  init: FormStoreInit<K>
): FormStoreState<K> {
  const state: Partial<FormStoreState<K>> = {};

  Object.entries<FormStoreInitField | string>(init).forEach(([key, value]) => {
    let fieldState: FormStoreField;
    if (typeof value === "string") {
      fieldState = initializeField({ defaultValue: value });
    } else {
      fieldState = initializeField(value);
    }
    state[key as K] = fieldState;
  });

  return state as FormStoreState<K>;
}

function initializeField(value: FormStoreInitField): FormStoreField {
  const { defaultValue = "", caseSensitive = false } = value;

  return {
    defaultValue,
    value: defaultValue,
    caseSensitive,
    dirty: false,
    touched: false,
    hasChanged: false,
    errors: [],
  };
}

function fieldHasChanged(field: FormStoreField) {
  return field.caseSensitive
    ? field.value !== field.defaultValue
    : field.value.toLowerCase() !== field.defaultValue.toLowerCase();
}
