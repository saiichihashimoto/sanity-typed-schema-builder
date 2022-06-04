import { describe, expect, it } from "@jest/globals";
import { z } from "zod";

import { mockRule } from "../test-utils";

import { number } from ".";

import type { ValidateShape } from "../test-utils";
import type { InferInput, InferOutput } from "../types";

describe("number", () => {
  it("builds a sanity config", () =>
    expect(number().schema()).toEqual({
      type: "number",
      validation: expect.any(Function),
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

  it("sets min", () => {
    const type = number({ min: 1 });

    const min = mockRule();

    const rule = {
      ...mockRule(),
      min: () => min,
    };

    expect(type.schema().validation?.(rule)).toEqual(min);

    const value: ValidateShape<InferInput<typeof type>, number> = 5;
    const parsedValue: ValidateShape<
      InferOutput<typeof type>,
      number
    > = type.parse(value);

    expect(parsedValue).toEqual(value);

    expect(() => {
      type.parse(0);
    }).toThrow(z.ZodError);
  });

  it("sets max", () => {
    const type = number({ max: 6 });

    const max = mockRule();

    const rule = {
      ...mockRule(),
      max: () => max,
    };

    expect(type.schema().validation?.(rule)).toEqual(max);

    const value: ValidateShape<InferInput<typeof type>, number> = 5;
    const parsedValue: ValidateShape<
      InferOutput<typeof type>,
      number
    > = type.parse(value);

    expect(parsedValue).toEqual(value);

    expect(() => {
      type.parse(9);
    }).toThrow(z.ZodError);
  });

  it("sets greaterThan", () => {
    const type = number({ greaterThan: 1 });

    const greaterThan = mockRule();

    const rule = {
      ...mockRule(),
      greaterThan: () => greaterThan,
    };

    expect(type.schema().validation?.(rule)).toEqual(greaterThan);

    const value: ValidateShape<InferInput<typeof type>, number> = 5;
    const parsedValue: ValidateShape<
      InferOutput<typeof type>,
      number
    > = type.parse(value);

    expect(parsedValue).toEqual(value);

    expect(() => {
      type.parse(0);
    }).toThrow(z.ZodError);
  });

  it("sets lessThan", () => {
    const type = number({ lessThan: 6 });

    const lessThan = mockRule();

    const rule = {
      ...mockRule(),
      lessThan: () => lessThan,
    };

    expect(type.schema().validation?.(rule)).toEqual(lessThan);

    const value: ValidateShape<InferInput<typeof type>, number> = 5;
    const parsedValue: ValidateShape<
      InferOutput<typeof type>,
      number
    > = type.parse(value);

    expect(parsedValue).toEqual(value);

    expect(() => {
      type.parse(9);
    }).toThrow(z.ZodError);
  });

  it("sets integer", () => {
    const type = number({ integer: true });

    const integer = mockRule();

    const rule = {
      ...mockRule(),
      integer: () => integer,
    };

    expect(type.schema().validation?.(rule)).toEqual(integer);

    const value: ValidateShape<InferInput<typeof type>, number> = 5;
    const parsedValue: ValidateShape<
      InferOutput<typeof type>,
      number
    > = type.parse(value);

    expect(parsedValue).toEqual(value);

    expect(() => {
      type.parse(5.5);
    }).toThrow(z.ZodError);
  });

  it("sets positive", () => {
    const type = number({ positive: true });

    const positive = mockRule();

    const rule = {
      ...mockRule(),
      positive: () => positive,
    };

    expect(type.schema().validation?.(rule)).toEqual(positive);

    const value: ValidateShape<InferInput<typeof type>, number> = 5;
    const parsedValue: ValidateShape<
      InferOutput<typeof type>,
      number
    > = type.parse(value);

    expect(parsedValue).toEqual(value);

    expect(() => {
      type.parse(-5);
    }).toThrow(z.ZodError);
  });

  it("sets negative", () => {
    const type = number({ negative: true });

    const negative = mockRule();

    const rule = {
      ...mockRule(),
      negative: () => negative,
    };

    expect(type.schema().validation?.(rule)).toEqual(negative);

    const value: ValidateShape<InferInput<typeof type>, number> = -5;
    const parsedValue: ValidateShape<
      InferOutput<typeof type>,
      number
    > = type.parse(value);

    expect(parsedValue).toEqual(value);

    expect(() => {
      type.parse(5);
    }).toThrow(z.ZodError);
  });

  it("sets precision", () => {
    const type = number({ precision: 2 });

    const precision = mockRule();

    const rule = {
      ...mockRule(),
      precision: () => precision,
    };

    expect(type.schema().validation?.(rule)).toEqual(precision);

    const value: ValidateShape<InferInput<typeof type>, number> = 0.011;
    const parsedValue: ValidateShape<
      InferOutput<typeof type>,
      number
    > = type.parse(value);

    expect(parsedValue).toEqual(0.01);
  });

  it("mocks a number", () =>
    expect(number().mock()).toEqual(expect.any(Number)));

  it("allows defining the mocks", () =>
    expect([3, 4]).toContainEqual(
      number({
        mock: (faker) => faker.helpers.arrayElement([3, 4]),
      }).mock()
    ));
});
