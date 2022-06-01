import { describe, expect, it } from "@jest/globals";

import { s } from "..";

describe("url", () => {
  it("builds a sanity config", () => {
    const schema: URLFieldDef = s.url().schema();

    expect(schema).toEqual({ type: "url" });
  });

  it("passes through schema values", () => {
    const schema: URLFieldDef = s.url({ hidden: false }).schema();

    expect(schema).toHaveProperty("hidden", false);
  });

  it("infers a string", () => {
    const type = s.url();

    const value = "https://example.com/img.jpg";
    const inferredValue: s.infer<typeof type> = value;
    const otherValue: string = inferredValue;

    expect(inferredValue).toEqual(value);
    expect(inferredValue).toEqual(otherValue);
  });
});
