import { describe, expect, it } from "@jest/globals";

import { s } from "..";

type MyObjectFieldDef = ObjectFieldDef<never, never, string, never, never>;

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
  it("builds a sanity config", () => {
    const schema: MyObjectFieldDef = s.object().schema();

    expect(schema).toEqual({ type: "object", fields: [] });
  });

  it("passes through schema values", () => {
    const schema: MyObjectFieldDef = s.object({ hidden: false }).schema();

    expect(schema).toHaveProperty("hidden", false);
  });

  it("infers an object", () => {
    const type = s.object();
    const value: Record<never, never> = {};
    const inferredValue: s.infer<typeof type> = { ...value };
    const otherValue: Record<never, never> = { ...inferredValue };

    expect(inferredValue).toEqual(value);
    expect(inferredValue).toEqual(otherValue);
  });

  it("adds fields", () => {
    const type = s.object().field({
      name: "foo",
      type: s.boolean(),
    });
    const schema: MyObjectFieldDef = type.schema();

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

    const value: { foo: boolean } = { foo: true };
    const inferredValue: s.infer<typeof type> = { ...value };
    const otherValue: { foo: boolean } = { ...inferredValue };

    expect(inferredValue).toEqual(value);
    expect(inferredValue).toEqual(otherValue);
  });

  it("allows optional fields", () => {
    const type = s.object().field({
      name: "foo",
      optional: true,
      type: s.boolean(),
    });
    const schema: MyObjectFieldDef = type.schema();

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

    const value: { foo?: boolean } = {};
    const inferredValue: s.infer<typeof type> = { ...value };
    const otherValue: { foo?: boolean } = { ...inferredValue };

    expect(inferredValue).toEqual(value);
    expect(inferredValue).toEqual(otherValue);
  });
});
