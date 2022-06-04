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
    const type = text({ max: 4 });

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
    const type = text({ length: 3 });

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
    const type = text({ regex: /^foo$/ });

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

  it("mocks some paragraphs", () =>
    expect(text().mock()).toEqual(expect.any(String)));

  it("allows defining the mocks", () =>
    expect(["Option 1", "Option 2"]).toContainEqual(
      text({
        mock: (faker) => faker.helpers.arrayElement(["Option 1", "Option 2"]),
      }).mock()
    ));
});
