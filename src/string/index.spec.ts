import { describe, expect, it } from "@jest/globals";

import { string } from ".";

import type { ValidateShape } from "../test-utils";
import type { InferInput, InferOutput } from "../types";

describe("string", () => {
  it("builds a sanity config", () =>
    expect(string().schema()).toEqual({
      type: "string",
    }));

  it("passes through schema values", () =>
    expect(string({ hidden: false }).schema()).toHaveProperty("hidden", false));

  it("parses into a string", () => {
    const type = string();

    const value: ValidateShape<InferInput<typeof type>, string> = "foo";
    const parsedValue: ValidateShape<
      InferOutput<typeof type>,
      string
    > = type.parse(value);

    expect(parsedValue).toEqual(value);
  });
});
