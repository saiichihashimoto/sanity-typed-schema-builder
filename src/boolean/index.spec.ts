import { describe, expect, it } from "@jest/globals";

import { boolean } from ".";

import type { InferInput, InferOutput } from "../types";

describe("boolean", () => {
  it("builds a sanity config", () =>
    expect(boolean().schema()).toEqual({
      type: "boolean",
    }));

  it("passes through schema values", () =>
    expect(boolean({ hidden: false }).schema()).toHaveProperty(
      "hidden",
      false
    ));

  it("parses into a boolean", () => {
    const type = boolean();

    const value: InferInput<typeof type> = true;
    const parsedValue: InferOutput<typeof type> = type.parse(value);

    expect(parsedValue).toEqual(value);
  });
});
