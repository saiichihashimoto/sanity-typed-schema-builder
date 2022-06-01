import { describe, expect, it } from "@jest/globals";

import { s } from "..";

import type { DocumentDef } from "@sanity/base";

type MyDocumentDef = DocumentDef<string, never, string, never, never, never>;

interface DocumentValue {
  _createdAt: string;
  _rev: string;
  _type: string;
  _updatedAt: string;
}

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
  it("builds a sanity config", () => {
    const schema: MyDocumentDef = s.document({ name: "foo" }).schema();

    expect(schema).toEqual({ name: "foo", type: "document", fields: [] });
  });

  it("passes through schema values", () => {
    const schema: MyDocumentDef = s
      .document({ name: "foo", title: "Foo" })
      .schema();

    expect(schema).toHaveProperty("title", "Foo");
  });

  it("infers a document", () => {
    const type = s.document({ name: "foo" });
    const value: DocumentValue = {
      _createdAt: "somedatestring",
      _rev: "somerevstring",
      _type: "foo",
      _updatedAt: "somedatestring",
    };
    const inferredValue: s.infer<typeof type> = { ...value };
    const otherValue: DocumentValue = { ...inferredValue };

    expect(inferredValue).toEqual(value);
    expect(inferredValue).toEqual(otherValue);
  });

  it("adds fields", () => {
    const type = s.document({ name: "foo" }).field("foo", s.boolean());
    const schema: MyDocumentDef = type.schema();

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

    const value: DocumentValue & { foo: boolean } = {
      _createdAt: "somedatestring",
      _rev: "somerevstring",
      _type: "foo",
      _updatedAt: "somedatestring",
      foo: true,
    };
    const inferredValue: s.infer<typeof type> = { ...value };
    const otherValue: DocumentValue & { foo: boolean } = { ...inferredValue };

    expect(inferredValue).toEqual(value);
    expect(inferredValue).toEqual(otherValue);
  });

  it("allows optional fields", () => {
    const type = s
      .document({ name: "foo" })
      .field("foo", s.boolean(), { optional: true });
    const schema: MyDocumentDef = type.schema();

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

    const value: DocumentValue & { foo?: boolean } = {
      _createdAt: "somedatestring",
      _rev: "somerevstring",
      _type: "foo",
      _updatedAt: "somedatestring",
    };
    const inferredValue: s.infer<typeof type> = { ...value };
    const otherValue: DocumentValue & { foo?: boolean } = { ...inferredValue };

    expect(inferredValue).toEqual(value);
    expect(inferredValue).toEqual(otherValue);
  });
});
