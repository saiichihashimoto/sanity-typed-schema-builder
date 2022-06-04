import { describe, expect, it } from "@jest/globals";
import { z } from "zod";

import { boolean } from "../boolean";
import { object } from "../object";
import { mockRule } from "../test-utils";

import { array } from ".";

import type { ValidateShape } from "../test-utils";
import type { InferInput, InferOutput } from "../types";

describe("array", () => {
  it("builds a sanity config", () =>
    expect(array().schema()).toEqual({
      type: "array",
      of: [],
      validation: expect.any(Function),
    }));

  it("passes through schema values", () =>
    expect(array({ hidden: false }).schema()).toHaveProperty("hidden", false));

  it("parses into an array", () => {
    const type = array();

    const value: ValidateShape<InferInput<typeof type>, never[]> = [];
    const parsedValue: ValidateShape<
      InferOutput<typeof type>,
      never[]
    > = type.parse(value);

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

  it("sets min", () => {
    const type = array({ min: 1 }).of(boolean());

    const min = mockRule();

    const rule = {
      ...mockRule(),
      min: () => min,
    };

    expect(type.schema().validation?.(rule)).toEqual(min);

    const value: ValidateShape<InferInput<typeof type>, boolean[]> = [];

    expect(() => {
      type.parse(value);
    }).toThrow(z.ZodError);
  });

  it("sets max", () => {
    const type = array({ max: 1 }).of(boolean());

    const max = mockRule();

    const rule = {
      ...mockRule(),
      max: () => max,
    };

    expect(type.schema().validation?.(rule)).toEqual(max);

    const value: ValidateShape<InferInput<typeof type>, boolean[]> = [
      true,
      false,
    ];

    expect(() => {
      type.parse(value);
    }).toThrow(z.ZodError);
  });

  it("sets length", () => {
    const type = array({ length: 1 }).of(boolean());

    const length = mockRule();

    const rule = {
      ...mockRule(),
      length: () => length,
    };

    expect(type.schema().validation?.(rule)).toEqual(length);

    const value0: ValidateShape<InferInput<typeof type>, boolean[]> = [];

    expect(() => {
      type.parse(value0);
    }).toThrow(z.ZodError);

    const value2: ValidateShape<InferInput<typeof type>, boolean[]> = [
      true,
      false,
    ];

    expect(() => {
      type.parse(value2);
    }).toThrow(z.ZodError);
  });

  it("sets nonempty", () => {
    const type = array({ nonempty: true }).of(boolean());

    const min = mockRule();

    const rule = {
      ...mockRule(),
      min: () => min,
    };

    expect(type.schema().validation?.(rule)).toEqual(min);

    const value: ValidateShape<
      InferInput<typeof type>,
      [boolean, ...boolean[]]
    > = [true];
    const parsedValue: ValidateShape<
      InferOutput<typeof type>,
      [boolean, ...boolean[]]
    > = type.parse(value);

    expect(parsedValue).toEqual(value);

    expect(() => {
      type.parse([]);
    }).toThrow(z.ZodError);
  });
});
