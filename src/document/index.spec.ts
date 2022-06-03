import { describe, expect, it } from "@jest/globals";

import { s } from "..";

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
    expect(s.document({ name: "foo" }).schema()).toEqual({
      name: "foo",
      type: "document",
      fields: [],
    }));

  it("passes through schema values", () =>
    expect(s.document({ name: "foo", title: "Foo" }).schema()).toHaveProperty(
      "title",
      "Foo"
    ));

  it("parses into an document", () => {
    const type = s.document({ name: "foo" });

    const value: s.input<typeof type> = {
      _createdAt: "2022-06-03T03:24:55.395Z",
      _id: "2106a34f-315f-44bc-929b-bf8e9a3eba0d",
      _rev: "somerevstring",
      _type: "foo",
      _updatedAt: "2022-06-03T03:24:55.395Z",
    };
    const parsedValue: s.output<typeof type> = type.parse(value);

    expect(parsedValue).toEqual({
      ...value,
      _createdAt: new Date("2022-06-03T03:24:55.395Z"),
      _updatedAt: new Date("2022-06-03T03:24:55.395Z"),
    });
  });

  it("adds fields", () => {
    const type = s.document({ name: "foo" }).field({
      name: "foo",
      type: s.boolean(),
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

    const value: s.input<typeof type> = {
      _createdAt: "2022-06-03T03:24:55.395Z",
      _id: "2106a34f-315f-44bc-929b-bf8e9a3eba0d",
      _rev: "somerevstring",
      _type: "foo",
      _updatedAt: "2022-06-03T03:24:55.395Z",
      foo: true,
    };
    const parsedValue: s.output<typeof type> = type.parse(value);

    expect(parsedValue).toEqual({
      ...value,
      _createdAt: new Date("2022-06-03T03:24:55.395Z"),
      _updatedAt: new Date("2022-06-03T03:24:55.395Z"),
    });
  });

  it("allows optional fields", () => {
    const type = s.document({ name: "foo" }).field({
      name: "foo",
      optional: true,
      type: s.boolean(),
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

    const value: s.input<typeof type> = {
      _createdAt: "2022-06-03T03:24:55.395Z",
      _id: "2106a34f-315f-44bc-929b-bf8e9a3eba0d",
      _rev: "somerevstring",
      _type: "foo",
      _updatedAt: "2022-06-03T03:24:55.395Z",
    };
    const parsedValue: s.output<typeof type> = type.parse(value);

    expect(parsedValue).toEqual({
      ...value,
      _createdAt: new Date("2022-06-03T03:24:55.395Z"),
      _updatedAt: new Date("2022-06-03T03:24:55.395Z"),
    });
  });
});
