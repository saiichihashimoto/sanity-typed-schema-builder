import { describe, expect, it } from "@jest/globals";

import { number } from ".";

import type { ValidateShape } from "../test-utils";
import type { InferInput, InferOutput } from "../types";

describe("number", () => {
  it("builds a sanity config", () =>
    expect(number().schema()).toEqual({
      type: "number",
    }));

  it("passes through schema values", () =>
    expect(number({ hidden: false }).schema()).toHaveProperty("hidden", false));

  it("parses into a number", () => {
    const type = number();

    const value: ValidateShape<InferInput<typeof type>, number> = 5;
    const parsedValue: ValidateShape<
      InferOutput<typeof type>,
      number
    > = type.parse(value);

    expect(parsedValue).toEqual(value);
  });
});
