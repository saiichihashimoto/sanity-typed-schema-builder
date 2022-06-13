import { describe, expect, it } from "@jest/globals";

import { boolean } from "../boolean";
import { field } from "../field";
import { string } from "../string";
import { mockRule } from "../test-utils";

import { objectNamed } from ".";

import type { ValidateShape } from "../test-utils";
import type { InferInput, InferOutput, Merge } from "../types";
import type { PartialDeep } from "type-fest";

describe("object", () => {
  it("builds a sanity config", () =>
    expect(
      objectNamed({
        name: "foo",
        fields: field({
          name: "foo",
          type: boolean(),
        }),
      }).schema()
    ).toEqual({
      name: "foo",
      type: "object",
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
      objectNamed({
        name: "foo",
        fields: field({
          name: "foo",
          type: boolean(),
        }),
        hidden: false,
      }).schema()
    ).toHaveProperty("hidden", false));

  it("parses into an object", () => {
    const type = objectNamed({
      name: "foo",
      fields: field({
        name: "foo",
        type: boolean(),
      }),
    });

    const value: ValidateShape<
      InferInput<typeof type>,
      { _type: "foo"; foo: boolean }
    > = {
      _type: "foo",
      foo: true,
    };
    const parsedValue: ValidateShape<
      InferOutput<typeof type>,
      { _type: "foo"; foo: boolean }
    > = type.parse(value);

    expect(parsedValue).toEqual(value);
  });

  it("makes a reference", () => {
    const type = objectNamed({
      name: "foo",
      fields: field({ name: "hello", type: string() }),
    });

    const type2 = objectNamed({
      name: "bar",
      fields: field({ name: "foo", type: type.ref() }),
    });

    expect(type2.schema().fields[0]).toEqual({
      name: "foo",
      type: "foo",
      validation: expect.any(Function),
    });

    const value: ValidateShape<
      InferInput<typeof type2>,
      {
        _type: "bar";
        foo: {
          _type: "foo";
          hello: string;
        };
      }
    > = {
      _type: "bar",
      foo: {
        _type: "foo",
        hello: "world",
      },
    };
    const parsedValue: ValidateShape<
      InferOutput<typeof type2>,
      {
        _type: "bar";
        foo: {
          _type: "foo";
          hello: string;
        };
      }
    > = type2.parse(value);

    expect(parsedValue).toEqual(value);
  });

  it("mocks the field values", () =>
    expect(
      objectNamed({
        name: "foo",
        fields: field({
          name: "foo",
          type: boolean(),
        }).field({
          name: "bar",
          type: string(),
        }),
      }).mock()
    ).toEqual({
      _type: "foo",
      foo: expect.any(Boolean),
      bar: expect.any(String),
    }));

  it("allows defining the mocks", () =>
    expect([
      { _type: "foo", foo: true, bar: "foo" },
      { _type: "foo", foo: false, bar: "bar" },
    ]).toContainEqual(
      objectNamed({
        name: "foo",
        fields: field({
          name: "foo",
          type: boolean(),
        }).field({
          name: "bar",
          type: string(),
        }),
        mock: (faker) =>
          faker.helpers.arrayElement([
            { _type: "foo", foo: true, bar: "foo" },
            { _type: "foo", foo: false, bar: "bar" },
          ] as const),
      }).mock()
    ));

  it("sets preview.select", () =>
    expect(
      objectNamed({
        name: "foo",
        fields: field({
          name: "foo",
          type: boolean(),
        }),
        preview: {
          select: {
            title: "someTitle",
            media: "someMedia",
          },
        },
      }).schema()
    ).toHaveProperty("preview", {
      select: {
        title: "someTitle",
        media: "someMedia",
      },
    }));

  it("allows a function selection value", () => {
    const type = objectNamed({
      name: "foo",
      fields: field({
        name: "foo",
        type: string(),
      }).field({
        name: "bar",
        optional: true,
        type: string(),
      }),
      preview: {
        select: {
          bleh: "foo",
        },
        prepare: (selection) => {
          const value: ValidateShape<
            typeof selection,
            Merge<
              {
                _type: "foo";
                bar?: string;
                foo: string;
              },
              { bleh: unknown }
            >
          > = selection;

          const { foo, bar } = value;

          return {
            title: foo,
            subtitle: bar,
          };
        },
      },
    });

    const schema = type.schema();

    const value: ValidateShape<
      InferInput<typeof type>,
      {
        _type: "foo";
        bar?: string;
        foo: string;
      }
    > = {
      _type: "foo",
      bar: "someBar",
      foo: "someFoo",
    };

    expect(schema.preview?.prepare?.(value)).toEqual({
      title: "someFoo",
      subtitle: "someBar",
    });
  });

  it("allows defining the zod", () => {
    const type = objectNamed({
      name: "foo",
      fields: field({
        name: "foo",
        type: boolean(),
      }),
      zod: (zod) => zod.transform((value) => Object.keys(value).length),
    });

    const parsedValue: ValidateShape<
      InferOutput<typeof type>,
      number
    > = type.parse({ _type: "foo", foo: true });

    expect(parsedValue).toEqual(2);
  });

  it("types custom validation", () => {
    const type = objectNamed({
      name: "foo",
      fields: field({
        name: "foo",
        optional: true,
        type: boolean(),
      }).field({
        name: "bar",
        type: string(),
      }),
      validation: (Rule) =>
        Rule.custom((value) => {
          const {
            bar,
          }: ValidateShape<
            typeof value,
            PartialDeep<{
              _type: "foo";
              bar: string;
              foo?: boolean;
            }>
          > = value;

          return !bar || "Needs an empty bar";
        }),
    });

    const rule = mockRule();

    type.schema().validation?.(rule);

    expect(rule.custom).toHaveBeenCalledWith(expect.any(Function));
  });
});
