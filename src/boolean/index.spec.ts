import { describe, expect, it } from "@jest/globals";

import { s } from "..";

describe("boolean", () => {
  it("builds a sanity config", () =>
    expect(s.boolean().schema()).toEqual({
      type: "boolean",
    }));

  it("passes through schema values", () =>
    expect(s.boolean({ hidden: false }).schema()).toHaveProperty(
      "hidden",
      false
    ));

  it("parses into a boolean", () => {
    const type = s.boolean();

    const value: s.input<typeof type> = true;
    const parsedValue: s.output<typeof type> = type.parse(value);

    expect(parsedValue).toEqual(value);
  });
});
