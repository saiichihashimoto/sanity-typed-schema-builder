import { describe, expect, it } from "@jest/globals";

import { boolean } from "../boolean";
import { object } from "../object";

import { array } from ".";

import type { ValidateShape } from "../test-types";
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

    const value: ValidateShape<InferInput<typeof type>, []> = [];
    const parsedValue: ValidateShape<InferOutput<typeof type>, []> = type.parse(
      value
    );

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

    const value: ValidateShape<InferInput<typeof type>, boolean[]> = [
      true,
      false,
    ];
    const parsedValue: ValidateShape<
      InferOutput<typeof type>,
      boolean[]
    > = type.parse(value);

    expect(parsedValue).toEqual(value);
  });

  it("adds nonprimitive types", () => {
    const type = array().of(
      object().field({
        name: "foo",
        type: boolean(),
      })
    );

    const schema = type.schema();

    expect(schema).toHaveProperty("of", [
      {
        type: "object",
        fields: [
          {
            name: "foo",
            type: "boolean",
            validation: expect.any(Function),
          },
        ],
      },
    ]);

    const value: ValidateShape<
      InferInput<typeof type>,
      Array<{ foo: boolean }>
    > = [{ foo: true }, { foo: false }];
    const parsedValue: ValidateShape<
      InferOutput<typeof type>,
      Array<{ foo: boolean }>
    > = type.parse(value);

    expect(parsedValue).toEqual(value);
  });

  it("creates union with multiple types", () => {
    const type = array()
      .of(
        object().field({
          name: "foo",
          type: boolean(),
        })
      )
      .of(
        object().field({
          name: "bar",
          type: boolean(),
        })
      );

    const schema = type.schema();

    expect(schema).toHaveProperty("of", [
      {
        type: "object",
        fields: [
          {
            name: "foo",
            type: "boolean",
            validation: expect.any(Function),
          },
        ],
      },
      {
        type: "object",
        fields: [
          {
            name: "bar",
            type: "boolean",
            validation: expect.any(Function),
          },
        ],
      },
    ]);

    const value: ValidateShape<
      InferInput<typeof type>,
      Array<{ foo: boolean } | { bar: boolean }>
    > = [{ foo: true }, { bar: true }];
    const parsedValue: ValidateShape<
      InferOutput<typeof type>,
      Array<{ foo: boolean } | { bar: boolean }>
    > = type.parse(value);

    expect(parsedValue).toEqual(value);
  });
});
