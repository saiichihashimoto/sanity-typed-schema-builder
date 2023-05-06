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
        .object({
          fields: [
            {
              name: "foo",
              type: s.boolean(),
            },
          ],
        })
        .schema()
    ).toStrictEqual({
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
        .object({
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
    const type = s.object({
      fields: [
        {
          name: "foo",
          type: s.boolean(),
        },
      ],
    });

    const value = { foo: true } as s.infer<typeof type>;
    const parsedValue = type.parse(value);

    type Assertions = [
      Expect<Equal<typeof value, { foo: boolean }>>,
      Expect<Equal<typeof parsedValue, { foo: boolean }>>
    ];

    expect(parsedValue).toStrictEqual(value);
  });

  it("resolves into an object", () => {
    const type = s.object({
      fields: [
        {
          name: "foo",
          type: s.boolean({
            zodResolved: (zod) => zod.transform(() => "foo"),
          }),
        },
      ],
    });

    const value = { foo: true } as s.infer<typeof type>;
    const resolvedValue = type.resolve(value);

    type Assertions = [
      Expect<Equal<typeof value, { foo: boolean }>>,
      Expect<Equal<typeof resolvedValue, { foo: string }>>
    ];

    expect(resolvedValue).toStrictEqual({ foo: "foo" });
  });

  it("allows optional fields", () => {
    const type = s.object({
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

    const value = { foo: true } as s.infer<typeof type>;
    const parsedValue = type.parse(value);

    type Assertions = [
      Expect<Equal<typeof value, { bar?: string | undefined; foo: boolean }>>,
      Expect<
        Equal<typeof parsedValue, { bar?: string | undefined; foo: boolean }>
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

    const type = s.object({
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

    const value = { foo: true } as s.infer<typeof type>;
    const parsedValue = type.parse(value);

    type Assertions = [
      Expect<Equal<typeof value, { bar?: string | undefined; foo: boolean }>>,
      Expect<
        Equal<typeof parsedValue, { bar?: string | undefined; foo: boolean }>
      >
    ];

    expect(parsedValue).toStrictEqual(value);
  });

  it("mocks the field values", () =>
    expect(
      s
        .object({
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

      return { fields };
    };

    expect(s.object(objectDef()).mock(faker)).toStrictEqual(
      s.object(objectDef()).mock(faker)
    );
    expect(s.object(objectDef()).mock(faker, ".foo")).toStrictEqual(
      s.object(objectDef()).mock(faker, ".foo")
    );

    expect(s.object(objectDef()).mock(faker, ".foo")).not.toStrictEqual(
      s.object(objectDef()).mock(faker)
    );
    expect(s.object(objectDef()).mock(faker)).not.toStrictEqual(
      s.object(objectDef()).mock(faker, ".foo")
    );
  });

  it("allows defining the mocks", () =>
    expect([
      { foo: true, bar: "foo" },
      { foo: false, bar: "bar" },
    ]).toContainEqual(
      s
        .object({
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
              { foo: true, bar: "foo" },
              { foo: false, bar: "bar" },
            ]),
        })
        .mock(faker)
    ));

  it("sets preview.select", () =>
    expect(
      s
        .object({
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

  it("types prepare function", () => {
    const type = s.object({
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
                { bar?: string; bleh: unknown; foo: string }
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
      bar: "someBar",
      foo: "someFoo",
    };

    expect(schema.preview?.prepare?.(value)).toStrictEqual({
      title: "someFoo",
      subtitle: "someBar",
    });
  });

  it("allows defining the zod", () => {
    const type = s.object({
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

    const value = { foo: true };
    const parsedValue = type.parse(value);

    type Assertions = [Expect<Equal<typeof parsedValue, [string, 0 | 1][]>>];

    expect(parsedValue).toStrictEqual([["foo", 1]]);
  });

  it("types custom validation", () => {
    const type = s.object({
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
              Equal<typeof value, { bar: string; foo?: boolean } | undefined>
            >
          ];

          return !value?.bar || "Needs an empty bar";
        }),
    });

    const rule = mockRule();

    type.schema().validation?.(rule);

    expect(rule.custom).toHaveBeenCalledWith(expect.any(Function));
  });
});
