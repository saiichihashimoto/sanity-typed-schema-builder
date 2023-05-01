import { describe, expect, it } from "@jest/globals";
import { z } from "zod";

import { array } from ".";
import { boolean } from "../boolean";
import { object } from "../object";
import { objectNamed } from "../objectNamed";
import { string } from "../string";
import { mockRule } from "../test-utils";
import type { ValidateShape } from "../test-utils";
import type {
  InferParsedValue,
  InferResolvedValue,
  InferValue,
} from "../types";

describe("array", () => {
  it("builds a sanity config", () =>
    expect(array({ of: [boolean()] }).schema()).toStrictEqual({
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
    const type = array({
      of: [
        boolean({
          zod: (zod) => zod.transform((value) => value.toString()),
          zodResolved: (zod) =>
            zod.transform((value) => value.toString().length),
        }),
      ],
    });

    const value: ValidateShape<InferValue<typeof type>, boolean[]> = [true];
    const parsedValue: ValidateShape<
      InferParsedValue<typeof type>,
      string[]
    > = type.parse(value);
    const resolvedValue: ValidateShape<
      InferResolvedValue<typeof type>,
      number[]
    > = type.resolve(value);

    expect(parsedValue).toStrictEqual(["true"]);
    expect(resolvedValue).toStrictEqual([4]);
  });

  it("adds keyed nonprimitive types", () => {
    const type = array({
      of: [
        object({
          fields: [
            {
              name: "foo",
              type: boolean({
                zod: (zod) => zod.transform((value) => value.toString()),
                zodResolved: (zod) =>
                  zod.transform((value) => value.toString().length),
              }),
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
      {
        _key: string;
        foo: boolean;
      }[]
    > = [
      { _key: "a", foo: true },
      { _key: "b", foo: false },
    ];
    const parsedValue: ValidateShape<
      InferParsedValue<typeof type>,
      {
        _key: string;
        foo: string;
      }[]
    > = type.parse(value);
    const resolvedValue: ValidateShape<
      InferResolvedValue<typeof type>,
      {
        _key: string;
        foo: number;
      }[]
    > = type.resolve(value);

    expect(parsedValue).toStrictEqual([
      { _key: "a", foo: "true" },
      { _key: "b", foo: "false" },
    ]);
    expect(resolvedValue).toStrictEqual([
      { _key: "a", foo: 4 },
      { _key: "b", foo: 5 },
    ]);
  });

  it("creates union with primitive types", () => {
    const type = array({
      of: [boolean(), string()],
    });

    const schema = type.schema();

    expect(schema).toHaveProperty("of", [
      {
        type: "boolean",
      },
      {
        type: "string",
        validation: expect.any(Function),
      },
    ]);

    const value: ValidateShape<
      InferValue<typeof type>,
      (boolean | string)[]
    > = [true, "a"];
    const parsedValue: ValidateShape<
      InferParsedValue<typeof type>,
      (boolean | string)[]
    > = type.parse(value);

    expect(parsedValue).toStrictEqual(value);

    expect(() => type.parse([5])).toThrow(
      JSON.stringify(
        [
          {
            code: "invalid_union",
            unionErrors: [
              {
                issues: [
                  {
                    code: "invalid_type",
                    expected: "boolean",
                    received: "number",
                    path: [0],
                    message: "Expected boolean, received number",
                  },
                ],
                name: "ZodError",
              },
              {
                issues: [
                  {
                    code: "invalid_type",
                    expected: "string",
                    received: "number",
                    path: [0],
                    message: "Expected string, received number",
                  },
                ],
                name: "ZodError",
              },
            ],
            path: [0],
            message: "Invalid input",
          },
        ],
        null,
        2
      )
    );
  });

  it('creates discriminated union with nonprimitive "_type" types', () => {
    const objectNamedType1 = objectNamed({
      name: "a",
      fields: [
        {
          name: "foo",
          type: boolean(),
        },
      ],
    });
    const objectNamedType2 = objectNamed({
      name: "b",
      fields: [
        {
          name: "foo",
          type: string(),
        },
      ],
    });

    const type = array({
      of: [objectNamedType1.ref(), objectNamedType2.ref()],
    });

    const schema = type.schema();

    expect(schema).toHaveProperty("of", [
      {
        type: "a",
      },
      {
        type: "b",
      },
    ]);

    const value: ValidateShape<
      InferValue<typeof type>,
      (
        | {
            _key: string;
            _type: "a";
            foo: boolean;
          }
        | {
            _key: string;
            _type: "b";
            foo: string;
          }
      )[]
    > = [
      {
        _key: "1",
        _type: "a",
        foo: true,
      },
      {
        _key: "2",
        _type: "b",
        foo: "hello",
      },
    ];
    const parsedValue: ValidateShape<
      InferParsedValue<typeof type>,
      (
        | {
            _key: string;
            _type: "a";
            foo: boolean;
          }
        | {
            _key: string;
            _type: "b";
            foo: string;
          }
      )[]
    > = type.parse(value);

    expect(parsedValue).toStrictEqual(value);

    // Discriminated union should show that "_type" is invalid
    expect(() =>
      type.parse([
        {
          _key: "3",
          _type: "c",
          fee: 6,
        },
      ])
    ).toThrow(
      JSON.stringify(
        [
          {
            code: "invalid_union_discriminator",
            options: ["a", "b"],
            path: [0, "_type"],
            message: "Invalid discriminator value. Expected 'a' | 'b'",
          },
        ],
        null,
        2
      )
    );

    // Since "_type" is valid, should show an error only against that specific schema
    expect(() =>
      type.parse([
        {
          _key: "3",
          _type: "a",
          foo: 6,
        },
      ])
    ).toThrow(
      JSON.stringify(
        [
          {
            code: "invalid_type",
            expected: "boolean",
            received: "number",
            path: [0, "foo"],
            message: "Expected boolean, received number",
          },
        ],
        null,
        2
      )
    );
  });

  it("sets min", () => {
    const type = array({ min: 2, of: [boolean()] });

    const rule = mockRule();

    type.schema().validation(rule);

    expect(rule.min).toHaveBeenCalledWith(2);

    const value: ValidateShape<
      InferValue<typeof type>,
      [boolean, boolean, ...boolean[]]
    > = [true, false];
    const parsedValue: ValidateShape<
      InferParsedValue<typeof type>,
      [boolean, boolean, ...boolean[]]
    > = type.parse(value);

    expect(parsedValue).toStrictEqual(value);

    expect(() => {
      type.parse([true]);
    }).toThrow(z.ZodError);
  });

  it("sets max", () => {
    const type = array({ max: 3, of: [boolean()] });

    const rule = mockRule();

    type.schema().validation(rule);

    expect(rule.max).toHaveBeenCalledWith(3);

    const value: ValidateShape<
      InferValue<typeof type>,
      [] | [boolean, boolean, boolean] | [boolean, boolean] | [boolean]
    > = [true, false, true];
    const parsedValue: ValidateShape<
      InferParsedValue<typeof type>,
      [] | [boolean, boolean, boolean] | [boolean, boolean] | [boolean]
    > = type.parse(value);

    expect(parsedValue).toStrictEqual(value);

    expect(() => {
      type.parse([true, false, true, false]);
    }).toThrow(z.ZodError);
  });

  it("sets length", () => {
    const type = array({ length: 2, of: [boolean()] });

    const rule = mockRule();

    type.schema().validation(rule);

    expect(rule.length).toHaveBeenCalledWith(2);

    const value: ValidateShape<InferValue<typeof type>, [boolean, boolean]> = [
      true,
      false,
    ];
    const parsedValue: ValidateShape<
      InferParsedValue<typeof type>,
      [boolean, boolean]
    > = type.parse(value);

    expect(parsedValue).toStrictEqual(value);

    expect(() => {
      type.parse([true]);
    }).toThrow(z.ZodError);

    expect(() => {
      type.parse([true, false, true]);
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

    expect(parsedValue).toBe(1);
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
            | (
                | {
                    _key: string;
                    bar: boolean;
                  }
                | {
                    _key: string;
                    foo: boolean;
                  }
              )[]
            | undefined
          > = value;

          return (elements?.length ?? 0) > 50 || "Needs to be 50 characters";
        }),
    });

    const rule = mockRule();

    type.schema().validation(rule);

    expect(rule.custom).toHaveBeenCalledWith(expect.any(Function));
  });
});
