import { describe, expect, it } from "@jest/globals";
import { z } from "zod";

import { boolean } from "../boolean";
import { fields } from "../fields";
import { string } from "../string";
import { mockRule } from "../test-utils";

import { document } from ".";

import type { ValidateShape } from "../test-utils";
import type { InferInput, InferOutput } from "../types";

describe("document", () => {
  it("builds a sanity config", () =>
    expect(document({ name: "foo", fields: fields() }).schema()).toEqual({
      name: "foo",
      type: "document",
      fields: [],
    }));

  it("passes through schema values", () =>
    expect(
      document({ name: "foo", title: "Foo", fields: fields() }).schema()
    ).toHaveProperty("title", "Foo"));

  it("parses into an document", () => {
    const type = document({ name: "foo", fields: fields() });

    const value: ValidateShape<
      InferInput<typeof type>,
      {
        _createdAt: string;
        _id: string;
        _rev: string;
        _type: "foo";
        _updatedAt: string;
      }
    > = {
      _createdAt: "2022-06-03T03:24:55.395Z",
      _id: "2106a34f-315f-44bc-929b-bf8e9a3eba0d",
      _rev: "somerevstring",
      _type: "foo",
      _updatedAt: "2022-06-03T03:24:55.395Z",
    };
    const parsedValue: ValidateShape<
      InferOutput<typeof type>,
      {
        _createdAt: Date;
        _id: string;
        _rev: string;
        _type: "foo";
        _updatedAt: Date;
      }
    > = type.parse(value);

    expect(parsedValue).toEqual({
      ...value,
      _createdAt: new Date("2022-06-03T03:24:55.395Z"),
      _updatedAt: new Date("2022-06-03T03:24:55.395Z"),
    });
  });

  it("adds fields", () => {
    const type = document({
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
        _createdAt: string;
        _id: string;
        _rev: string;
        _type: "foo";
        _updatedAt: string;
        bar?: boolean;
        foo: boolean;
      }
    > = {
      _createdAt: "2022-06-03T03:24:55.395Z",
      _id: "2106a34f-315f-44bc-929b-bf8e9a3eba0d",
      _rev: "somerevstring",
      _type: "foo",
      _updatedAt: "2022-06-03T03:24:55.395Z",
      foo: true,
    };
    const parsedValue: ValidateShape<
      InferOutput<typeof type>,
      {
        _createdAt: Date;
        _id: string;
        _rev: string;
        _type: "foo";
        _updatedAt: Date;
        bar?: boolean;
        foo: boolean;
      }
    > = type.parse(value);

    expect(parsedValue).toEqual({
      ...value,
      _createdAt: new Date("2022-06-03T03:24:55.395Z"),
      _updatedAt: new Date("2022-06-03T03:24:55.395Z"),
    });
  });

  it("mocks the field values", () => {
    const value = document({
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
    }).mock();

    expect(value).toEqual({
      _createdAt: expect.any(String),
      _id: expect.any(String),
      _rev: expect.any(String),
      _type: "foo",
      _updatedAt: expect.any(String),
      bar: expect.any(String),
      foo: expect.any(Boolean),
    });

    /* eslint-disable no-underscore-dangle -- Sanity fields have underscores */
    expect(new Date(value._createdAt).toString()).not.toEqual("Invalid Date");
    expect(new Date(value._updatedAt).toString()).not.toEqual("Invalid Date");
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
      document({
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
      }).mock()
    ));

  it("allows selection values", () =>
    expect(
      document({
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
    const type = document({
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

    const schema = type.schema();

    const value: ValidateShape<
      InferInput<typeof type>,
      {
        _createdAt: string;
        _id: string;
        _rev: string;
        _type: "foo";
        _updatedAt: string;
        bar?: string;
        foo: string;
      }
    > = {
      _createdAt: "2022-06-03T03:24:55.395Z",
      _id: "2106a34f-315f-44bc-929b-bf8e9a3eba0d",
      _rev: "somerevstring",
      _type: "foo",
      _updatedAt: "2022-06-03T03:24:55.395Z",
      bar: "someBar",
      foo: "someFoo",
    };

    expect(schema.preview?.prepare?.(value)).toEqual({
      title: "someFoo",
      subtitle: "someBar",
    });
  });

  it("types custom validation", () => {
    const type = document({
      name: "foo",
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
              _createdAt: string;
              _id: string;
              _rev: string;
              _type: "foo";
              _updatedAt: string;
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
