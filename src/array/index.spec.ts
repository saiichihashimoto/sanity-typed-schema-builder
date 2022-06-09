import { describe, expect, it } from "@jest/globals";
import { z } from "zod";

import { boolean } from "../boolean";
import { fields } from "../fields";
import { object } from "../object";
import { mockRule } from "../test-utils";

import { array, items } from ".";

import type { ValidateShape } from "../test-utils";
import type { InferInput, InferOutput } from "../types";
import type { PartialDeep } from "type-fest";

describe("array", () => {
  it("builds a sanity config", () =>
    expect(array({ of: items() }).schema()).toEqual({
      type: "array",
      of: [],
      validation: expect.any(Function),
    }));

  it("passes through schema values", () =>
    expect(array({ of: items(), hidden: false }).schema()).toHaveProperty(
      "hidden",
      false
    ));

  it("parses into an array", () => {
    const type = array({ of: items() });

    const value: ValidateShape<InferInput<typeof type>, never[]> = [];
    const parsedValue: ValidateShape<
      InferOutput<typeof type>,
      never[]
    > = type.parse(value);

    expect(parsedValue).toEqual(value);
  });

  it("adds primitive types", () => {
    const type = array({ of: items().item(boolean()) });

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
    const type = array({
      of: items().item(
        object({
          fields: fields().field({
            name: "foo",
            type: boolean(),
          }),
        })
      ),
    });

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
      Array<{
        _key: string;
        foo: boolean;
      }>
    > = [
      { _key: "a", foo: true },
      { _key: "b", foo: false },
    ];
    const parsedValue: ValidateShape<
      InferOutput<typeof type>,
      Array<{
        _key: string;
        foo: boolean;
      }>
    > = type.parse(value);

    expect(parsedValue).toEqual(value);
  });

  it("creates union with multiple types", () => {
    const type = array({
      of: items()
        .item(
          object({
            fields: fields().field({
              name: "foo",
              type: boolean(),
            }),
          })
        )
        .item(
          object({
            fields: fields().field({
              name: "bar",
              type: boolean(),
            }),
          })
        ),
    });

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
      Array<
        | {
            _key: string;
            foo: boolean;
          }
        | {
            _key: string;
            bar: boolean;
          }
      >
    > = [
      { _key: "a", foo: true },
      { _key: "b", bar: true },
    ];
    const parsedValue: ValidateShape<
      InferOutput<typeof type>,
      Array<
        | {
            _key: string;
            foo: boolean;
          }
        | {
            _key: string;
            bar: boolean;
          }
      >
    > = type.parse(value);

    expect(parsedValue).toEqual(value);
  });

  it("sets min", () => {
    const type = array({ min: 1, of: items().item(boolean()) });

    const rule = mockRule();

    type.schema().validation?.(rule);

    expect(rule.min).toHaveBeenCalledWith(1);

    const value: ValidateShape<InferInput<typeof type>, boolean[]> = [true];
    const parsedValue: ValidateShape<
      InferOutput<typeof type>,
      boolean[]
    > = type.parse(value);

    expect(parsedValue).toEqual(value);

    expect(() => {
      type.parse([]);
    }).toThrow(z.ZodError);
  });

  it("sets max", () => {
    const type = array({ max: 1, of: items().item(boolean()) });

    const rule = mockRule();

    type.schema().validation?.(rule);

    expect(rule.max).toHaveBeenCalledWith(1);

    const value: ValidateShape<InferInput<typeof type>, boolean[]> = [true];
    const parsedValue: ValidateShape<
      InferOutput<typeof type>,
      boolean[]
    > = type.parse(value);

    expect(parsedValue).toEqual(value);

    expect(() => {
      type.parse([true, false]);
    }).toThrow(z.ZodError);
  });

  it("sets length", () => {
    const type = array({ length: 1, of: items().item(boolean()) });

    const rule = mockRule();

    type.schema().validation?.(rule);

    expect(rule.length).toHaveBeenCalledWith(1);

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
    const type = array({ nonempty: true, of: items().item(boolean()) });

    const rule = mockRule();

    type.schema().validation?.(rule);

    expect(rule.min).toHaveBeenCalledWith(1);

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

  it("types custom validation", () => {
    const type = array({
      of: items()
        .item(
          object({
            fields: fields().field({
              name: "foo",
              type: boolean(),
            }),
          })
        )
        .item(
          object({
            fields: fields().field({
              name: "bar",
              type: boolean(),
            }),
          })
        ),
      validation: (Rule) =>
        Rule.custom((value) => {
          const elements: ValidateShape<
            typeof value,
            PartialDeep<
              Array<
                | {
                    _key: string;
                    foo: boolean;
                  }
                | {
                    _key: string;
                    bar: boolean;
                  }
              >
            >
          > = value;

          return elements.length > 50 || "Needs to be 50 characters";
        }),
    });

    const rule = mockRule();

    type.schema().validation?.(rule);

    expect(rule.custom).toHaveBeenCalledWith(expect.any(Function));
  });
});
