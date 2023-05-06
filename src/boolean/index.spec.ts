import { faker } from "@faker-js/faker";
import { describe, expect, it } from "@jest/globals";
import { s } from "@sanity-typed/schema-builder";

import { mockRule } from "../test-utils";
import type { Equal, Expect } from "../test-utils";

describe("boolean", () => {
  it("builds a sanity config", () =>
    expect(s.boolean().schema()).toStrictEqual({
      type: "boolean",
    }));

  it("passes through schema values", () =>
    expect(s.boolean({ hidden: false }).schema()).toHaveProperty(
      "hidden",
      false
    ));

  it("parses into a boolean", () => {
    const type = s.boolean();

    const value = true;
    const parsedValue = type.parse(value);

    type Assertions = [Expect<Equal<typeof parsedValue, boolean>>];

    expect(parsedValue).toStrictEqual(value);
  });

  it("resolves into a boolean", () => {
    const type = s.boolean();

    const value = true;
    const resolvedValue = type.resolve(value);

    type Assertions = [Expect<Equal<typeof resolvedValue, boolean>>];

    expect(resolvedValue).toStrictEqual(value);
  });

  it("mocks a boolean", () =>
    expect(s.boolean().mock(faker)).toStrictEqual(expect.any(Boolean)));

  it("mocks the same value with the same path", () => {
    expect(s.boolean().mock(faker)).toStrictEqual(s.boolean().mock(faker));
    expect(s.boolean().mock(faker, ".foo")).toStrictEqual(
      s.boolean().mock(faker, ".foo")
    );

    expect(s.boolean().mock(faker, ".foo")).not.toStrictEqual(
      s.boolean().mock(faker)
    );
    expect(s.boolean().mock(faker)).not.toStrictEqual(
      s.boolean().mock(faker, ".foo")
    );
  });

  it("allows defining the mocks", () =>
    expect([true]).toContainEqual(
      s
        .boolean({
          mock: (faker) => faker.helpers.arrayElement([true]),
        })
        .mock(faker)
    ));

  it("allows defining the zod", () => {
    const type = s.boolean({
      zod: (zod) => zod.transform((value) => value.toString()),
    });

    const value = true;
    const parsedValue = type.parse(value);

    type Assertions = [Expect<Equal<typeof parsedValue, string>>];

    expect(parsedValue).toBe("true");
  });

  it("types custom validation", () => {
    const type = s.boolean({
      validation: (Rule) =>
        Rule.custom((value) => {
          type Assertions = [Expect<Equal<typeof value, boolean | undefined>>];

          return value || "Needs to be true";
        }),
    });

    const rule = mockRule();

    type.schema().validation?.(rule);

    expect(rule.custom).toHaveBeenCalledWith(expect.any(Function));
  });
});
