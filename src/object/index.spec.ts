import { describe, expect, it } from "@jest/globals";

import { boolean } from "../boolean";

import { object } from ".";

import type { InferInput, InferOutput } from "../types";

const mockRule = () => {
  const rule = {
    custom: () => rule,
    error: () => rule,
    greaterThan: () => rule,
    integer: () => rule,
    length: () => rule,
    lessThan: () => rule,
    lowercase: () => rule,
    max: () => rule,
    min: () => rule,
    negative: () => rule,
    positive: () => rule,
    precision: () => rule,
    regex: () => rule,
    required: () => rule,
    unique: () => rule,
    uppercase: () => rule,
    uri: () => rule,
    valueOfField: () => undefined,
    warning: () => rule,
  };

  return rule;
};

describe("object", () => {
  it("builds a sanity config", () =>
    expect(object().schema()).toEqual({
      type: "object",
      fields: [],
    }));

  it("passes through schema values", () =>
    expect(object({ hidden: false }).schema()).toHaveProperty("hidden", false));

  it("parses into an object", () => {
    const type = object();

    const value: InferInput<typeof type> = {};
    const parsedValue: InferOutput<typeof type> = type.parse(value);

    expect(parsedValue).toEqual(value);
  });

  it("adds fields", () => {
    const type = object().field({
      name: "foo",
      type: boolean(),
    });

    const schema = type.schema();

    expect(schema).toHaveProperty("fields", [
      {
        name: "foo",
        type: "boolean",
        validation: expect.any(Function),
      },
    ]);

    const required = mockRule();

    const rule = {
      ...mockRule(),
      required: () => required,
    };

    expect(schema.fields[0]?.validation?.(rule)).toEqual(required);

    const value: InferInput<typeof type> = { foo: true };
    const parsedValue: InferOutput<typeof type> = type.parse(value);

    expect(parsedValue).toEqual(value);
  });

  it("allows optional fields", () => {
    const type = object().field({
      name: "foo",
      optional: true,
      type: boolean(),
    });

    const schema = type.schema();

    expect(schema).toHaveProperty("fields", [
      {
        name: "foo",
        type: "boolean",
      },
    ]);

    const required = mockRule();

    const rule = {
      ...mockRule(),
      required: () => required,
    };

    expect(schema.fields[0]?.validation?.(rule)).not.toEqual(required);

    const value: InferInput<typeof type> = {};
    const parsedValue: InferOutput<typeof type> = type.parse(value);

    expect(parsedValue).toEqual(value);
  });
});
