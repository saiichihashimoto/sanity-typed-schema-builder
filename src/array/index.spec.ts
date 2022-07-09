import { describe, expect, it } from "@jest/globals";
import { z } from "zod";

import { boolean } from "../boolean";
import { object } from "../object";
import { mockRule } from "../test-utils";

import { array } from ".";

import type { ValidateShape } from "../test-utils";
import type {
  InferParsedValue,
  InferResolvedValue,
  InferValue,
} from "../types";
import type { PartialDeep } from "type-fest";

describe("array", () => {
  it("builds a sanity config", () =>
    expect(array({ of: [boolean()] }).schema()).toEqual({
      type: "array",
      of: [{ type: "boolean" }],
      validation: expect.any(Function),
    }));

  it("passes through schema values", () =>
    expect(array({ of: [boolean()], hidden: false }).schema()).toHaveProperty(
      "hidden",
      false
    ));

  it("adds primitive types", () => {
    const type = array({ of: [boolean()] });

    const value: ValidateShape<InferValue<typeof type>, boolean[]> = [];
    const parsedValue: ValidateShape<
      InferParsedValue<typeof type>,
      boolean[]
    > = type.parse(value);

    expect(parsedValue).toEqual(value);
  });

  it("adds keyed nonprimitive types", () => {
    const type = array({
      of: [
        object({
          fields: [
            {
              name: "foo",
              type: boolean(),
            },
          ],
        }),
      ],
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
      InferValue<typeof type>,
      Array<{
        _key: string;
        foo: boolean;
      }>
    > = [
      { _key: "a", foo: true },
      { _key: "b", foo: false },
    ];
    const parsedValue: ValidateShape<
      InferParsedValue<typeof type>,
      Array<{
        _key: string;
        foo: boolean;
      }>
    > = type.parse(value);

    expect(parsedValue).toEqual(value);
  });

  it("creates union with multiple types", () => {
    const type = array({
      of: [
        object({
          fields: [
            {
              name: "foo",
              type: boolean(),
            },
          ],
        }),
        object({
          fields: [
            {
              name: "bar",
              type: boolean(),
            },
          ],
        }),
      ],
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
      InferValue<typeof type>,
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
      InferParsedValue<typeof type>,
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

  it("resolves into an array", () => {
    const type = array({
      of: [
        boolean({
          zodResolved: (zod) => zod.transform(() => "foo"),
        }),
      ],
    });

    const value: ValidateShape<InferValue<typeof type>, boolean[]> = [true];
    const resolvedValue: ValidateShape<
      InferResolvedValue<typeof type>,
      string[]
    > = type.resolve(value);

    expect(resolvedValue).toEqual(["foo"]);
  });

  it("sets min", () => {
    const type = array({ min: 1, of: [boolean()] });

    const rule = mockRule();

    type.schema().validation(rule);

    expect(rule.min).toHaveBeenCalledWith(1);

    const value: ValidateShape<InferValue<typeof type>, boolean[]> = [true];
    const parsedValue: ValidateShape<
      InferParsedValue<typeof type>,
      boolean[]
    > = type.parse(value);

    expect(parsedValue).toEqual(value);

    expect(() => {
      type.parse([]);
    }).toThrow(z.ZodError);
  });

  it("sets max", () => {
    const type = array({ max: 1, of: [boolean()] });

    const rule = mockRule();

    type.schema().validation(rule);

    expect(rule.max).toHaveBeenCalledWith(1);

    const value: ValidateShape<InferValue<typeof type>, boolean[]> = [true];
    const parsedValue: ValidateShape<
      InferParsedValue<typeof type>,
      boolean[]
    > = type.parse(value);

    expect(parsedValue).toEqual(value);

    expect(() => {
      type.parse([true, false]);
    }).toThrow(z.ZodError);
  });

  it("sets length", () => {
    const type = array({ length: 1, of: [boolean()] });

    const rule = mockRule();

    type.schema().validation(rule);

    expect(rule.length).toHaveBeenCalledWith(1);

    const value0: ValidateShape<InferValue<typeof type>, boolean[]> = [];

    expect(() => {
      type.parse(value0);
    }).toThrow(z.ZodError);

    const value2: ValidateShape<InferValue<typeof type>, boolean[]> = [
      true,
      false,
    ];

    expect(() => {
      type.parse(value2);
    }).toThrow(z.ZodError);
  });

  it("sets nonempty", () => {
    const type = array({ nonempty: true, of: [boolean()] });

    const rule = mockRule();

    type.schema().validation(rule);

    expect(rule.min).toHaveBeenCalledWith(1);

    const value: ValidateShape<
      InferValue<typeof type>,
      [boolean, ...boolean[]]
    > = [true];
    const parsedValue: ValidateShape<
      InferParsedValue<typeof type>,
      [boolean, ...boolean[]]
    > = type.parse(value);

    expect(parsedValue).toEqual(value);

    expect(() => {
      type.parse([]);
    }).toThrow(z.ZodError);
  });

  it("allows defining the zod", () => {
    const type = array({
      of: [
        boolean({ zod: (zod) => zod.transform((value) => (value ? 1 : 0)) }),
      ],
      zod: (zod) =>
        zod.transform((values) =>
          values.reduce<number>((sum, val) => sum + val, 0)
        ),
    });

    const parsedValue: ValidateShape<
      InferParsedValue<typeof type>,
      number
    > = type.parse([true, false]);

    expect(parsedValue).toEqual(1);
  });

  it("types custom validation", () => {
    const type = array({
      of: [
        object({
          fields: [
            {
              name: "foo",
              type: boolean(),
            },
          ],
        }),
        object({
          fields: [
            {
              name: "bar",
              type: boolean(),
            },
          ],
        }),
      ],
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

    type.schema().validation(rule);

    expect(rule.custom).toHaveBeenCalledWith(expect.any(Function));
  });
});
