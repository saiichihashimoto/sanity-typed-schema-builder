import { describe, expect, it } from "@jest/globals";

import { mockRule } from "../test-utils";

import { boolean } from ".";

import type { ValidateShape } from "../test-utils";
import type { InferInput, InferOutput } from "../types";

describe("boolean", () => {
  it("builds a sanity config", () =>
    expect(boolean().schema()).toEqual({
      type: "boolean",
    }));

  it("passes through schema values", () =>
    expect(boolean({ hidden: false }).schema()).toHaveProperty(
      "hidden",
      false
    ));

  it("parses into a boolean", () => {
    const type = boolean();

    const value: ValidateShape<InferInput<typeof type>, boolean> = true;
    const parsedValue: ValidateShape<
      InferOutput<typeof type>,
      boolean
    > = type.parse(value);

    expect(parsedValue).toEqual(value);
  });

  it("mocks a boolean", () =>
    expect(boolean().mock()).toEqual(expect.any(Boolean)));

  it("allows defining the mocks", () =>
    expect([true]).toContainEqual(
      boolean({
        mock: (faker) => faker.helpers.arrayElement([true]),
      }).mock()
    ));

  it("types custom validation", () => {
    const type = boolean({
      validation: (Rule) =>
        Rule.custom((value) => {
          const boolean: ValidateShape<typeof value, boolean> = value;

          return boolean || "Needs to be true";
        }),
    });

    const rule = mockRule();

    type.schema().validation?.(rule);

    expect(rule.custom).toHaveBeenCalledWith(expect.any(Function));
  });
});
