import { faker } from "@faker-js/faker";
import { describe, expect, it } from "@jest/globals";
import { z } from "zod";

import { string } from ".";
import { mockRule } from "../test-utils";
import type { ValidateShape } from "../test-utils";
import type {
  InferParsedValue,
  InferResolvedValue,
  InferValue,
} from "../types";

describe("string", () => {
  it("builds a sanity config", () =>
    expect(string().schema()).toStrictEqual({
      type: "string",
      options: undefined,
      validation: expect.any(Function),
    }));

  it("passes through schema values", () =>
    expect(string({ hidden: false }).schema()).toHaveProperty("hidden", false));

  it("parses into a string", () => {
    const type = string();

    const value: ValidateShape<InferValue<typeof type>, string> = "foo";
    const parsedValue: ValidateShape<
      InferParsedValue<typeof type>,
      string
    > = type.parse(value);

    expect(parsedValue).toStrictEqual(value);
  });

  it("resolves into a string", () => {
    const type = string();

    const value: ValidateShape<InferValue<typeof type>, string> = "foo";
    const resolvedValue: ValidateShape<
      InferResolvedValue<typeof type>,
      string
    > = type.resolve(value);

    expect(resolvedValue).toStrictEqual(value);
  });

  it("sets min", () => {
    const type = string({ min: 3 });

    const rule = mockRule();

    type.schema().validation(rule);

    expect(rule.min).toHaveBeenCalledWith(3);

    const value: ValidateShape<InferValue<typeof type>, string> = "foo";
    const parsedValue: ValidateShape<
      InferParsedValue<typeof type>,
      string
    > = type.parse(value);

    expect(parsedValue).toStrictEqual(value);

    expect(() => {
      type.parse("fo");
    }).toThrow(z.ZodError);
  });

  it("sets max", () => {
    const type = string({ max: 4 });

    const rule = mockRule();

    type.schema().validation(rule);

    expect(rule.max).toHaveBeenCalledWith(4);

    const value: ValidateShape<InferValue<typeof type>, string> = "foo";
    const parsedValue: ValidateShape<
      InferParsedValue<typeof type>,
      string
    > = type.parse(value);

    expect(parsedValue).toStrictEqual(value);

    expect(() => {
      type.parse("foobar");
    }).toThrow(z.ZodError);
  });

  it("sets length", () => {
    const type = string({ length: 3 });

    const rule = mockRule();

    type.schema().validation(rule);

    expect(rule.length).toHaveBeenCalledWith(3);

    const value: ValidateShape<InferValue<typeof type>, string> = "foo";
    const parsedValue: ValidateShape<
      InferParsedValue<typeof type>,
      string
    > = type.parse(value);

    expect(parsedValue).toStrictEqual(value);

    expect(() => {
      type.parse("fooo");
    }).toThrow(z.ZodError);
  });

  it("sets regex", () => {
    const type = string({ regex: /^foo$/ });

    const rule = mockRule();

    type.schema().validation(rule);

    expect(rule.regex).toHaveBeenCalledWith(/^foo$/);

    const value: ValidateShape<InferValue<typeof type>, string> = "foo";
    const parsedValue: ValidateShape<
      InferParsedValue<typeof type>,
      string
    > = type.parse(value);

    expect(parsedValue).toStrictEqual(value);

    expect(() => {
      type.parse("bar");
    }).toThrow(z.ZodError);
  });

  it("mocks a word", () =>
    expect(string().mock(faker)).toStrictEqual(expect.any(String)));

  it("mocks the same value with the same path", () => {
    expect(string().mock(faker)).toStrictEqual(string().mock(faker));
    expect(string().mock(faker, ".foo")).toStrictEqual(
      string().mock(faker, ".foo")
    );

    expect(string().mock(faker, ".foo")).not.toStrictEqual(
      string().mock(faker)
    );
    expect(string().mock(faker)).not.toStrictEqual(
      string().mock(faker, ".foo")
    );
  });

  it("allows defining the mocks", () =>
    expect(["Option 1", "Option 2"]).toContainEqual(
      string({
        mock: (faker) => faker.helpers.arrayElement(["Option 1", "Option 2"]),
      }).mock(faker)
    ));

  it("allows defining the zod", () => {
    const type = string({
      zod: (zod) => zod.transform((value) => value.length),
    });

    const parsedValue: ValidateShape<
      InferParsedValue<typeof type>,
      number
    > = type.parse("Test string");

    expect(parsedValue).toBe(11);
  });

  it("types custom validation", () => {
    const type = string({
      validation: (Rule) =>
        Rule.custom((value) => {
          const string: ValidateShape<typeof value, string | undefined> = value;

          return (string?.length ?? 0) > 50 || "Needs to be 50 characters";
        }),
    });

    const rule = mockRule();

    type.schema().validation(rule);

    expect(rule.custom).toHaveBeenCalledWith(expect.any(Function));
  });

  it("types values from list", () => {
    const type = string({
      options: {
        list: ["foo", { title: "Bar", value: "bar" }],
      },
    });

    const value: ValidateShape<InferValue<typeof type>, "bar" | "foo"> = "foo";
    const parsedValue: ValidateShape<
      InferParsedValue<typeof type>,
      "bar" | "foo"
    > = type.parse(value);

    expect(parsedValue).toStrictEqual(value);
    expect(["foo", "bar"]).toContain(type.mock(faker));

    expect(() => {
      type.parse("fo");
    }).toThrow(z.ZodError);
  });
});
