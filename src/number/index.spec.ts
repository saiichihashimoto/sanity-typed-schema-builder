import { faker } from "@faker-js/faker";
import { describe, expect, it } from "@jest/globals";
import { s } from "@sanity-typed/schema-builder";
import { z } from "zod";

import { mockRule } from "../test-utils";
import type { Equal, Expect } from "../test-utils";

describe("number", () => {
  it("builds a sanity config", () =>
    expect(s.number().schema()).toStrictEqual({
      type: "number",
      validation: expect.any(Function),
      options: undefined,
    }));

  it("passes through schema values", () =>
    expect(s.number({ hidden: false }).schema()).toHaveProperty(
      "hidden",
      false
    ));

  it("parses into a number", () => {
    const type = s.number();

    const value = 5;
    const parsedValue = type.parse(value);

    type Assertions = [Expect<Equal<typeof parsedValue, number>>];

    expect(parsedValue).toStrictEqual(value);
  });

  it("resolves into a number", () => {
    const type = s.number();

    const value = 5;
    const resolvedValue = type.resolve(value);

    type Assertions = [Expect<Equal<typeof resolvedValue, number>>];

    expect(resolvedValue).toStrictEqual(value);
  });

  it("sets min", () => {
    const type = s.number({ min: 1 });

    const rule = mockRule();

    type.schema().validation(rule);

    expect(rule.min).toHaveBeenCalledWith(1);

    const value = 5;
    const parsedValue = type.parse(value);

    expect(parsedValue).toStrictEqual(value);

    expect(() => {
      type.parse(0);
    }).toThrow(z.ZodError);
  });

  it("sets max", () => {
    const type = s.number({ max: 6 });

    const rule = mockRule();

    type.schema().validation(rule);

    expect(rule.max).toHaveBeenCalledWith(6);

    const value = 5;
    const parsedValue = type.parse(value);

    expect(parsedValue).toStrictEqual(value);

    expect(() => {
      type.parse(9);
    }).toThrow(z.ZodError);
  });

  it("sets greaterThan", () => {
    const type = s.number({ greaterThan: 1 });

    const rule = mockRule();

    type.schema().validation(rule);

    expect(rule.greaterThan).toHaveBeenCalledWith(1);

    const value = 5;
    const parsedValue = type.parse(value);

    expect(parsedValue).toStrictEqual(value);

    expect(() => {
      type.parse(0);
    }).toThrow(z.ZodError);
  });

  it("sets lessThan", () => {
    const type = s.number({ lessThan: 6 });

    const rule = mockRule();

    type.schema().validation(rule);

    expect(rule.lessThan).toHaveBeenCalledWith(6);

    const value = 5;
    const parsedValue = type.parse(value);

    expect(parsedValue).toStrictEqual(value);

    expect(() => {
      type.parse(9);
    }).toThrow(z.ZodError);
  });

  it("sets integer", () => {
    const type = s.number({ integer: true });

    const rule = mockRule();

    type.schema().validation(rule);

    expect(rule.integer).toHaveBeenCalledWith();

    const value = 5;
    const parsedValue = type.parse(value);

    expect(parsedValue).toStrictEqual(value);

    expect(() => {
      type.parse(5.5);
    }).toThrow(z.ZodError);
  });

  it("sets positive", () => {
    const type = s.number({ positive: true });

    const rule = mockRule();

    type.schema().validation(rule);

    expect(rule.positive).toHaveBeenCalledWith();

    const value = 5;
    const parsedValue = type.parse(value);

    expect(parsedValue).toStrictEqual(value);

    expect(() => {
      type.parse(-5);
    }).toThrow(z.ZodError);
  });

  it("sets negative", () => {
    const type = s.number({ negative: true });

    const rule = mockRule();

    type.schema().validation(rule);

    expect(rule.negative).toHaveBeenCalledWith();

    const value = -5;
    const parsedValue = type.parse(value);

    expect(parsedValue).toStrictEqual(value);

    expect(() => {
      type.parse(5);
    }).toThrow(z.ZodError);
  });

  it("sets precision", () => {
    const type = s.number({ precision: 2 });

    const rule = mockRule();

    type.schema().validation(rule);

    expect(rule.precision).toHaveBeenCalledWith(2);

    const value = 0.011;
    const parsedValue = type.parse(value);

    expect(parsedValue).toBe(0.01);
  });

  it("mocks a number", () =>
    expect(s.number().mock(faker)).toStrictEqual(expect.any(Number)));

  it("mocks the same value with the same path", () => {
    expect(s.number().mock(faker)).toStrictEqual(s.number().mock(faker));
    expect(s.number().mock(faker, ".foo")).toStrictEqual(
      s.number().mock(faker, ".foo")
    );

    expect(s.number().mock(faker, ".foo")).not.toStrictEqual(
      s.number().mock(faker)
    );
    expect(s.number().mock(faker)).not.toStrictEqual(
      s.number().mock(faker, ".foo")
    );
  });

  it("allows defining the mocks", () =>
    expect([3, 4]).toContainEqual(
      s
        .number({
          mock: (faker) => faker.helpers.arrayElement([3, 4]),
        })
        .mock(faker)
    ));

  it("allows defining the zod", () => {
    const type = s.number({
      zod: (zod) => zod.transform((value) => `${value}`),
    });

    const value = 5;
    const parsedValue = type.parse(value);

    type Assertions = [Expect<Equal<typeof parsedValue, string>>];

    expect(parsedValue).toBe("5");
  });

  it("types custom validation", () => {
    const type = s.number({
      validation: (Rule) =>
        Rule.custom((value) => {
          type Assertions = [Expect<Equal<typeof value, number | undefined>>];

          return (value ?? 0) > 50 || "Needs to be more than 50";
        }),
    });

    const rule = mockRule();

    type.schema().validation(rule);

    expect(rule.custom).toHaveBeenCalledWith(expect.any(Function));
  });

  it("types values from list", () => {
    const type = s.number({
      options: {
        list: [3, { title: "Four", value: 4 }],
      },
    });

    const value = 3 as s.infer<typeof type>;
    const parsedValue = type.parse(value);
    const resolvedValue = type.resolve(value);

    type Assertions = [
      Expect<Equal<typeof value, 3 | 4>>,
      Expect<Equal<typeof parsedValue, 3 | 4>>,
      Expect<Equal<typeof resolvedValue, 3 | 4>>
    ];

    expect(parsedValue).toStrictEqual(value);
    expect([3, 4]).toContain(type.mock(faker));

    expect(() => {
      type.parse(2);
    }).toThrow(z.ZodError);
  });
});
