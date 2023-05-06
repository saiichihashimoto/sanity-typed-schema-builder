import { faker } from "@faker-js/faker";
import { describe, expect, it } from "@jest/globals";
import { s } from "@sanity-typed/schema-builder";
import { z } from "zod";

import { mockRule } from "../test-utils";
import type { Equal, Expect } from "../test-utils";

describe("date", () => {
  it("builds a sanity config", () =>
    expect(s.date().schema()).toStrictEqual({
      type: "date",
    }));

  it("passes through schema values", () =>
    expect(s.date({ hidden: false }).schema()).toHaveProperty("hidden", false));

  it("parses into a string", () => {
    const type = s.date();

    const value = "2017-02-12";
    const parsedValue = type.parse(value);

    type Assertions = [Expect<Equal<typeof parsedValue, string>>];

    expect(parsedValue).toStrictEqual(value);
  });

  it("resolves into a string", () => {
    const type = s.date();

    const value = "2017-02-12";
    const resolvedValue = type.resolve(value);

    type Assertions = [Expect<Equal<typeof resolvedValue, string>>];

    expect(resolvedValue).toStrictEqual(value);
  });

  it("mocks a string", () => {
    const value = s.date().mock(faker);

    expect(value).toStrictEqual(expect.any(String));

    z.string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .parse(value);
  });

  it("mocks the same value with the same path", () => {
    expect(s.date().mock(faker)).toStrictEqual(s.date().mock(faker));
    expect(s.date().mock(faker, ".foo")).toStrictEqual(
      s.date().mock(faker, ".foo")
    );

    expect(s.date().mock(faker, ".foo")).not.toStrictEqual(
      s.date().mock(faker)
    );
    expect(s.date().mock(faker)).not.toStrictEqual(
      s.date().mock(faker, ".foo")
    );
  });

  it("allows defining the mocks", () =>
    expect(["2010-05-06", "2011-04-27"]).toContainEqual(
      s
        .date({
          mock: (faker) =>
            faker.helpers.arrayElement(["2010-05-06", "2011-04-27"]),
        })
        .mock(faker)
    ));

  it("allows defining the zod", () => {
    const type = s.date({
      zod: (zod) => zod.transform((value) => value.length),
    });

    const value = "2017-02-12";
    const parsedValue = type.parse(value);

    type Assertions = [Expect<Equal<typeof parsedValue, number>>];

    expect(parsedValue).toBe(10);
  });

  it("types custom validation", () => {
    const type = s.date({
      validation: (Rule) =>
        Rule.custom((value) => {
          type Assertions = [Expect<Equal<typeof value, string | undefined>>];

          return (value?.length ?? 0) > 50 || "Needs to be 50 characters";
        }),
    });

    const rule = mockRule();

    type.schema().validation?.(rule);

    expect(rule.custom).toHaveBeenCalledWith(expect.any(Function));
  });
});
