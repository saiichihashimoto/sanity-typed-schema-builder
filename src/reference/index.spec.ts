import { describe, expect, it } from "@jest/globals";

import { document } from "../document";

import { reference } from ".";

import type { ValidateShape } from "../test-utils";
import type { InferInput, InferOutput } from "../types";

interface SanityReference {
  _ref: string;
  _type: "reference";
  _weak?: boolean | undefined;
}

describe("reference", () => {
  it("builds a sanity config", () =>
    expect(reference().schema()).toEqual({
      type: "reference",
      to: [],
    }));

  it("passes through schema values", () =>
    expect(reference({ hidden: false }).schema()).toHaveProperty(
      "hidden",
      false
    ));

  it("parses into a reference", () => {
    const type = reference();

    const value: ValidateShape<InferInput<typeof type>, SanityReference> = {
      _type: "reference",
      _ref: "somereference",
    };
    const parsedValue: ValidateShape<
      InferOutput<typeof type>,
      SanityReference
    > = type.parse(value);

    expect(parsedValue).toEqual(value);
  });

  it("adds references", () => {
    const type = reference().to(document({ name: "foo" }));

    const schema = type.schema();

    expect(schema).toHaveProperty("to", [{ type: "foo" }]);

    const value: ValidateShape<InferInput<typeof type>, SanityReference> = {
      _type: "reference",
      _ref: "somereference",
    };
    const parsedValue: ValidateShape<
      InferOutput<typeof type>,
      SanityReference
    > = type.parse(value);

    expect(parsedValue).toEqual(value);
  });
});
