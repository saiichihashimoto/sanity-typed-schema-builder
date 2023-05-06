import { faker } from "@faker-js/faker";
import { describe, expect, it } from "@jest/globals";
import { s } from "@sanity-typed/schema-builder";
import type { SanityFile, SanityReference } from "@sanity-typed/schema-builder";
import type { Merge } from "type-fest";

import { sharedFields } from "../field";
import { mockRule } from "../test-utils";
import type { Equal, Expect } from "../test-utils";

describe("file", () => {
  it("builds a sanity config", () =>
    expect(s.file().schema()).toStrictEqual({
      type: "file",
    }));

  it("passes through schema values", () =>
    expect(s.file({ hidden: false }).schema()).toHaveProperty("hidden", false));

  it("parses into an file", () => {
    const type = s.file();

    const value = {
      _type: "file",
      asset: {
        _type: "reference",
        _ref: "file-5igDD9UuXffIucwZpyVthr0c",
      },
    } as s.infer<typeof type>;
    const parsedValue = type.parse(value);

    type Assertions = [
      Expect<Equal<typeof value, SanityFile>>,
      Expect<Equal<typeof parsedValue, SanityFile>>
    ];

    expect(parsedValue).toStrictEqual(value);
  });

  it("resolves into an file", () => {
    const type = s.file();

    const value = {
      _type: "file",
      asset: {
        _type: "reference",
        _ref: "file-5igDD9UuXffIucwZpyVthr0c",
      },
    } as s.infer<typeof type>;
    const resolvedValue = type.resolve(value);

    type Assertions = [
      Expect<Equal<typeof value, SanityFile>>,
      Expect<Equal<typeof resolvedValue, SanityFile>>
    ];

    expect(resolvedValue).toStrictEqual(value);
  });

  it("adds fields", () => {
    const type = s.file({
      fields: [
        {
          name: "foo",
          type: s.boolean(),
        },
        {
          name: "bar",
          optional: true,
          type: s.boolean(),
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
        type: "boolean",
        validation: expect.any(Function),
      },
    ]);

    const value = {
      foo: true,
      _type: "file",
      asset: {
        _type: "reference",
        _ref: "file-5igDD9UuXffIucwZpyVthr0c",
      },
    } as s.infer<typeof type>;
    const parsedValue = type.parse(value);

    type Assertions = [
      Expect<
        Equal<typeof value, Merge<SanityFile, { bar?: boolean; foo: boolean }>>
      >,
      Expect<
        Equal<
          typeof parsedValue,
          Merge<SanityFile, { bar?: boolean; foo: boolean }>
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

    const type = s.file({
      fields: [
        ...fields,
        {
          name: "bar",
          optional: true,
          type: s.boolean(),
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
        type: "boolean",
        validation: expect.any(Function),
      },
    ]);

    const value = {
      foo: true,
      _type: "file",
      asset: {
        _type: "reference",
        _ref: "file-5igDD9UuXffIucwZpyVthr0c",
      },
    } as s.infer<typeof type>;
    const parsedValue = type.parse(value);

    type Assertions = [
      Expect<
        Equal<typeof value, Merge<SanityFile, { bar?: boolean; foo: boolean }>>
      >,
      Expect<
        Equal<
          typeof parsedValue,
          Merge<SanityFile, { bar?: boolean; foo: boolean }>
        >
      >
    ];

    expect(parsedValue).toStrictEqual(value);
  });

  it("mocks the field values", () =>
    expect(
      s
        .file({
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
      _type: "file",
      bar: expect.any(String),
      foo: expect.any(Boolean),
      asset: {
        _type: "reference",
        _ref: expect.any(String),
      },
    }));

  it("mocks the same value with the same path", () => {
    expect(s.file().mock(faker)).toStrictEqual(s.file().mock(faker));
    expect(s.file().mock(faker, ".foo")).toStrictEqual(
      s.file().mock(faker, ".foo")
    );

    expect(s.file().mock(faker, ".foo")).not.toStrictEqual(
      s.file().mock(faker)
    );
    expect(s.file().mock(faker)).not.toStrictEqual(
      s.file().mock(faker, ".foo")
    );
  });

  it("allows defining the mocks", () =>
    expect([
      {
        _type: "file",
        asset: {
          _type: "reference",
          _ref: "file-5igDD9UuXffIucwZpyVthr0c",
        },
        foo: true,
        bar: "foo",
      },
      {
        _type: "file",
        asset: {
          _type: "reference",
          _ref: "file-5igDD9UuXffIucwZpyVthr0c",
        },
        foo: false,
        bar: "bar",
      },
    ] as const).toContainEqual(
      s
        .file({
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
                _type: "file",
                asset: {
                  _type: "reference",
                  _ref: "file-5igDD9UuXffIucwZpyVthr0c",
                },
                foo: true,
                bar: "foo",
              },
              {
                _type: "file",
                asset: {
                  _type: "reference",
                  _ref: "file-5igDD9UuXffIucwZpyVthr0c",
                },
                foo: false,
                bar: "bar",
              },
            ] as const),
        })
        .mock(faker)
    ));

  it("allows defining the zod", () => {
    const type = s.file({
      zod: (zod) => zod.transform((value) => Object.entries(value)),
    });

    const value = {
      _type: "file",
      asset: {
        _type: "reference",
        _ref: "file-5igDD9UuXffIucwZpyVthr0c",
      },
    };
    const parsedValue = type.parse(value);

    type Assertions = [
      Expect<Equal<typeof parsedValue, [string, SanityReference | "file"][]>>
    ];

    expect(parsedValue).toStrictEqual(
      expect.arrayContaining([
        ["_type", "file"],
        [
          "asset",
          {
            _type: "reference",
            _ref: "file-5igDD9UuXffIucwZpyVthr0c",
          },
        ],
      ])
    );
  });

  it("types custom validation", () => {
    const type = s.file({
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
                Merge<SanityFile, { bar: string; foo?: boolean }> | undefined
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
