import { describe, expect, it } from "@jest/globals";

import { boolean } from "../boolean";
import { field } from "../field";
import { string } from "../string";
import { mockRule } from "../test-utils";

import { object } from ".";

import type { ValidateShape } from "../test-utils";
import type { InferInput, InferOutput, Merge } from "../types";
import type { PartialDeep } from "type-fest";

describe("object", () => {
  it("builds a sanity config", () =>
    expect(
      object({
        fields: field({
          name: "foo",
          type: boolean(),
        }),
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
        fields: field({
          name: "foo",
          type: boolean(),
        }),
        hidden: false,
      }).schema()
    ).toHaveProperty("hidden", false));

  it("parses into an object", () => {
    const type = object({
      fields: field({
        name: "foo",
        type: boolean(),
      }),
    });

    const value: ValidateShape<InferInput<typeof type>, { foo: boolean }> = {
      foo: true,
    };
    const parsedValue: ValidateShape<
      InferOutput<typeof type>,
      { foo: boolean }
    > = type.parse(value);

    expect(parsedValue).toEqual(value);
  });

  it("mocks the field values", () =>
    expect(
      object({
        fields: field({
          name: "foo",
          type: boolean(),
        }).field({
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
        fields: field({
          name: "foo",
          type: boolean(),
        }).field({
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

  it("sets preview.select", () =>
    expect(
      object({
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

  it("types prepare function", () => {
    const type = object({
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
      fields: field({
        name: "foo",
        type: boolean(),
      }),
      zod: (zod) => zod.transform((value) => Object.keys(value).length),
    });

    const parsedValue: ValidateShape<
      InferOutput<typeof type>,
      number
    > = type.parse({ foo: true });

    expect(parsedValue).toEqual(1);
  });

  it("types custom validation", () => {
    const type = object({
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
