import { faker } from "@faker-js/faker";
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

    const rule = mockRule();

    type.schema().validation(rule);

    expect(rule.min).toHaveBeenCalledWith(1);

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

    const rule = mockRule();

    type.schema().validation(rule);

    expect(rule.max).toHaveBeenCalledWith(6);

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

    const rule = mockRule();

    type.schema().validation(rule);

    expect(rule.greaterThan).toHaveBeenCalledWith(1);

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

    const rule = mockRule();

    type.schema().validation(rule);

    expect(rule.lessThan).toHaveBeenCalledWith(6);

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

    const rule = mockRule();

    type.schema().validation(rule);

    expect(rule.integer).toHaveBeenCalled();

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

    const rule = mockRule();

    type.schema().validation(rule);

    expect(rule.positive).toHaveBeenCalled();

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

    const rule = mockRule();

    type.schema().validation(rule);

    expect(rule.negative).toHaveBeenCalled();

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

    const rule = mockRule();

    type.schema().validation(rule);

    expect(rule.precision).toHaveBeenCalledWith(2);

    const value: ValidateShape<InferInput<typeof type>, number> = 0.011;
    const parsedValue: ValidateShape<
      InferOutput<typeof type>,
      number
    > = type.parse(value);

    expect(parsedValue).toEqual(0.01);
  });

  it("mocks a number", () =>
    expect(number().mock(faker)).toEqual(expect.any(Number)));

  it("allows defining the mocks", () =>
    expect([3, 4]).toContainEqual(
      number({
        mock: (faker) => faker.helpers.arrayElement([3, 4]),
      }).mock(faker)
    ));

  it("allows defining the zod", () => {
    const type = number({
      zod: (zod) => zod.transform((value) => `${value}`),
    });

    const parsedValue: ValidateShape<
      InferOutput<typeof type>,
      string
    > = type.parse(5);

    expect(parsedValue).toEqual("5");
  });

  it("types custom validation", () => {
    const type = number({
      validation: (Rule) =>
        Rule.custom((value) => {
          const number: ValidateShape<typeof value, number> = value;

          return number > 50 || "Needs to be more than 50";
        }),
    });

    const rule = mockRule();

    type.schema().validation(rule);

    expect(rule.custom).toHaveBeenCalledWith(expect.any(Function));
  });
});
