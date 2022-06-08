import { describe, expect, it } from "@jest/globals";

import { boolean } from "../boolean";
import { fields } from "../fields";
import { string } from "../string";
import { mockRule } from "../test-utils";

import { object } from ".";

import type { ValidateShape } from "../test-utils";
import type { InferInput, InferOutput } from "../types";

describe("object", () => {
  it("builds a sanity config", () =>
    expect(object({ fields: fields() }).schema()).toEqual({
      type: "object",
      fields: [],
    }));

  it("passes through schema values", () =>
    expect(object({ fields: fields(), hidden: false }).schema()).toHaveProperty(
      "hidden",
      false
    ));

  it("parses into an object", () => {
    const type = object({ fields: fields() });

    const value: ValidateShape<
      InferInput<typeof type>,
      Record<never, never>
    > = {};
    const parsedValue: ValidateShape<
      InferOutput<typeof type>,
      Record<never, never>
    > = type.parse(value);

    expect(parsedValue).toEqual(value);
  });

  it("adds fields", () => {
    const type = object({
      fields: fields()
        .field({
          name: "foo",
          type: boolean(),
        })
        .field({
          name: "bar",
          optional: true,
          type: boolean(),
        }),
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

    const value: ValidateShape<
      InferInput<typeof type>,
      {
        bar?: boolean;
        foo: boolean;
      }
    > = {
      foo: true,
    };
    const parsedValue: ValidateShape<
      InferOutput<typeof type>,
      {
        bar?: boolean;
        foo: boolean;
      }
    > = type.parse(value);

    expect(parsedValue).toEqual(value);
  });

  it("mocks the field values", () =>
    expect(
      object({
        fields: fields()
          .field({
            name: "foo",
            type: boolean(),
          })
          .field({
            name: "bar",
            type: string(),
          }),
      }).mock()
    ).toEqual({
      foo: expect.any(Boolean),
      bar: expect.any(String),
    }));

  it("allows defining the mocks", () =>
    expect([
      { foo: true, bar: "foo" },
      { foo: false, bar: "bar" },
    ]).toContainEqual(
      object({
        fields: fields()
          .field({
            name: "foo",
            type: boolean(),
          })
          .field({
            name: "bar",
            type: string(),
          }),
        mock: (faker) =>
          faker.helpers.arrayElement([
            { foo: true, bar: "foo" },
            { foo: false, bar: "bar" },
          ]),
      }).mock()
    ));

  it("allows selection values", () =>
    expect(
      object({
        fields: fields(),
        preview: {
          title: "someTitle",
          media: "someMedia",
        },
      }).schema()
    ).toHaveProperty("preview.select", {
      title: "someTitle",
      media: "someMedia",
    }));

  it("allows a function selection value", () => {
    const type = object({
      fields: fields()
        .field({
          name: "foo",
          type: string(),
        })
        .field({
          name: "bar",
          optional: true,
          type: string(),
        }),
      preview: ({ foo, bar }) => ({
        title: foo,
        subtitle: bar,
      }),
    });

    const schema = type.schema();

    const value: ValidateShape<
      InferInput<typeof type>,
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

  it("types custom validation", () => {
    const type = object({
      fields: fields()
        .field({
          name: "foo",
          type: boolean(),
        })
        .field({
          name: "bar",
          optional: true,
          type: string(),
        }),
      validation: (Rule) =>
        Rule.custom((value) => {
          const {
            foo,
          }: ValidateShape<
            typeof value,
            {
              bar?: string;
              foo: boolean;
            }
          > = value;

          return foo || "Foo needs to be true";
        }),
    });

    const rule = mockRule();

    type.schema().validation?.(rule);

    expect(rule.custom).toHaveBeenCalledWith(expect.any(Function));
  });
});