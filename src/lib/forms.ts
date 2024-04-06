/** Translates data from submit event into a key/value object */
export function objectFromFormData(e: SubmitEvent) {
  const formData = new FormData(e.target as HTMLFormElement);

  return Array.from(formData.entries()).reduce<Record<string, any>>(
    (result, [key, value]) => {
      result[key] = value;
      return result;
    },
    {}
  );
}
