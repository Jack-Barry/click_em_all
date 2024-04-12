import { readonly, writable } from "svelte/store";
import { errorMessage } from "./errors";

/** Provides store for boolean state toggle */
export function toggleStore(defaultValue = false) {
  const state = writable(defaultValue);

  function toggle() {
    state.update((prev) => !prev);
  }

  return {
    state,
    toggle,
  };
}

/**
 * Provides store that takes care of boilerplate for common try/catch pattern for
 *   form submissions
 */
export function tryCatchStore<Args extends any[]>(
  fn: (...args: Args) => void | Promise<void>,
  defaultErrorMessage: string
) {
  const errors = writable<string[]>([]);
  const submit = async function (...args: Args) {
    errors.set([]);

    try {
      await fn(...args);
    } catch (e) {
      errors.set([errorMessage(e, defaultErrorMessage)]);
    }
  };

  return {
    errors: readonly(errors),
    submit,
  };
}
