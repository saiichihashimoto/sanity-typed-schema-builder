import { describe, expect, it } from "@jest/globals";

import { boolean } from "../boolean";
import { field } from "../field";
import { string } from "../string";
import { mockRule } from "../test-utils";

import { file } from ".";

import type { ValidateShape } from "../test-utils";
import type { InferInput, InferOutput } from "../types";
import type { PartialDeep } from "type-fest";

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
        _ref: "file-5igDD9UuXffIucwZpyVthr0c",
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
    const type = file({
      fields: field({
        name: "foo",
        type: boolean(),
      }).field({
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
        _type: "file";
        asset: {
          _ref: string;
          _type: "reference";
        };
        bar?: boolean;
        foo: boolean;
      }
    > = {
      foo: true,
      _type: "file",
      asset: {
        _type: "reference",
        _ref: "file-5igDD9UuXffIucwZpyVthr0c",
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
        bar?: boolean;
        foo: boolean;
      }
    > = type.parse(value);

    expect(parsedValue).toEqual(value);
  });

  it("mocks the field values", () =>
    expect(
      file({
        fields: field({
          name: "foo",
          type: boolean(),
        }).field({
          name: "bar",
          type: string(),
        }),
      }).mock()
    ).toEqual({
      _type: "file",
      bar: expect.any(String),
      foo: expect.any(Boolean),
      asset: {
        _type: "reference",
        _ref: expect.any(String),
      },
    }));

  it("allows defining the mocks", () =>
    expect([
      {
        _type: "file",
        asset: {
          _type: "reference",
          _ref: "file-5igDD9UuXffIucwZpyVthr0c",
        },
        foo: true,
        bar: "foo",
      },
      {
        _type: "file",
        asset: {
          _type: "reference",
          _ref: "file-5igDD9UuXffIucwZpyVthr0c",
        },
        foo: false,
        bar: "bar",
      },
    ] as const).toContainEqual(
      file({
        fields: field({
          name: "foo",
          type: boolean(),
        }).field({
          name: "bar",
          type: string(),
        }),
        mock: (faker) =>
          faker.helpers.arrayElement([
            {
              _type: "file",
              asset: {
                _type: "reference",
                _ref: "file-5igDD9UuXffIucwZpyVthr0c",
              },
              foo: true,
              bar: "foo",
            },
            {
              _type: "file",
              asset: {
                _type: "reference",
                _ref: "file-5igDD9UuXffIucwZpyVthr0c",
              },
              foo: false,
              bar: "bar",
            },
          ] as const),
      }).mock()
    ));

  it("allows defining the zod", () => {
    const type = file({
      zod: (zod) => zod.transform((value) => Object.keys(value).length),
    });

    const parsedValue: ValidateShape<
      InferOutput<typeof type>,
      number
    > = type.parse({
      _type: "file",
      asset: {
        _type: "reference",
        _ref: "file-5igDD9UuXffIucwZpyVthr0c",
      },
    });

    expect(parsedValue).toEqual(2);
  });

  it("types custom validation", () => {
    const type = file({
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
              _type: "file";
              asset: {
                _ref: string;
                _type: "reference";
              };
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
