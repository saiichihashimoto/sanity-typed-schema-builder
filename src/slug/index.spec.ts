import { faker } from "@faker-js/faker";
import { describe, expect, it } from "@jest/globals";
import { s } from "@sanity-typed/schema-builder";
import type { SlugValue } from "sanity";

import { mockRule } from "../test-utils";
import type { Equal, Expect } from "../test-utils";

describe("slug", () => {
  it("builds a sanity config", () =>
    expect(s.slug().schema()).toStrictEqual({
      type: "slug",
    }));

  it("passes through schema values", () =>
    expect(s.slug({ hidden: false }).schema()).toHaveProperty("hidden", false));

  it("parses into a string", () => {
    const type = s.slug();

    const value = {
      _type: "slug",
      current: "foo",
    } as s.infer<typeof type>;
    const parsedValue = type.parse(value);

    type Assertions = [
      Expect<Equal<typeof value, SlugValue>>,
      Expect<Equal<typeof parsedValue, string>>
    ];

    expect(parsedValue).toBe("foo");
  });

  it("resolves into a string", () => {
    const type = s.slug();

    const value = {
      _type: "slug",
      current: "foo",
    } as s.infer<typeof type>;
    const resolvedValue = type.resolve(value);

    type Assertions = [
      Expect<Equal<typeof value, SlugValue>>,
      Expect<Equal<typeof resolvedValue, string>>
    ];

    expect(resolvedValue).toBe("foo");
  });

  it("mocks a slug", () =>
    expect(s.slug().mock(faker)).toStrictEqual({
      _type: "slug",
      current: expect.any(String),
    }));

  it("mocks the same value with the same path", () => {
    expect(s.slug().mock(faker)).toStrictEqual(s.slug().mock(faker));
    expect(s.slug().mock(faker, ".foo")).toStrictEqual(
      s.slug().mock(faker, ".foo")
    );

    expect(s.slug().mock(faker, ".foo")).not.toStrictEqual(
      s.slug().mock(faker)
    );
    expect(s.slug().mock(faker)).not.toStrictEqual(
      s.slug().mock(faker, ".foo")
    );
  });

  it("allows defining the mocks", () =>
    expect([
      { _type: "slug", current: "a-slug" },
      { _type: "slug", current: "b-slug" },
    ]).toContainEqual(
      s
        .slug({
          mock: (faker) =>
            faker.helpers.arrayElement([
              { _type: "slug", current: "a-slug" },
              { _type: "slug", current: "b-slug" },
            ]),
        })
        .mock(faker)
    ));

  it("allows defining the zod", () => {
    const type = s.slug({
      zod: (zod) => zod.transform(({ _type }) => _type),
    });

    const value = { _type: "slug", current: "a-slug" };
    const parsedValue = type.parse(value);

    type Assertions = [Expect<Equal<typeof parsedValue, "slug">>];

    expect(parsedValue).toBe("slug");
  });

  it("types custom validation", () => {
    const type = s.slug({
      validation: (Rule) =>
        Rule.custom((value) => {
          type Assertions = [
            Expect<Equal<typeof value, SlugValue | undefined>>
          ];

          return (
            (value?.current?.length ?? 0) > 50 || "Needs to be 50 characters"
          );
        }),
    });

    const rule = mockRule();

    type.schema().validation?.(rule);

    expect(rule.custom).toHaveBeenCalledWith(expect.any(Function));
  });
});
