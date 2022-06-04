import { describe, expect, it } from "@jest/globals";

import { boolean } from "../boolean";

import { document } from ".";

import type { ValidateShape } from "../test-types";
import type { InferInput, InferOutput } from "../types";

const mockRule = () => {
  const rule = {
    custom: () => rule,
    error: () => rule,
    greaterThan: () => rule,
    integer: () => rule,
    length: () => rule,
    lessThan: () => rule,
    lowercase: () => rule,
    max: () => rule,
    min: () => rule,
    negative: () => rule,
    positive: () => rule,
    precision: () => rule,
    regex: () => rule,
    required: () => rule,
    unique: () => rule,
    uppercase: () => rule,
    uri: () => rule,
    valueOfField: () => undefined,
    warning: () => rule,
  };

  return rule;
};

describe("document", () => {
  it("builds a sanity config", () =>
    expect(document({ name: "foo" }).schema()).toEqual({
      name: "foo",
      type: "document",
      fields: [],
    }));

  it("passes through schema values", () =>
    expect(document({ name: "foo", title: "Foo" }).schema()).toHaveProperty(
      "title",
      "Foo"
    ));

  it("parses into an document", () => {
    const type = document({ name: "foo" });

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
    const type = document({ name: "foo" }).field({
      name: "foo",
      type: boolean(),
    });
    const schema = type.schema();

    expect(schema).toHaveProperty("fields", [
      {
        name: "foo",
        type: "boolean",
        validation: expect.any(Function),
      },
    ]);

    const required = mockRule();

    const rule = {
      ...mockRule(),
      required: () => required,
    };

    expect(schema.fields[0]?.validation?.(rule)).toEqual(required);

    const value: ValidateShape<
      InferInput<typeof type>,
      {
        _createdAt: string;
        _id: string;
        _rev: string;
        _type: "foo";
        _updatedAt: string;
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
        foo: boolean;
      }
    > = type.parse(value);

    expect(parsedValue).toEqual({
      ...value,
      _createdAt: new Date("2022-06-03T03:24:55.395Z"),
      _updatedAt: new Date("2022-06-03T03:24:55.395Z"),
    });
  });

  it("allows optional fields", () => {
    const type = document({ name: "foo" }).field({
      name: "foo",
      optional: true,
      type: boolean(),
    });

    const schema = type.schema();

    expect(schema).toHaveProperty("fields", [
      {
        name: "foo",
        type: "boolean",
      },
    ]);

    const required = mockRule();

    const rule = {
      ...mockRule(),
      required: () => required,
    };

    expect(schema.fields[0]?.validation?.(rule)).not.toEqual(required);

    const value: ValidateShape<
      InferInput<typeof type>,
      {
        _createdAt: string;
        _id: string;
        _rev: string;
        _type: "foo";
        _updatedAt: string;
        foo?: boolean;
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
        foo?: boolean;
      }
    > = type.parse(value);

    expect(parsedValue).toEqual({
      ...value,
      _createdAt: new Date("2022-06-03T03:24:55.395Z"),
      _updatedAt: new Date("2022-06-03T03:24:55.395Z"),
    });
  });
});
