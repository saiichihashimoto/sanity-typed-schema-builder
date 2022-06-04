import { describe, expect, it } from "@jest/globals";

import { block } from ".";

import type { ValidateShape } from "../test-utils";
import type { InferInput, InferOutput } from "../types";
import type { PortableTextBlock } from "@portabletext/types";

describe("block", () => {
  it("builds a sanity config", () =>
    expect(block().schema()).toEqual({ type: "block" }));

  it("passes through schema values", () =>
    expect(block({ hidden: false }).schema()).toHaveProperty("hidden", false));

  it("parses into a block", () => {
    const type = block();

    const value: ValidateShape<InferInput<typeof type>, PortableTextBlock> = {
      style: "normal",
      _type: "block",
      markDefs: [],
      children: [
        {
          _type: "span",
          text: "Amazing, actually.",
          marks: [],
        },
      ],
    };
    const parsedValue: ValidateShape<
      InferOutput<typeof type>,
      PortableTextBlock
    > = type.parse(value);

    expect(parsedValue).toEqual(value);
  });
});
