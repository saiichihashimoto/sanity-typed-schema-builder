import { faker } from "@faker-js/faker";
import { describe, expect, it } from "@jest/globals";

import { boolean } from "../boolean";
import { string } from "../string";
import { mockRule } from "../test-utils";

import { object } from ".";

import type { ValidateShape } from "../test-utils";
import type {
  InferParsedValue,
  InferResolvedValue,
  InferValue,
} from "../types";
import type { Merge } from "type-fest";

describe("object", () => {
  it("builds a sanity config", () =>
    expect(
      object({
        fields: [
          {
            name: "foo",
            type: boolean(),
          },
        ],
      }).schema()
    ).toEqual({
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
      object({
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
    const type = object({
      fields: [
        {
          name: "foo",
          type: boolean(),
        },
      ],
    });

    const value: ValidateShape<InferValue<typeof type>, { foo: boolean }> = {
      foo: true,
    };
    const parsedValue: ValidateShape<
      InferParsedValue<typeof type>,
      { foo: boolean }
    > = type.parse(value);

    expect(parsedValue).toEqual(value);
  });

  it("resolves into an object", () => {
    const type = object({
      fields: [
        {
          name: "foo",
          type: boolean({
            zodResolved: (zod) => zod.transform(() => "foo"),
          }),
        },
      ],
    });

    const value: ValidateShape<InferValue<typeof type>, { foo: boolean }> = {
      foo: true,
    };
    const resolvedValue: ValidateShape<
      InferResolvedValue<typeof type>,
      { foo: string }
    > = type.resolve(value);

    expect(resolvedValue).toEqual({ foo: "foo" });
  });

  it("allows optional fields", () => {
    const type = object({
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
      InferValue<typeof type>,
      {
        bar?: string;
        foo: boolean;
      }
    > = { foo: true };
    const parsedValue: ValidateShape<
      InferParsedValue<typeof type>,
      {
        bar?: string;
        foo: boolean;
      }
    > = type.parse(value);

    expect(parsedValue).toEqual(value);
  });

  it("mocks the field values", () =>
    expect(
      object({
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
      foo: expect.any(Boolean),
      bar: expect.any(String),
    }));

  it("mocks the same value with the same path", () => {
    const objectDef = () => {
      const field = {
        name: "foo",
        type: string(),
      };

      const fields: [typeof field] = [field];

      return { fields };
    };

    expect(object(objectDef()).mock(faker)).toEqual(
      object(objectDef()).mock(faker)
    );
    expect(object(objectDef()).mock(faker, ".foo")).toEqual(
      object(objectDef()).mock(faker, ".foo")
    );

    expect(object(objectDef()).mock(faker, ".foo")).not.toEqual(
      object(objectDef()).mock(faker)
    );
    expect(object(objectDef()).mock(faker)).not.toEqual(
      object(objectDef()).mock(faker, ".foo")
    );
  });

  it("allows defining the mocks", () =>
    expect([
      { foo: true, bar: "foo" },
      { foo: false, bar: "bar" },
    ]).toContainEqual(
      object({
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
            { foo: true, bar: "foo" },
            { foo: false, bar: "bar" },
          ]),
      }).mock(faker)
    ));

  it("sets preview.select", () =>
    expect(
      object({
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

  it("types prepare function", () => {
    const type = object({
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
      InferValue<typeof type>,
      {
        bar?: string;
        foo: string;
      }
    > = {
      bar: "someBar",
      foo: "someFoo",
    };

    expect(schema.preview?.prepare?.(value)).toEqual({
      title: "someFoo",
      subtitle: "someBar",
    });
  });

  it("allows defining the zod", () => {
    const type = object({
      fields: [
        {
          name: "foo",
          type: boolean({
            zod: (zod) => zod.transform((value) => (value ? 1 : 0)),
          }),
        },
      ],
      zod: (zod) => zod.transform((value) => Object.entries(value)),
    });

    const parsedValue: ValidateShape<
      InferParsedValue<typeof type>,
      Array<[string, 0 | 1]>
    > = type.parse({ foo: true });

    expect(parsedValue).toEqual([["foo", 1]]);
  });

  it("types custom validation", () => {
    const type = object({
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
          const object: ValidateShape<
            typeof value,
            | {
                bar: string;
                foo?: boolean;
              }
            | undefined
          > = value;

          return !object?.bar || "Needs an empty bar";
        }),
    });

    const rule = mockRule();

    type.schema().validation?.(rule);

    expect(rule.custom).toHaveBeenCalledWith(expect.any(Function));
  });
});
