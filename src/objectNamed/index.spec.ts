import { describe, expect, it } from "@jest/globals";

import { boolean } from "../boolean";
import { fields } from "../fields";
import { string } from "../string";

import { objectNamed } from ".";

import type { ValidateShape } from "../test-utils";
import type { InferInput, InferOutput } from "../types";

describe("object", () => {
  it("builds a sanity config", () =>
    expect(objectNamed({ name: "foo", fields: fields() }).schema()).toEqual({
      name: "foo",
      type: "object",
      fields: [],
    }));

  it("passes through schema values", () =>
    expect(
      objectNamed({ name: "foo", fields: fields(), hidden: false }).schema()
    ).toHaveProperty("hidden", false));

  it("parses into an object", () => {
    const type = objectNamed({ name: "foo", fields: fields() });

    const value: ValidateShape<InferInput<typeof type>, { _type: "foo" }> = {
      _type: "foo",
    };
    const parsedValue: ValidateShape<
      InferOutput<typeof type>,
      { _type: "foo" }
    > = type.parse(value);

    expect(parsedValue).toEqual(value);
  });

  it("makes a reference", () => {
    const type = objectNamed({ name: "foo", fields: fields() });

    const type2 = objectNamed({
      name: "bar",
      fields: fields().field({ name: "foo", type: type.ref() }),
    });

    const value: ValidateShape<
      InferInput<typeof type2>,
      { _type: "bar"; foo: { _type: "foo" } }
    > = {
      _type: "bar",
      foo: { _type: "foo" },
    };
    const parsedValue: ValidateShape<
      InferOutput<typeof type2>,
      { _type: "bar"; foo: { _type: "foo" } }
    > = type2.parse(value);

    expect(parsedValue).toEqual(value);
  });

  it("adds fields", () => {
    const type = objectNamed({
      name: "foo",
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
        _type: "foo";
        bar?: boolean;
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
        bar?: boolean;
        foo: boolean;
      }
    > = type.parse(value);

    expect(parsedValue).toEqual(value);
  });

  it("mocks the field values", () =>
    expect(
      objectNamed({
        name: "foo",
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
            { _type: "foo", foo: true, bar: "foo" },
            { _type: "foo", foo: false, bar: "bar" },
          ] as const),
      }).mock()
    ));

  it("allows selection values", () =>
    expect(
      objectNamed({
        name: "foo",
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
    const type = objectNamed({
      name: "foo",
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

    const preview = type.schema().preview!;

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

    expect(
      ("prepare" in preview ? preview : undefined)!.prepare(value)
    ).toEqual({
      title: "someFoo",
      subtitle: "someBar",
    });
  });
});
