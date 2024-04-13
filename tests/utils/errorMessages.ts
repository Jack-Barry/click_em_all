import type { ZodType } from "zod";

export function getExpectedErrorMessages<T>(schema: ZodType<T>, value: T) {
  const expectedParseResult = schema.safeParse(value);

  if (expectedParseResult.success) {
    throw new Error("should be error when parsing");
  }

  return expectedParseResult.error.errors.map((e) => e.message);
}
