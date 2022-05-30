import { describe, expect, it } from "@jest/globals";

import { s } from "..";

describe("boolean", () => {
  it("builds a sanity config", () => {
    const schema: BooleanFieldDef = s.boolean().schema();

    expect(schema).toEqual({ type: "boolean" });
  });

  it("passes through schema values", () => {
    const schema: BooleanFieldDef = s.boolean({ hidden: false }).schema();

    expect(schema).toHaveProperty("hidden", false);
  });

  it("infers a boolean", () => {
    const type = s.boolean();

    const value = true;
    const inferredValue: s.infer<typeof type> = value;
    const otherValue: boolean = inferredValue;

    expect(inferredValue).toEqual(value);
    expect(inferredValue).toEqual(otherValue);
  });
});
