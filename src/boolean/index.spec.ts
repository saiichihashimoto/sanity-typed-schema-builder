import { faker } from "@faker-js/faker";
import { describe, expect, it } from "@jest/globals";

import { mockRule } from "../test-utils";

import { boolean } from ".";

import type { ValidateShape } from "../test-utils";
import type {
  InferParsedValue,
  InferResolvedValue,
  InferValue,
} from "../types";

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

    const value: ValidateShape<InferValue<typeof type>, boolean> = true;
    const parsedValue: ValidateShape<
      InferParsedValue<typeof type>,
      boolean
    > = type.parse(value);

    expect(parsedValue).toEqual(value);
  });

  it("resolves into a boolean", () => {
    const type = boolean();

    const value: ValidateShape<InferValue<typeof type>, boolean> = true;
    const resolvedValue: ValidateShape<
      InferResolvedValue<typeof type>,
      boolean
    > = type.resolve(value);

    expect(resolvedValue).toEqual(value);
  });

  it("mocks a boolean", () =>
    expect(boolean().mock(faker)).toEqual(expect.any(Boolean)));

  it("mocks the same value with the same path", () => {
    expect(boolean().mock(faker)).toEqual(boolean().mock(faker));
    expect(boolean().mock(faker, ".foo")).toEqual(
      boolean().mock(faker, ".foo")
    );

    expect(boolean().mock(faker, ".foo")).not.toEqual(boolean().mock(faker));
    expect(boolean().mock(faker)).not.toEqual(boolean().mock(faker, ".foo"));
  });

  it("allows defining the mocks", () =>
    expect([true]).toContainEqual(
      boolean({
        mock: (faker) => faker.helpers.arrayElement([true]),
      }).mock(faker)
    ));

  it("allows defining the zod", () => {
    const type = boolean({
      zod: (zod) => zod.transform((value) => value.toString()),
    });

    const parsedValue: ValidateShape<
      InferParsedValue<typeof type>,
      string
    > = type.parse(true);

    expect(parsedValue).toEqual("true");
  });

  it("types custom validation", () => {
    const type = boolean({
      validation: (Rule) =>
        Rule.custom((value) => {
          const boolean: ValidateShape<typeof value, boolean | undefined> =
            value;

          // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- I want the logical or
          return boolean || "Needs to be true";
        }),
    });

    const rule = mockRule();

    type.schema().validation?.(rule);

    expect(rule.custom).toHaveBeenCalledWith(expect.any(Function));
  });
});
