/**
 * Returns `message` attribute from provided error if it exists, or `defaultMessage`
 *   otherwise
 */
export function errorMessage(e: unknown, defaultMessage: string): string {
  if ((e as Error)?.message) {
    return (e as Error).message;
  }

  return defaultMessage;
}
