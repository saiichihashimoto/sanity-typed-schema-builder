import { faker } from "@faker-js/faker";
import { describe, expect, it } from "@jest/globals";
import { s } from "@sanity-typed/schema-builder";
import type {
  ParsedSanityDocument,
  SanityDocument,
} from "@sanity-typed/schema-builder";
import { isFunction } from "lodash/fp";
import type { Merge } from "type-fest";
import { z } from "zod";

import { sharedFields } from "../field";
import { mockRule } from "../test-utils";
import type { Equal, Expect } from "../test-utils";

describe("document", () => {
  it("builds a sanity config", () =>
    expect(
      s
        .document({
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
      type: "document",
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
        .document({
          name: "foo",
          title: "Foo",
          fields: [
            {
              name: "foo",
              type: s.boolean(),
            },
          ],
        })
        .schema()
    ).toHaveProperty("title", "Foo"));

  it("parses into an document", () => {
    const type = s.document({
      name: "foo",
      fields: [
        {
          name: "foo",
          type: s.boolean(),
        },
      ],
    });

    const value = {
      _createdAt: "2022-06-03T03:24:55.395Z",
      _id: "2106a34f-315f-44bc-929b-bf8e9a3eba0d",
      _rev: "somerevstring",
      _type: "foo",
      _updatedAt: "2022-06-03T03:24:55.395Z",
      foo: true,
    } as s.infer<typeof type>;
    const parsedValue = type.parse(value);

    type Assertions = [
      Expect<
        Equal<typeof value, Merge<SanityDocument<"foo">, { foo: boolean }>>
      >,
      Expect<
        Equal<
          typeof parsedValue,
          Merge<ParsedSanityDocument<"foo">, { foo: boolean }>
        >
      >
    ];

    expect(parsedValue).toStrictEqual({
      ...value,
      _createdAt: new Date("2022-06-03T03:24:55.395Z"),
      _updatedAt: new Date("2022-06-03T03:24:55.395Z"),
    });
  });

  it("resolves into an object", () => {
    const type = s.document({
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

    const value = {
      _createdAt: "2022-06-03T03:24:55.395Z",
      _id: "2106a34f-315f-44bc-929b-bf8e9a3eba0d",
      _rev: "somerevstring",
      _type: "foo",
      _updatedAt: "2022-06-03T03:24:55.395Z",
      foo: true,
    } as s.infer<typeof type>;
    const resolvedValue = type.resolve(value);

    type Assertions = [
      Expect<
        Equal<typeof value, Merge<SanityDocument<"foo">, { foo: boolean }>>
      >,
      Expect<
        Equal<
          typeof resolvedValue,
          Merge<ParsedSanityDocument<"foo">, { foo: string }>
        >
      >
    ];

    expect(resolvedValue).toStrictEqual({
      ...value,
      _createdAt: new Date("2022-06-03T03:24:55.395Z"),
      _updatedAt: new Date("2022-06-03T03:24:55.395Z"),
      foo: "foo",
    });
  });

  it("allows optional fields", () => {
    const type = s.document({
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
    const fooValidation = schema.fields[0]?.validation;

    (!isFunction(fooValidation) ? () => {} : fooValidation)(fooRule);

    expect(fooRule.required).toHaveBeenCalledWith();

    const barRule = mockRule();
    const barValidation = schema.fields[1]?.validation;

    (!isFunction(barValidation) ? () => {} : barValidation)(barRule);

    expect(barRule.required).not.toHaveBeenCalledWith();

    const value = {
      _createdAt: "2022-06-03T03:24:55.395Z",
      _id: "2106a34f-315f-44bc-929b-bf8e9a3eba0d",
      _rev: "somerevstring",
      _type: "foo",
      _updatedAt: "2022-06-03T03:24:55.395Z",
      foo: true,
    } as s.infer<typeof type>;
    const parsedValue = type.parse(value);

    type Assertions = [
      Expect<
        Equal<
          typeof value,
          Merge<
            SanityDocument<"foo">,
            { bar?: string | undefined; foo: boolean }
          >
        >
      >,
      Expect<
        Equal<
          typeof parsedValue,
          Merge<
            ParsedSanityDocument<"foo">,
            { bar?: string | undefined; foo: boolean }
          >
        >
      >
    ];

    expect(parsedValue).toStrictEqual({
      ...value,
      _createdAt: new Date("2022-06-03T03:24:55.395Z"),
      _updatedAt: new Date("2022-06-03T03:24:55.395Z"),
    });
  });

  it("works with shared fields", () => {
    const fields = sharedFields([
      {
        name: "foo",
        type: s.boolean(),
      },
    ]);

    const type = s.document({
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

    expect(type.schema()).toHaveProperty("fields", [
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
  });

  it("mocks the field values", () => {
    const value = s
      .document({
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
      .mock(faker);

    expect(value).toStrictEqual({
      _createdAt: expect.any(String),
      _id: expect.any(String),
      _rev: expect.any(String),
      _type: "foo",
      _updatedAt: expect.any(String),
      bar: expect.any(String),
      foo: expect.any(Boolean),
    });

    /* eslint-disable no-underscore-dangle -- Sanity fields have underscores */
    expect(new Date(value._createdAt).toString()).not.toBe("Invalid Date");
    expect(new Date(value._updatedAt).toString()).not.toBe("Invalid Date");
    z.string().uuid().parse(value._id);
    /* eslint-enable no-underscore-dangle */
  });

  it("allows defining the mocks", () =>
    expect([
      {
        _createdAt: "2022-06-03T03:24:55.395Z",
        _id: "2106a34f-315f-44bc-929b-bf8e9a3eba0d",
        _rev: "somerevstring",
        _type: "foo",
        _updatedAt: "2022-06-03T03:24:55.395Z",
        foo: true,
        bar: "foo",
      },
      {
        _createdAt: "2022-06-03T03:24:55.395Z",
        _id: "2106a34f-315f-44bc-929b-bf8e9a3eba0d",
        _rev: "somerevstring",
        _type: "foo",
        _updatedAt: "2022-06-03T03:24:55.395Z",
        foo: false,
        bar: "bar",
      },
    ] as const).toContainEqual(
      s
        .document({
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
              {
                _createdAt: "2022-06-03T03:24:55.395Z",
                _id: "2106a34f-315f-44bc-929b-bf8e9a3eba0d",
                _rev: "somerevstring",
                _type: "foo",
                _updatedAt: "2022-06-03T03:24:55.395Z",
                foo: true,
                bar: "foo",
              },
              {
                _createdAt: "2022-06-03T03:24:55.395Z",
                _id: "2106a34f-315f-44bc-929b-bf8e9a3eba0d",
                _rev: "somerevstring",
                _type: "foo",
                _updatedAt: "2022-06-03T03:24:55.395Z",
                foo: false,
                bar: "bar",
              },
            ] as const),
        })
        .mock(faker)
    ));

  it("sets preview.select", () =>
    expect(
      s
        .document({
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

  it("types prepare function", () => {
    const type = s.document({
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
                Merge<
                  SanityDocument<"foo">,
                  { bar?: string; bleh: unknown; foo: string }
                >
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
      _createdAt: "2022-06-03T03:24:55.395Z",
      _id: "2106a34f-315f-44bc-929b-bf8e9a3eba0d",
      _rev: "somerevstring",
      _type: "foo",
      _updatedAt: "2022-06-03T03:24:55.395Z",
      bar: "someBar",
      foo: "someFoo",
    };

    expect(schema.preview?.prepare?.(value)).toStrictEqual({
      title: "someFoo",
      subtitle: "someBar",
    });
  });

  it("allows defining the zod", () => {
    const type = s.document({
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

    const value = {
      _createdAt: "2022-06-03T03:24:55.395Z",
      _id: "2106a34f-315f-44bc-929b-bf8e9a3eba0d",
      _rev: "somerevstring",
      _type: "foo",
      _updatedAt: "2022-06-03T03:24:55.395Z",
      foo: true,
    };
    const parsedValue = type.parse(value);

    type Assertions = [
      Expect<Equal<typeof parsedValue, [string, Date | string | 0 | 1][]>>
    ];

    expect(parsedValue).toStrictEqual(
      expect.arrayContaining([
        ["_createdAt", new Date("2022-06-03T03:24:55.395Z")],
        ["_id", "2106a34f-315f-44bc-929b-bf8e9a3eba0d"],
        ["_rev", "somerevstring"],
        ["_type", "foo"],
        ["_updatedAt", new Date("2022-06-03T03:24:55.395Z")],
        ["foo", 1],
      ])
    );
  });

  it("types custom validation", () => {
    const type = s.document({
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
                | {
                    _createdAt: string;
                    _id: string;
                    _rev: string;
                    _type: "foo";
                    _updatedAt: string;
                    bar: string;
                    foo?: boolean | undefined;
                  }
                | undefined
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
});
