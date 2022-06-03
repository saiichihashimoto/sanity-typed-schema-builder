import { describe, expect, it } from "@jest/globals";

import { boolean } from "../boolean";
import { object } from "../object";

import { array } from ".";

import type { InferInput, InferOutput } from "../types";

describe("array", () => {
  it("builds a sanity config", () =>
    expect(array().schema()).toEqual({
      type: "array",
      of: [],
    }));

  it("passes through schema values", () =>
    expect(array({ hidden: false }).schema()).toHaveProperty("hidden", false));

  it("parses into an array", () => {
    const type = array();

    const value: InferInput<typeof type> = [];
    const parsedValue: InferOutput<typeof type> = type.parse(value);

    expect(parsedValue).toEqual(value);
  });

  it("adds primitive types", () => {
    const type = array().of(boolean());

    const schema = type.schema();

    expect(schema).toHaveProperty("of", [
      {
        type: "boolean",
      },
    ]);

    const value: InferInput<typeof type> = [true, false];
    const parsedValue: InferOutput<typeof type> = type.parse(value);

    expect(parsedValue).toEqual(value);
  });

  it("adds nonprimitive types", () => {
    const type = array().of(object());

    const schema = type.schema();

    expect(schema).toHaveProperty("of", [
      {
        type: "object",
        fields: [],
      },
    ]);

    const value: InferInput<typeof type> = [{}];
    const parsedValue: InferOutput<typeof type> = type.parse(value);

    expect(parsedValue).toEqual(value);
  });
});
