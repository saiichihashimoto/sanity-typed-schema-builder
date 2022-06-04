import { describe, expect, it } from "@jest/globals";

import { date } from ".";

import type { ValidateShape } from "../test-utils";
import type { InferInput, InferOutput } from "../types";

describe("date", () => {
  it("builds a sanity config", () =>
    expect(date().schema()).toEqual({
      type: "date",
    }));

  it("passes through schema values", () =>
    expect(date({ hidden: false }).schema()).toHaveProperty("hidden", false));

  it("parses into a date", () => {
    const type = date();

    const value: ValidateShape<InferInput<typeof type>, string> = "2017-02-12";
    const parsedValue: ValidateShape<
      InferOutput<typeof type>,
      string
    > = type.parse(value);

    expect(parsedValue).toEqual(value);
  });
});
