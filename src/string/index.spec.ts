import { describe, expect, it } from "@jest/globals";
import { z } from "zod";

import { mockRule } from "../test-utils";

import { string } from ".";

import type { ValidateShape } from "../test-utils";
import type { InferInput, InferOutput } from "../types";

describe("string", () => {
  it("builds a sanity config", () =>
    expect(string().schema()).toEqual({
      type: "string",
      validation: expect.any(Function),
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

  it("sets min", () => {
    const type = string({ min: 3 });

    const min = mockRule();

    const rule = {
      ...mockRule(),
      min: () => min,
    };

    expect(type.schema().validation?.(rule)).toEqual(min);

    const value: ValidateShape<InferInput<typeof type>, string> = "foo";
    const parsedValue: ValidateShape<
      InferOutput<typeof type>,
      string
    > = type.parse(value);

    expect(parsedValue).toEqual(value);

    expect(() => {
      type.parse("fo");
    }).toThrow(z.ZodError);
  });

  it("sets max", () => {
    const type = string({ max: 4 });

    const max = mockRule();

    const rule = {
      ...mockRule(),
      max: () => max,
    };

    expect(type.schema().validation?.(rule)).toEqual(max);

    const value: ValidateShape<InferInput<typeof type>, string> = "foo";
    const parsedValue: ValidateShape<
      InferOutput<typeof type>,
      string
    > = type.parse(value);

    expect(parsedValue).toEqual(value);

    expect(() => {
      type.parse("foobar");
    }).toThrow(z.ZodError);
  });

  it("sets length", () => {
    const type = string({ length: 3 });

    const length = mockRule();

    const rule = {
      ...mockRule(),
      length: () => length,
    };

    expect(type.schema().validation?.(rule)).toEqual(length);

    const value: ValidateShape<InferInput<typeof type>, string> = "foo";
    const parsedValue: ValidateShape<
      InferOutput<typeof type>,
      string
    > = type.parse(value);

    expect(parsedValue).toEqual(value);

    expect(() => {
      type.parse("fooo");
    }).toThrow(z.ZodError);
  });

  it("sets regex", () => {
    const type = string({ regex: /^foo$/ });

    const regex = mockRule();

    const rule = {
      ...mockRule(),
      regex: () => regex,
    };

    expect(type.schema().validation?.(rule)).toEqual(regex);

    const value: ValidateShape<InferInput<typeof type>, string> = "foo";
    const parsedValue: ValidateShape<
      InferOutput<typeof type>,
      string
    > = type.parse(value);

    expect(parsedValue).toEqual(value);

    expect(() => {
      type.parse("bar");
    }).toThrow(z.ZodError);
  });

  it("mocks a word", () => expect(string().mock()).toEqual(expect.any(String)));

  it("allows defining the mocks", () =>
    expect(["Option 1", "Option 2"]).toContainEqual(
      string({
        mock: (faker) => faker.helpers.arrayElement(["Option 1", "Option 2"]),
      }).mock()
    ));
});
