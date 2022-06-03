import { describe, expect, it } from "@jest/globals";

import { s } from "..";

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
    expect(s.object().schema()).toEqual({
      type: "object",
      fields: [],
    }));

  it("passes through schema values", () =>
    expect(s.object({ hidden: false }).schema()).toHaveProperty(
      "hidden",
      false
    ));

  it("parses into an object", () => {
    const type = s.object();

    const value: s.input<typeof type> = {};
    const parsedValue: s.output<typeof type> = type.parse(value);

    expect(parsedValue).toEqual(value);
  });

  it("adds fields", () => {
    const type = s.object().field({
      name: "foo",
      type: s.boolean(),
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

    const value: s.input<typeof type> = { foo: true };
    const parsedValue: s.output<typeof type> = type.parse(value);

    expect(parsedValue).toEqual(value);
  });

  it("allows optional fields", () => {
    const type = s.object().field({
      name: "foo",
      optional: true,
      type: s.boolean(),
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

    const value: s.input<typeof type> = {};
    const parsedValue: s.output<typeof type> = type.parse(value);

    expect(parsedValue).toEqual(value);
  });
});
