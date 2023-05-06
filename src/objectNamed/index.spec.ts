import { faker } from "@faker-js/faker";
import { describe, expect, it } from "@jest/globals";
import { s } from "@sanity-typed/schema-builder";

import { sharedFields } from "../field";
import { mockRule } from "../test-utils";
import type { Equal, Expect } from "../test-utils";

describe("object", () => {
  it("builds a sanity config", () =>
    expect(
      s
        .objectNamed({
          name: "foo",
          fields: [
            {
              name: "foo",
              type: s.boolean(),
            },
          ],
        })
        .schema()
    ).toStrictEqual({
      name: "foo",
      type: "object",
      preview: undefined,
      fields: [
        {
          name: "foo",
          type: "boolean",
          validation: expect.any(Function),
        },
      ],
    }));

  it("passes through schema values", () =>
    expect(
      s
        .objectNamed({
          name: "foo",
          fields: [
            {
              name: "foo",
              type: s.boolean(),
            },
          ],
          hidden: false,
        })
        .schema()
    ).toHaveProperty("hidden", false));

  it("parses into an object", () => {
    const type = s.objectNamed({
      name: "foo",
      fields: [
        {
          name: "foo",
          type: s.boolean(),
        },
      ],
    });

    const value = { _type: "foo", foo: true } as s.infer<typeof type>;
    const parsedValue = type.parse(value);

    type Assertions = [
      Expect<Equal<typeof value, { _type: "foo"; foo: boolean }>>,
      Expect<Equal<typeof parsedValue, { _type: "foo"; foo: boolean }>>
    ];

    expect(parsedValue).toStrictEqual(value);
  });

  it("resolves into an object", () => {
    const type = s.objectNamed({
      name: "foo",
      fields: [
        {
          name: "foo",
          type: s.boolean({
            zodResolved: (zod) => zod.transform(() => "foo"),
          }),
        },
      ],
    });

    const value = { _type: "foo", foo: true } as s.infer<typeof type>;
    const resolvedValue = type.resolve(value);

    type Assertions = [
      Expect<Equal<typeof value, { _type: "foo"; foo: boolean }>>,
      Expect<Equal<typeof resolvedValue, { _type: "foo"; foo: string }>>
    ];

    expect(resolvedValue).toStrictEqual({ _type: "foo", foo: "foo" });
  });

  it("allows optional fields", () => {
    const type = s.objectNamed({
      name: "foo",
      fields: [
        {
          name: "foo",
          type: s.boolean(),
        },
        {
          name: "bar",
          optional: true,
          type: s.string(),
        },
      ],
    });

    const schema = type.schema();

    expect(schema).toHaveProperty("fields", [
      {
        name: "foo",
        type: "boolean",
        validation: expect.any(Function),
      },
      {
        name: "bar",
        type: "string",
        validation: expect.any(Function),
      },
    ]);

    const fooRule = mockRule();

    schema.fields[0]?.validation?.(fooRule);

    expect(fooRule.required).toHaveBeenCalledWith();

    const barRule = mockRule();

    schema.fields[1]?.validation?.(barRule);

    expect(barRule.required).not.toHaveBeenCalledWith();

    const value = { _type: "foo", foo: true } as s.infer<typeof type>;
    const parsedValue = type.parse(value);

    type Assertions = [
      Expect<
        Equal<
          typeof value,
          { _type: "foo"; bar?: string | undefined; foo: boolean }
        >
      >,
      Expect<
        Equal<
          typeof parsedValue,
          { _type: "foo"; bar?: string | undefined; foo: boolean }
        >
      >
    ];

    expect(parsedValue).toStrictEqual(value);
  });

  it("makes a reference", () => {
    const type = s.objectNamed({
      name: "foo",
      fields: [{ name: "hello", type: s.string() }],
    });

    const type2 = s.objectNamed({
      name: "bar",
      fields: [{ name: "foo", type: type.ref() }],
    });

    const schema = type2.schema();

    expect(schema.fields[0]).toStrictEqual({
      name: "foo",
      type: "foo",
      validation: expect.any(Function),
    });

    const value = {
      _type: "bar",
      foo: {
        _type: "foo",
        hello: "world",
      },
    } as s.infer<typeof type2>;
    const parsedValue = type2.parse(value);

    type Assertions = [
      Expect<
        Equal<
          typeof value,
          { _type: "bar"; foo: { _type: "foo"; hello: string } }
        >
      >,
      Expect<
        Equal<
          typeof parsedValue,
          { _type: "bar"; foo: { _type: "foo"; hello: string } }
        >
      >
    ];

    expect(parsedValue).toStrictEqual(value);
  });

  it("works with shared fields", () => {
    const fields = sharedFields([
      {
        name: "foo",
        type: s.boolean(),
      },
    ]);

    const type = s.objectNamed({
      name: "foo",
      fields: [
        ...fields,
        {
          name: "bar",
          optional: true,
          type: s.string(),
        },
      ],
    });

    const schema = type.schema();

    expect(schema).toHaveProperty("fields", [
      {
        name: "foo",
        type: "boolean",
        validation: expect.any(Function),
      },
      {
        name: "bar",
        type: "string",
        validation: expect.any(Function),
      },
    ]);

    const fooRule = mockRule();

    schema.fields[0]?.validation?.(fooRule);

    expect(fooRule.required).toHaveBeenCalledWith();

    const barRule = mockRule();

    schema.fields[1]?.validation?.(barRule);

    expect(barRule.required).not.toHaveBeenCalledWith();

    const value = { _type: "foo", foo: true } as s.infer<typeof type>;
    const parsedValue = type.parse(value);

    type Assertions = [
      Expect<
        Equal<
          typeof value,
          { _type: "foo"; bar?: string | undefined; foo: boolean }
        >
      >,
      Expect<
        Equal<
          typeof parsedValue,
          { _type: "foo"; bar?: string | undefined; foo: boolean }
        >
      >
    ];

    expect(parsedValue).toStrictEqual(value);
  });

  it("mocks the field values", () =>
    expect(
      s
        .objectNamed({
          name: "foo",
          fields: [
            {
              name: "foo",
              type: s.boolean(),
            },
            {
              name: "bar",
              type: s.string(),
            },
          ],
        })
        .mock(faker)
    ).toStrictEqual({
      _type: "foo",
      foo: expect.any(Boolean),
      bar: expect.any(String),
    }));

  it("mocks the same value with the same path", () => {
    const objectDef = () => {
      const field = {
        name: "foo",
        type: s.string(),
      };

      const fields: [typeof field] = [field];

      return { name: "foo", fields };
    };

    expect(s.objectNamed(objectDef()).mock(faker)).toStrictEqual(
      s.objectNamed(objectDef()).mock(faker)
    );
    expect(s.objectNamed(objectDef()).mock(faker, ".foo")).toStrictEqual(
      s.objectNamed(objectDef()).mock(faker, ".foo")
    );

    expect(s.objectNamed(objectDef()).mock(faker, ".foo")).not.toStrictEqual(
      s.objectNamed(objectDef()).mock(faker)
    );
    expect(s.objectNamed(objectDef()).mock(faker)).not.toStrictEqual(
      s.objectNamed(objectDef()).mock(faker, ".foo")
    );
  });

  it("allows defining the mocks", () =>
    expect([
      { _type: "foo", foo: true, bar: "foo" },
      { _type: "foo", foo: false, bar: "bar" },
    ]).toContainEqual(
      s
        .objectNamed({
          name: "foo",
          fields: [
            {
              name: "foo",
              type: s.boolean(),
            },
            {
              name: "bar",
              type: s.string(),
            },
          ],
          mock: (faker) =>
            faker.helpers.arrayElement([
              { _type: "foo", foo: true, bar: "foo" },
              { _type: "foo", foo: false, bar: "bar" },
            ] as const),
        })
        .mock(faker)
    ));

  it("sets preview.select", () =>
    expect(
      s
        .objectNamed({
          name: "foo",
          fields: [
            {
              name: "foo",
              type: s.boolean(),
            },
          ],
          preview: {
            select: {
              title: "someTitle",
              media: "someMedia",
            },
          },
        })
        .schema()
    ).toHaveProperty("preview", {
      select: {
        title: "someTitle",
        media: "someMedia",
      },
    }));

  it("allows a function selection value", () => {
    const type = s.objectNamed({
      name: "foo",
      fields: [
        {
          name: "foo",
          type: s.string(),
        },
        {
          name: "bar",
          optional: true,
          type: s.string(),
        },
      ],
      preview: {
        select: {
          bleh: "foo",
        },
        prepare: (selection) => {
          type Assertions = [
            Expect<
              Equal<
                typeof selection,
                { _type: "foo"; bar?: string; bleh: unknown; foo: string }
              >
            >
          ];

          const { foo, bar } = selection;

          return {
            title: foo,
            subtitle: bar,
          };
        },
      },
    });

    const schema = type.schema();

    const value = {
      _type: "foo",
      bar: "someBar",
      foo: "someFoo",
    };

    expect(schema.preview?.prepare?.(value)).toStrictEqual({
      title: "someFoo",
      subtitle: "someBar",
    });
  });

  it("allows defining the zod", () => {
    const type = s.objectNamed({
      name: "foo",
      fields: [
        {
          name: "foo",
          type: s.boolean({
            zod: (zod) => zod.transform((value) => (value ? 1 : 0)),
          }),
        },
      ],
      zod: (zod) => zod.transform((value) => Object.entries(value)),
    });

    const value = { _type: "foo", foo: true };

    const parsedValue = type.parse(value);

    type Assertions = [
      Expect<Equal<typeof parsedValue, [string, "foo" | 0 | 1][]>>
    ];

    expect(parsedValue).toStrictEqual(
      expect.arrayContaining([
        ["_type", "foo"],
        ["foo", 1],
      ])
    );
  });

  it("types custom validation", () => {
    const type = s.objectNamed({
      name: "foo",
      fields: [
        {
          name: "foo",
          optional: true,
          type: s.boolean(),
        },
        {
          name: "bar",
          type: s.string(),
        },
      ],
      validation: (Rule) =>
        Rule.custom((value) => {
          type Assertions = [
            Expect<
              Equal<
                typeof value,
                { _type: "foo"; bar: string; foo?: boolean } | undefined
              >
            >
          ];

          return !value?.bar || "Needs an empty bar";
        }),
    });

    const rule = mockRule();

    type.schema().validation?.(rule);

    expect(rule.custom).toHaveBeenCalledWith(expect.any(Function));
  });

  it("handles deep references", () => {
    const type = s.objectNamed({
      name: "type",
      title: "Title",
      fields: [
        {
          name: "value",
          title: "Value",
          type: s.string(),
        },
      ],
    });

    const value = {
      _type: "type",
      value: "foo",
    };

    const referencingType = s.objectNamed({
      name: "referencingType",
      title: "Referencing Title",
      fields: [
        {
          name: "value",
          title: "Values",
          type: type.ref(),
        },
      ],
    });

    const referencingValue = {
      _type: "referencingType",
      value,
    } as s.infer<typeof referencingType>;

    const deepReferencingType = s.objectNamed({
      name: "deepReferencingType",
      title: "Deep Referencing Title",
      fields: [
        {
          name: "referencingValue",
          type: referencingType.ref(),
        },
      ],
    });

    // TS2589: Type instantiation is excessively deep and possibly infinite.
    const deepReferencingValue = {
      _type: "deepReferencingType",
      referencingValue,
    } as s.infer<typeof deepReferencingType>;

    type Assertions = [
      Expect<
        Equal<
          typeof referencingValue,
          { _type: "referencingType"; value: { _type: "type"; value: string } }
        >
      >,
      Expect<
        Equal<
          typeof deepReferencingValue,
          {
            _type: "deepReferencingType";
            referencingValue: {
              _type: "referencingType";
              value: { _type: "type"; value: string };
            };
          }
        >
      >
    ];

    expect(deepReferencingValue).toStrictEqual(
      deepReferencingType.parse(deepReferencingValue)
    );
  });
});
