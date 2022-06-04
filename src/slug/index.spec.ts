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
});
