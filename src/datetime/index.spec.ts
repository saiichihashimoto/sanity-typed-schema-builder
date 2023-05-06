import { faker } from "@faker-js/faker";
import { describe, expect, it } from "@jest/globals";
import { s } from "@sanity-typed/schema-builder";

import { mockRule } from "../test-utils";
import type { Equal, Expect } from "../test-utils";

describe("datetime", () => {
  it("builds a sanity config", () =>
    expect(s.datetime().schema()).toStrictEqual({
      type: "datetime",
      validation: expect.any(Function),
    }));

  it("passes through schema values", () =>
    expect(s.datetime({ hidden: false }).schema()).toHaveProperty(
      "hidden",
      false
    ));

  it("parses into a Date", () => {
    const type = s.datetime();

    const value = "2022-06-03T03:24:55.395Z";
    const parsedValue = type.parse(value);

    type Assertions = [Expect<Equal<typeof parsedValue, Date>>];

    expect(parsedValue).toStrictEqual(new Date(value));
  });

  it("resolves into a Date", () => {
    const type = s.datetime();

    const value = "2022-06-03T03:24:55.395Z";
    const resolvedValue = type.resolve(value);

    type Assertions = [Expect<Equal<typeof resolvedValue, Date>>];

    expect(resolvedValue).toStrictEqual(new Date(value));
  });

  it("enforces a valid Date", () => {
    const type = s.datetime();

    const value = "not a date";

    expect(() => {
      type.parse(value);
    }).toThrow("Invalid Date");
  });

  it("sets min", () => {
    const type = s.datetime({ min: "2022-06-03T03:24:55.394Z" });

    const rule = mockRule();

    type.schema().validation(rule);

    expect(rule.min).toHaveBeenCalledWith("2022-06-03T03:24:55.394Z");

    const value = "2022-06-03T03:24:55.395Z";

    expect(type.parse(value)).toStrictEqual(new Date(value));

    expect(() => {
      type.parse("2022-06-03T03:24:55.390Z");
    }).toThrow("Greater than 2022-06-03T03:24:55.394Z");
  });

  it("sets max", () => {
    const type = s.datetime({ max: "2022-06-03T03:24:55.396Z" });

    const rule = mockRule();

    type.schema().validation(rule);

    expect(rule.max).toHaveBeenCalledWith("2022-06-03T03:24:55.396Z");

    const value = "2022-06-03T03:24:55.395Z";

    expect(type.parse(value)).toStrictEqual(new Date(value));

    expect(() => {
      type.parse("2022-06-03T03:24:55.399Z");
    }).toThrow("Less than 2022-06-03T03:24:55.396Z");
  });

  it("min & max are inclusive", () => {
    const type = s.datetime({
      max: "2022-06-03T03:24:55.395Z",
      min: "2022-06-03T03:24:55.395Z",
    });

    const rule = mockRule();

    type.schema().validation(rule);

    expect(rule.min).toHaveBeenCalledWith("2022-06-03T03:24:55.395Z");
    expect(rule.max).toHaveBeenCalledWith("2022-06-03T03:24:55.395Z");

    const value = "2022-06-03T03:24:55.395Z";

    expect(type.parse(value)).toStrictEqual(new Date(value));
  });

  it("mocks a string", () => {
    const value = s.datetime().mock(faker);

    expect(value).toStrictEqual(expect.any(String));
    expect(new Date(value).toString()).not.toBe("Invalid Date");
  });

  it("allows defining the mocks", () =>
    expect([
      "2022-06-03T03:24:55.390Z",
      "2022-06-03T03:24:55.399Z",
    ]).toContainEqual(
      s
        .datetime({
          mock: (faker) =>
            faker.helpers.arrayElement([
              "2022-06-03T03:24:55.390Z",
              "2022-06-03T03:24:55.399Z",
            ]),
        })
        .mock(faker)
    ));

  it("mocks the same value with the same path", () => {
    expect(s.datetime().mock(faker)).toStrictEqual(s.datetime().mock(faker));
    expect(s.datetime().mock(faker, ".foo")).toStrictEqual(
      s.datetime().mock(faker, ".foo")
    );

    expect(s.datetime().mock(faker, ".foo")).not.toStrictEqual(
      s.datetime().mock(faker)
    );
    expect(s.datetime().mock(faker)).not.toStrictEqual(
      s.datetime().mock(faker, ".foo")
    );
  });

  it("allows defining the zod", () => {
    const type = s.datetime({
      zod: (zod) => zod.transform((value) => value.length),
    });

    const value = "2022-06-03T03:24:55.395Z";
    const parsedValue = type.parse(value);

    type Assertions = [Expect<Equal<typeof parsedValue, number>>];

    expect(parsedValue).toBe(24);
  });

  it("types custom validation", () => {
    const type = s.datetime({
      validation: (Rule) =>
        Rule.custom((value) => {
          type Assertions = [Expect<Equal<typeof value, string | undefined>>];

          return (value?.length ?? 0) > 50 || "Needs to be 50 characters";
        }),
    });

    const rule = mockRule();

    type.schema().validation(rule);

    expect(rule.custom).toHaveBeenCalledWith(expect.any(Function));
  });
});
