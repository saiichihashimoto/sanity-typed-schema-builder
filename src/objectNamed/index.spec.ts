import { faker } from "@faker-js/faker";
import { describe, expect, it } from "@jest/globals";

import { boolean } from "../boolean";
import { string } from "../string";
import { mockRule } from "../test-utils";

import { objectNamed } from ".";

import type { ValidateShape } from "../test-utils";
import type { InferInput, InferOutput } from "../types";
import type { Merge, PartialDeep } from "type-fest";

describe("object", () => {
  it("builds a sanity config", () =>
    expect(
      objectNamed({
        name: "foo",
        fields: [
          {
            name: "foo",
            type: boolean(),
          },
        ],
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
        fields: [
          {
            name: "foo",
            type: boolean(),
          },
        ],
        hidden: false,
      }).schema()
    ).toHaveProperty("hidden", false));

  it("parses into an object", () => {
    const type = objectNamed({
      name: "foo",
      fields: [
        {
          name: "foo",
          type: boolean(),
        },
      ],
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

  it("allows optional fields", () => {
    const type = objectNamed({
      name: "foo",
      fields: [
        {
          name: "foo",
          type: boolean(),
        },
        {
          name: "bar",
          optional: true,
          type: string(),
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

    expect(fooRule.required).toHaveBeenCalled();

    const barRule = mockRule();

    schema.fields[1]?.validation?.(barRule);

    expect(barRule.required).not.toHaveBeenCalled();

    const value: ValidateShape<
      InferInput<typeof type>,
      {
        _type: "foo";
        bar?: string;
        foo: boolean;
      }
    > = {
      _type: "foo",
      foo: true,
    };
    const parsedValue: ValidateShape<
      InferOutput<typeof type>,
      {
        _type: "foo";
        bar?: string;
        foo: boolean;
      }
    > = type.parse(value);

    expect(parsedValue).toEqual(value);
  });

  it("makes a reference", () => {
    const type = objectNamed({
      name: "foo",
      fields: [{ name: "hello", type: string() }],
    });

    const type2 = objectNamed({
      name: "bar",
      fields: [{ name: "foo", type: type.ref() }],
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
        fields: [
          {
            name: "foo",
            type: boolean(),
          },
          {
            name: "bar",
            type: string(),
          },
        ],
      }).mock(faker)
    ).toEqual({
      _type: "foo",
      foo: expect.any(Boolean),
      bar: expect.any(String),
    }));

  it("mocks the same value with the same path", () => {
    const objectDef = () => ({
      name: "foo",
      fields: [
        {
          name: "foo",
          type: string(),
        },
      ],
    });

    expect(objectNamed(objectDef()).mock(faker)).toEqual(
      objectNamed(objectDef()).mock(faker)
    );
    expect(objectNamed(objectDef()).mock(faker, ".foo")).toEqual(
      objectNamed(objectDef()).mock(faker, ".foo")
    );

    expect(objectNamed(objectDef()).mock(faker, ".foo")).not.toEqual(
      objectNamed(objectDef()).mock(faker)
    );
    expect(objectNamed(objectDef()).mock(faker)).not.toEqual(
      objectNamed(objectDef()).mock(faker, ".foo")
    );
  });

  it("allows defining the mocks", () =>
    expect([
      { _type: "foo", foo: true, bar: "foo" },
      { _type: "foo", foo: false, bar: "bar" },
    ]).toContainEqual(
      objectNamed({
        name: "foo",
        fields: [
          {
            name: "foo",
            type: boolean(),
          },
          {
            name: "bar",
            type: string(),
          },
        ],
        mock: (faker) =>
          faker.helpers.arrayElement([
            { _type: "foo", foo: true, bar: "foo" },
            { _type: "foo", foo: false, bar: "bar" },
          ] as const),
      }).mock(faker)
    ));

  it("sets preview.select", () =>
    expect(
      objectNamed({
        name: "foo",
        fields: [
          {
            name: "foo",
            type: boolean(),
          },
        ],
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
      fields: [
        {
          name: "foo",
          type: string(),
        },
        {
          name: "bar",
          optional: true,
          type: string(),
        },
      ],
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
      fields: [
        {
          name: "foo",
          type: boolean(),
        },
      ],
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
      fields: [
        {
          name: "foo",
          optional: true,
          type: boolean(),
        },
        {
          name: "bar",
          type: string(),
        },
      ],
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

  it("handles deep references", () => {
    const type = objectNamed({
      name: "type",
      title: "Title",
      fields: [
        {
          name: "value",
          title: "Value",
          type: string(),
        },
      ],
    });

    const value: ValidateShape<
      InferInput<typeof type>,
      {
        _type: "type";
        value: string;
      }
    > = {
      _type: "type",
      value: "foo",
    };

    const referencingType = objectNamed({
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

    const referencingValue: ValidateShape<
      InferInput<typeof referencingType>,
      {
        _type: "referencingType";
        value: {
          _type: "type";
          value: string;
        };
      }
    > = {
      _type: "referencingType",
      value,
    };

    const deepReferencingType = objectNamed({
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
    const deepReferencingValue: ValidateShape<
      InferInput<typeof deepReferencingType>,
      {
        _type: "deepReferencingType";
        referencingValue: {
          _type: "referencingType";
          value: {
            _type: "type";
            value: string;
          };
        };
      }
    > = {
      _type: "deepReferencingType",
      referencingValue,
    };

    expect(deepReferencingValue).toEqual(
      deepReferencingType.parse(deepReferencingValue)
    );
  });
});
