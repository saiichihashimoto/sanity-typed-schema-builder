import { describe, expect, it } from "@jest/globals";
import { ZodError } from "zod";

import { s } from "..";

describe("url", () => {
  it("builds a sanity config", () =>
    expect(s.url().schema()).toEqual({
      type: "url",
    }));

  it("passes through schema values", () =>
    expect(s.url({ hidden: false }).schema()).toHaveProperty("hidden", false));

  it("parses into a string", () => {
    const type = s.url();

    const value: s.input<typeof type> = "https://example.com/img.jpg";
    const parsedValue: s.output<typeof type> = type.parse(value);

    expect(parsedValue).toEqual(value);
  });

  it("enforces a url", () => {
    const type = s.url();

    const value = "not a url";

    expect(() => {
      type.parse(value);
    }).toThrow(ZodError);
  });
});
