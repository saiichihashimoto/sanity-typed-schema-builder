import { faker } from "@faker-js/faker";
import { describe, expect, it } from "@jest/globals";

import { boolean } from "../boolean";
import { string } from "../string";
import { mockRule } from "../test-utils";

import { field } from ".";

import type { ValidateShape } from "../test-utils";
import type { InferInput, InferOutput } from "../types";

describe("fields", () => {
  it("builds a sanity config", () =>
    expect(
      field({
        name: "foo",
        type: boolean(),
      }).schema()
    ).toEqual([
      {
        name: "foo",
        type: "boolean",
        validation: expect.any(Function),
      },
    ]));

  it("parses into an object", () => {
    const type = field({
      name: "foo",
      type: boolean(),
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

  it("sets required", () => {
    const type = field({
      name: "foo",
      type: boolean(),
    });

    const schema = type.schema();

    const rule = mockRule();

    schema[0]?.validation?.(rule);

    expect(rule.required).toHaveBeenCalled();
  });

  it("allows optional fields", () => {
    const type = field({
      name: "foo",
      optional: true,
      type: boolean(),
    });

    const schema = type.schema();

    expect(schema).toEqual([
      {
        name: "foo",
        type: "boolean",
        validation: expect.any(Function),
      },
    ]);

    const rule = mockRule();

    schema[0]?.validation?.(rule);

    expect(rule.required).not.toHaveBeenCalled();

    const value: ValidateShape<InferInput<typeof type>, { foo?: boolean }> = {};
    const parsedValue: ValidateShape<
      InferOutput<typeof type>,
      { foo?: boolean }
    > = type.parse(value);

    expect(parsedValue).toEqual(value);
  });

  it("mocks the field values", () =>
    expect(
      field({
        name: "foo",
        type: boolean(),
      })
        .field({
          name: "bar",
          type: string(),
        })
        .mock(faker)
    ).toEqual({
      foo: expect.any(Boolean),
      bar: expect.any(String),
    }));
});
