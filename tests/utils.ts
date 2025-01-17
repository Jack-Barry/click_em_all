/**
 * Transforms object into stringified JSON that is compatible with
 * @testing-library/user-event text input utils
 **/
export function _jsonAsTextInput_(json: unknown) {
  return JSON.stringify(json).replaceAll('{', '{{').replaceAll('[', '[[')
}
