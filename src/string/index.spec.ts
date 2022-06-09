import { faker } from "@faker-js/faker";
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

    const rule = mockRule();

    type.schema().validation?.(rule);

    expect(rule.min).toHaveBeenCalledWith(3);

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

    const rule = mockRule();

    type.schema().validation?.(rule);

    expect(rule.max).toHaveBeenCalledWith(4);

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

    const rule = mockRule();

    type.schema().validation?.(rule);

    expect(rule.length).toHaveBeenCalledWith(3);

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

    const rule = mockRule();

    type.schema().validation?.(rule);

    expect(rule.regex).toHaveBeenCalledWith(/^foo$/);

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

  it("mocks a word", () =>
    expect(string().mock(faker)).toEqual(expect.any(String)));

  it("allows defining the mocks", () =>
    expect(["Option 1", "Option 2"]).toContainEqual(
      string({
        mock: (faker) => faker.helpers.arrayElement(["Option 1", "Option 2"]),
      }).mock(faker)
    ));

  it("types custom validation", () => {
    const type = string({
      validation: (Rule) =>
        Rule.custom(
          (string) => string.length > 50 || "Needs to be 50 characters"
        ),
    });

    const rule = mockRule();

    type.schema().validation?.(rule);

    expect(rule.custom).toHaveBeenCalledWith(expect.any(Function));
  });

  it("types custom validation", () => {
    const type = string({
      validation: (Rule) =>
        Rule.custom((value) => {
          const string: ValidateShape<typeof value, string> = value;

          return string.length > 50 || "Needs to be 50 characters";
        }),
    });

    const rule = mockRule();

    type.schema().validation?.(rule);

    expect(rule.custom).toHaveBeenCalledWith(expect.any(Function));
  });
});
