import { describe, expect, it } from "@jest/globals";

import { slug } from ".";

import type { ValidateShape } from "../test-utils";
import type { InferInput, InferOutput } from "../types";

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
    expect(slug().mock()).toEqual({
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
      }).mock()
    ));
});
