import { describe, expect, it } from "@jest/globals";

import { boolean } from "../boolean";
import { mockRule } from "../test-utils";

import { file } from ".";

import type { ValidateShape } from "../test-utils";
import type { InferInput, InferOutput } from "../types";

describe("file", () => {
  it("builds a sanity config", () =>
    expect(file().schema()).toEqual({
      type: "file",
    }));

  it("passes through schema values", () =>
    expect(file({ hidden: false }).schema()).toHaveProperty("hidden", false));

  it("parses into an file", () => {
    const type = file();

    const value: ValidateShape<
      InferInput<typeof type>,
      {
        _type: "file";
        asset: {
          _ref: string;
          _type: "reference";
        };
      }
    > = {
      _type: "file",
      asset: {
        _type: "reference",
        _ref: "somereference",
      },
    };
    const parsedValue: ValidateShape<
      InferOutput<typeof type>,
      {
        _type: "file";
        asset: {
          _ref: string;
          _type: "reference";
        };
      }
    > = type.parse(value);

    expect(parsedValue).toEqual(value);
  });

  it("adds fields", () => {
    const type = file().field({
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

    expect(schema.fields?.[0]?.validation?.(rule)).toEqual(required);

    const value: ValidateShape<
      InferInput<typeof type>,
      {
        _type: "file";
        asset: {
          _ref: string;
          _type: "reference";
        };
        foo: boolean;
      }
    > = {
      foo: true,
      _type: "file",
      asset: {
        _type: "reference",
        _ref: "somereference",
      },
    };
    const parsedValue: ValidateShape<
      InferOutput<typeof type>,
      {
        _type: "file";
        asset: {
          _ref: string;
          _type: "reference";
        };
        foo: boolean;
      }
    > = type.parse(value);

    expect(parsedValue).toEqual(value);
  });

  it("allows optional fields", () => {
    const type = file().field({
      name: "foo",
      optional: true,
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

    expect(schema.fields?.[0]?.validation?.(rule)).not.toEqual(required);

    const value: ValidateShape<
      InferInput<typeof type>,
      {
        _type: "file";
        asset: {
          _ref: string;
          _type: "reference";
        };
        foo?: boolean;
      }
    > = {
      _type: "file",
      asset: {
        _type: "reference",
        _ref: "somereference",
      },
    };
    const parsedValue: ValidateShape<
      InferOutput<typeof type>,
      {
        _type: "file";
        asset: {
          _ref: string;
          _type: "reference";
        };
        foo?: boolean;
      }
    > = type.parse(value);

    expect(parsedValue).toEqual(value);
  });
});
