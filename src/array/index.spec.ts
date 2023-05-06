import { describe, expect, it } from "@jest/globals";
import { s } from "@sanity-typed/schema-builder";
import { z } from "zod";

import { mockRule } from "../test-utils";
import type { Equal, Expect } from "../test-utils";

describe("array", () => {
  it("builds a sanity config", () =>
    expect(s.array({ of: [s.boolean()] }).schema()).toStrictEqual({
      type: "array",
      of: [{ type: "boolean" }],
      validation: expect.any(Function),
    }));

  it("passes through schema values", () =>
    expect(
      s.array({ of: [s.boolean()], hidden: false }).schema()
    ).toHaveProperty("hidden", false));

  it("adds primitive types", () => {
    const type = s.array({
      of: [
        s.boolean({
          zod: (zod) => zod.transform((value) => value.toString()),
          zodResolved: (zod) =>
            zod.transform((value) => value.toString().length),
        }),
      ],
    });

    const value = [true] as s.infer<typeof type>;
    const parsedValue = type.parse(value);
    const resolvedValue = type.resolve(value);

    type Assertions = [
      Expect<Equal<typeof value, boolean[]>>,
      Expect<Equal<typeof parsedValue, string[]>>,
      Expect<Equal<typeof resolvedValue, number[]>>
    ];

    expect(parsedValue).toStrictEqual(["true"]);
    expect(resolvedValue).toStrictEqual([4]);
  });

  it("adds keyed nonprimitive types", () => {
    const type = s.array({
      of: [
        s.object({
          fields: [
            {
              name: "foo",
              type: s.boolean({
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

    const value = [
      { _key: "a", foo: true },
      { _key: "b", foo: false },
    ] as s.infer<typeof type>;
    const parsedValue = type.parse(value);
    const resolvedValue = type.resolve(value);

    type Assertions = [
      Expect<Equal<typeof value, { _key: string; foo: boolean }[]>>,
      Expect<Equal<typeof parsedValue, { _key: string; foo: string }[]>>,
      Expect<Equal<typeof resolvedValue, { _key: string; foo: number }[]>>
    ];

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
    const type = s.array({
      of: [s.boolean(), s.string()],
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

    const value = [true, "a"] as s.infer<typeof type>;
    const parsedValue = type.parse(value);

    type Assertions = [
      Expect<Equal<typeof value, (boolean | string)[]>>,
      Expect<Equal<typeof parsedValue, (boolean | string)[]>>
    ];

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
    const objectNamedType1 = s.objectNamed({
      name: "a",
      fields: [
        {
          name: "foo",
          type: s.boolean(),
        },
      ],
    });
    const objectNamedType2 = s.objectNamed({
      name: "b",
      fields: [
        {
          name: "foo",
          type: s.string(),
        },
      ],
    });

    const type = s.array({
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

    const value = [
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
    ] as s.infer<typeof type>;
    const parsedValue = type.parse(value);

    type Assertions = [
      Expect<
        Equal<
          typeof value,
          (
            | { _key: string; _type: "a"; foo: boolean }
            | { _key: string; _type: "b"; foo: string }
          )[]
        >
      >,
      Expect<
        Equal<
          typeof parsedValue,
          (
            | { _key: string; _type: "a"; foo: boolean }
            | { _key: string; _type: "b"; foo: string }
          )[]
        >
      >
    ];

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
    const type = s.array({ min: 2, of: [s.boolean()] });

    const rule = mockRule();

    type.schema().validation(rule);

    expect(rule.min).toHaveBeenCalledWith(2);

    const value = [true, false] as s.infer<typeof type>;
    const parsedValue = type.parse(value);

    type Assertions = [
      Expect<Equal<typeof value, [boolean, boolean, ...boolean[]]>>,
      Expect<Equal<typeof parsedValue, [boolean, boolean, ...boolean[]]>>
    ];

    expect(parsedValue).toStrictEqual(value);

    expect(() => {
      type.parse([true]);
    }).toThrow(z.ZodError);
  });

  it("sets max", () => {
    const type = s.array({ max: 3, of: [s.boolean()] });

    const rule = mockRule();

    type.schema().validation(rule);

    expect(rule.max).toHaveBeenCalledWith(3);

    const value = [true, false, true] as s.infer<typeof type>;
    const parsedValue = type.parse(value);

    type Assertions = [
      Expect<
        Equal<
          typeof value,
          [] | [boolean, boolean, boolean] | [boolean, boolean] | [boolean]
        >
      >,
      Expect<
        Equal<
          typeof parsedValue,
          [] | [boolean, boolean, boolean] | [boolean, boolean] | [boolean]
        >
      >
    ];

    expect(parsedValue).toStrictEqual(value);

    expect(() => {
      type.parse([true, false, true, false]);
    }).toThrow(z.ZodError);
  });

  it("sets length", () => {
    const type = s.array({ length: 2, of: [s.boolean()] });

    const rule = mockRule();

    type.schema().validation(rule);

    expect(rule.length).toHaveBeenCalledWith(2);

    const value = [true, false] as s.infer<typeof type>;
    const parsedValue = type.parse(value);

    type Assertions = [
      Expect<Equal<typeof value, [boolean, boolean]>>,
      Expect<Equal<typeof parsedValue, [boolean, boolean]>>
    ];

    expect(parsedValue).toStrictEqual(value);

    expect(() => {
      type.parse([true]);
    }).toThrow(z.ZodError);

    expect(() => {
      type.parse([true, false, true]);
    }).toThrow(z.ZodError);
  });

  it("allows defining the zod", () => {
    const type = s.array({
      of: [
        s.boolean({ zod: (zod) => zod.transform((value) => (value ? 1 : 0)) }),
      ],
      zod: (zod) =>
        zod.transform((values) =>
          values.reduce<number>((sum, val) => sum + val, 0)
        ),
    });

    const parsedValue = type.parse([true, false]);

    type Assertions = [Expect<Equal<typeof parsedValue, number>>];

    expect(parsedValue).toBe(1);
  });

  it("types custom validation", () => {
    const type = s.array({
      of: [
        s.object({
          fields: [
            {
              name: "foo",
              type: s.boolean(),
            },
          ],
        }),
        s.object({
          fields: [
            {
              name: "bar",
              type: s.boolean(),
            },
          ],
        }),
      ],
      validation: (Rule) =>
        Rule.custom((value) => {
          type Assertions = [
            Expect<
              Equal<
                typeof value,
                | (
                    | { _key: string; bar: boolean }
                    | { _key: string; foo: boolean }
                  )[]
                | undefined
              >
            >
          ];

          return (value?.length ?? 0) > 50 || "Needs to be 50 characters";
        }),
    });

    const rule = mockRule();

    type.schema().validation(rule);

    expect(rule.custom).toHaveBeenCalledWith(expect.any(Function));
  });
});
