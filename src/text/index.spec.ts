import { faker } from "@faker-js/faker";
import { describe, expect, it } from "@jest/globals";
import { z } from "zod";

import { mockRule } from "../test-utils";

import { text } from ".";

import type { ValidateShape } from "../test-utils";
import type { InferInput, InferOutput } from "../types";

describe("text", () => {
  it("builds a sanity config", () =>
    expect(text().schema()).toEqual({
      type: "text",
      validation: expect.any(Function),
    }));

  it("passes through schema values", () =>
    expect(text({ hidden: false }).schema()).toHaveProperty("hidden", false));

  it("parses into a text", () => {
    const type = text();

    const value: ValidateShape<InferInput<typeof type>, string> = "foo";
    const parsedValue: ValidateShape<
      InferOutput<typeof type>,
      string
    > = type.parse(value);

    expect(parsedValue).toEqual(value);
  });

  it("sets min", () => {
    const type = text({ min: 3 });

    const rule = mockRule();

    type.schema().validation(rule);

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
    const type = text({ max: 4 });

    const rule = mockRule();

    type.schema().validation(rule);

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
    const type = text({ length: 3 });

    const rule = mockRule();

    type.schema().validation(rule);

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
    const type = text({ regex: /^foo$/ });

    const rule = mockRule();

    type.schema().validation(rule);

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

  it("mocks some paragraphs", () =>
    expect(text().mock(faker)).toEqual(expect.any(String)));

  it("mocks the same value with the same path", () => {
    expect(text().mock(faker)).toEqual(text().mock(faker));
    expect(text().mock(faker, ".foo")).toEqual(text().mock(faker, ".foo"));

    expect(text().mock(faker, ".foo")).not.toEqual(text().mock(faker));
    expect(text().mock(faker)).not.toEqual(text().mock(faker, ".foo"));
  });

  it("allows defining the mocks", () =>
    expect(["Option 1", "Option 2"]).toContainEqual(
      text({
        mock: (faker) => faker.helpers.arrayElement(["Option 1", "Option 2"]),
      }).mock(faker)
    ));

  it("allows defining the zod", () => {
    const type = text({
      zod: (zod) => zod.transform((value) => value.length),
    });

    const parsedValue: ValidateShape<
      InferOutput<typeof type>,
      number
    > = type.parse("Test string");

    expect(parsedValue).toEqual(11);
  });

  it("types custom validation", () => {
    const type = text({
      validation: (Rule) =>
        Rule.custom((value) => {
          const text: ValidateShape<typeof value, string> = value;

          return text.length > 50 || "Needs to be 50 characters";
        }),
    });

    const rule = mockRule();

    type.schema().validation(rule);

    expect(rule.custom).toHaveBeenCalledWith(expect.any(Function));
  });
});
