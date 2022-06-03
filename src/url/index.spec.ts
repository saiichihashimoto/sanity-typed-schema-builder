import { describe, expect, it } from "@jest/globals";
import { ZodError } from "zod";

import { url } from ".";

import type { InferInput, InferOutput } from "../types";

describe("url", () => {
  it("builds a sanity config", () =>
    expect(url().schema()).toEqual({
      type: "url",
    }));

  it("passes through schema values", () =>
    expect(url({ hidden: false }).schema()).toHaveProperty("hidden", false));

  it("parses into a string", () => {
    const type = url();

    const value: InferInput<typeof type> = "https://example.com/img.jpg";
    const parsedValue: InferOutput<typeof type> = type.parse(value);

    expect(parsedValue).toEqual(value);
  });

  it("enforces a url", () => {
    const type = url();

    const value = "not a url";

    expect(() => {
      type.parse(value);
    }).toThrow(ZodError);
  });
});
