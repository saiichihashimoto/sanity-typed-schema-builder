import { faker } from "@faker-js/faker";
import { describe, expect, it } from "@jest/globals";

import { mockRule } from "../test-utils";

import { slug } from ".";

import type { ValidateShape } from "../test-utils";
import type { InferInput, InferOutput } from "../types";
import type { PartialDeep } from "type-fest";

describe("slug", () => {
  it("builds a sanity config", () =>
    expect(slug().schema()).toEqual({
      type: "slug",
    }));

  it("passes through schema values", () =>
    expect(slug({ hidden: false }).schema()).toHaveProperty("hidden", false));

  it("parses into a string", () => {
    const type = slug();

    const value: ValidateShape<
      InferInput<typeof type>,
      {
        _type: "slug";
        current: string;
      }
    > = {
      _type: "slug",
      current: "foo",
    };
    const parsedValue: ValidateShape<
      InferOutput<typeof type>,
      string
    > = type.parse(value);

    expect(parsedValue).toEqual("foo");
  });

  it("mocks a slug", () =>
    expect(slug().mock(faker)).toEqual({
      _type: "slug",
      current: expect.any(String),
    }));

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
      InferOutput<typeof type>,
      "slug"
    > = type.parse({ _type: "slug", current: "a-slug" });

    expect(parsedValue).toEqual("slug");
  });

  it("types custom validation", () => {
    const type = slug({
      validation: (Rule) =>
        Rule.custom((value) => {
          const {
            current: slug,
          }: ValidateShape<
            typeof value,
            PartialDeep<{
              _type: "slug";
              current: string;
            }>
          > = value;

          return (slug?.length ?? 0) > 50 || "Needs to be 50 characters";
        }),
    });

    const rule = mockRule();

    type.schema().validation?.(rule);

    expect(rule.custom).toHaveBeenCalledWith(expect.any(Function));
  });
});
