import { describe, expect, it } from "@jest/globals";

import { boolean } from "../boolean";
import { string } from "../string";
import { mockRule } from "../test-utils";

import { fields } from ".";

import type { ValidateShape } from "../test-utils";
import type { InferInput, InferOutput } from "../types";

describe("fields", () => {
  it("builds a sanity config", () => expect(fields().schema()).toEqual([]));

  it("parses into an object", () => {
    const type = fields();

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
    const type = fields().field({
      name: "foo",
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

    const required = mockRule();

    const rule = {
      ...mockRule(),
      required: () => required,
    };

    expect(schema[0]?.validation?.(rule)).toEqual(required);

    const value: ValidateShape<InferInput<typeof type>, { foo: boolean }> = {
      foo: true,
    };
    const parsedValue: ValidateShape<
      InferOutput<typeof type>,
      { foo: boolean }
    > = type.parse(value);

    expect(parsedValue).toEqual(value);
  });

  it("allows optional fields", () => {
    const type = fields().field({
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

    const required = mockRule();

    const rule = {
      ...mockRule(),
      required: () => required,
    };

    expect(schema[0]?.validation?.(rule)).not.toEqual(required);

    const value: ValidateShape<InferInput<typeof type>, { foo?: boolean }> = {};
    const parsedValue: ValidateShape<
      InferOutput<typeof type>,
      { foo?: boolean }
    > = type.parse(value);

    expect(parsedValue).toEqual(value);
  });

  it("mocks the field values", () =>
    expect(
      fields()
        .field({
          name: "foo",
          type: boolean(),
        })
        .field({
          name: "bar",
          type: string(),
        })
        .mock()
    ).toEqual({
      foo: expect.any(Boolean),
      bar: expect.any(String),
    }));
});
