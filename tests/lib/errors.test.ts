import { errorMessage } from "../../src/lib/errors";

describe("Lib: Errors", () => {
  describe("errorMessage", () => {
    test("returns default message if messsge is not available on error value", () => {
      const DEFAULT = "hola";
      expect(errorMessage(undefined, DEFAULT)).toBe(DEFAULT);
      expect(errorMessage(null, DEFAULT)).toBe(DEFAULT);
      expect(errorMessage([], DEFAULT)).toBe(DEFAULT);
      expect(errorMessage("hello", DEFAULT)).toBe(DEFAULT);
      expect(errorMessage({}, DEFAULT)).toBe(DEFAULT);
    });

    test("returns error message if available", () => {
      expect(errorMessage({ message: "hello" }, "hola")).toBe("hello");
    });
  });
});
