import { faker } from "@faker-js/faker";
import { describe, expect, it } from "@jest/globals";
import type { SlugValue } from "sanity";

import { slug } from ".";
import { mockRule } from "../test-utils";
import type { ValidateShape } from "../test-utils";
import type {
  InferParsedValue,
  InferResolvedValue,
  InferValue,
} from "../types";

describe("slug", () => {
  it("builds a sanity config", () =>
    expect(slug().schema()).toStrictEqual({
      type: "slug",
    }));

  it("passes through schema values", () =>
    expect(slug({ hidden: false }).schema()).toHaveProperty("hidden", false));

  it("parses into a string", () => {
    const type = slug();

    const value: ValidateShape<InferValue<typeof type>, SlugValue> = {
      _type: "slug",
      current: "foo",
    };
    const parsedValue: ValidateShape<
      InferParsedValue<typeof type>,
      string
    > = type.parse(value);

    expect(parsedValue).toBe("foo");
  });

  it("resolves into a string", () => {
    const type = slug();

    const value: ValidateShape<InferValue<typeof type>, SlugValue> = {
      _type: "slug",
      current: "foo",
    };
    const resolvedValue: ValidateShape<
      InferResolvedValue<typeof type>,
      string
    > = type.resolve(value);

    expect(resolvedValue).toBe("foo");
  });

  it("mocks a slug", () =>
    expect(slug().mock(faker)).toStrictEqual({
      _type: "slug",
      current: expect.any(String),
    }));

  it("mocks the same value with the same path", () => {
    expect(slug().mock(faker)).toStrictEqual(slug().mock(faker));
    expect(slug().mock(faker, ".foo")).toStrictEqual(
      slug().mock(faker, ".foo")
    );

    expect(slug().mock(faker, ".foo")).not.toStrictEqual(slug().mock(faker));
    expect(slug().mock(faker)).not.toStrictEqual(slug().mock(faker, ".foo"));
  });

  it("allows defining the mocks", () =>
    expect([
      { _type: "slug", current: "a-slug" },
      { _type: "slug", current: "b-slug" },
    ]).toContainEqual(
      slug({
        mock: (faker) =>
          faker.helpers.arrayElement([
            { _type: "slug", current: "a-slug" },
            { _type: "slug", current: "b-slug" },
          ]),
      }).mock(faker)
    ));

  it("allows defining the zod", () => {
    const type = slug({
      zod: (zod) => zod.transform(({ _type }) => _type),
    });

    const parsedValue: ValidateShape<
      InferParsedValue<typeof type>,
      "slug"
    > = type.parse({ _type: "slug", current: "a-slug" });

    expect(parsedValue).toBe("slug");
  });

  it("types custom validation", () => {
    const type = slug({
      validation: (Rule) =>
        Rule.custom((value) => {
          const slug: ValidateShape<typeof value, SlugValue | undefined> =
            value;

          return (
            (slug?.current?.length ?? 0) > 50 || "Needs to be 50 characters"
          );
        }),
    });

    const rule = mockRule();

    type.schema().validation?.(rule);

    expect(rule.custom).toHaveBeenCalledWith(expect.any(Function));
  });
});
