import { describe, expect, it } from "@jest/globals";
import { z } from "zod";

import { mockRule } from "../test-utils";

import { datetime } from ".";

import type { ValidateShape } from "../test-utils";
import type { InferInput, InferOutput } from "../types";

describe("datetime", () => {
  it("builds a sanity config", () =>
    expect(datetime().schema()).toEqual({
      type: "datetime",
      validation: expect.any(Function),
    }));

  it("passes through schema values", () =>
    expect(datetime({ hidden: false }).schema()).toHaveProperty(
      "hidden",
      false
    ));

  it("parses into a Date", () => {
    const type = datetime();

    const value: ValidateShape<
      InferInput<typeof type>,
      string
    > = "2022-06-03T03:24:55.395Z";
    const parsedValue: ValidateShape<
      InferOutput<typeof type>,
      Date
    > = type.parse(value);

    expect(parsedValue).toEqual(new Date(value));
  });

  it("enforces a valid Date", () => {
    const type = datetime();

    const value: ValidateShape<InferInput<typeof type>, string> = "not a date";

    expect(() => {
      type.parse(value);
    }).toThrow(z.ZodError);
  });

  it("sets min", () => {
    const type = datetime({ min: "2022-06-03T03:24:55.395Z" });

    const min = mockRule();

    const rule = {
      ...mockRule(),
      min: () => min,
    };

    expect(type.schema().validation?.(rule)).toEqual(min);

    const value: ValidateShape<
      InferInput<typeof type>,
      string
    > = "2022-06-03T03:24:55.390Z";

    expect(() => {
      type.parse(value);
    }).toThrow(z.ZodError);
  });

  it("sets max", () => {
    const type = datetime({ max: "2022-06-03T03:24:55.395Z" });

    const max = mockRule();

    const rule = {
      ...mockRule(),
      max: () => max,
    };

    expect(type.schema().validation?.(rule)).toEqual(max);

    const value: ValidateShape<
      InferInput<typeof type>,
      string
    > = "2022-06-03T03:24:55.399Z";

    expect(() => {
      type.parse(value);
    }).toThrow(z.ZodError);
  });
});
