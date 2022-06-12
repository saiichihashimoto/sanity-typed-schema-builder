import { describe, expect, it } from "@jest/globals";

import { boolean } from "../boolean";
import { field } from "../field";
import { string } from "../string";
import { mockRule } from "../test-utils";

import { image } from ".";

import type { ValidateShape } from "../test-utils";
import type { InferInput, InferOutput } from "../types";
import type { PartialDeep } from "type-fest";

describe("image", () => {
  it("builds a sanity config", () =>
    expect(image().schema()).toEqual({
      type: "image",
    }));

  it("passes through schema values", () =>
    expect(image({ hidden: false }).schema()).toHaveProperty("hidden", false));

  it("parses into an image", () => {
    const type = image();

    const value: ValidateShape<
      InferInput<typeof type>,
      {
        _type: "image";
        asset: {
          _ref: string;
          _type: "reference";
        };
      }
    > = {
      _type: "image",
      asset: {
        _type: "reference",
        _ref: "image-S2od0Kd5mpOa4Y0Wlku8RvXE",
      },
    };
    const parsedValue: ValidateShape<
      InferOutput<typeof type>,
      {
        _type: "image";
        asset: {
          _ref: string;
          _type: "reference";
        };
      }
    > = type.parse(value);

    expect(parsedValue).toEqual(value);
  });

  it("adds hotspot", () => {
    const type = image({ hotspot: true });

    const value: ValidateShape<
      InferInput<typeof type>,
      {
        _type: "image";
        asset: {
          _ref: string;
          _type: "reference";
        };
        crop: {
          bottom: number;
          left: number;
          right: number;
          top: number;
        };
        hotspot: {
          height: number;
          width: number;
          x: number;
          y: number;
        };
      }
    > = {
      _type: "image",
      asset: {
        _type: "reference",
        _ref: "image-S2od0Kd5mpOa4Y0Wlku8RvXE",
      },
      crop: {
        top: 0.028131868131868132,
        bottom: 0.15003663003663004,
        left: 0.01875,
        right: 0.009375000000000022,
      },
      hotspot: {
        x: 0.812500000000001,
        y: 0.27963369963369955,
        height: 0.3248351648351647,
        width: 0.28124999999999994,
      },
    };
    const parsedValue: ValidateShape<
      InferOutput<typeof type>,
      {
        _type: "image";
        asset: {
          _ref: string;
          _type: "reference";
        };
        crop: {
          bottom: number;
          left: number;
          right: number;
          top: number;
        };
        hotspot: {
          height: number;
          width: number;
          x: number;
          y: number;
        };
      }
    > = type.parse(value);

    expect(parsedValue).toEqual(value);
  });

  it("adds fields", () => {
    const type = image({
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
        _type: "image";
        asset: {
          _ref: string;
          _type: "reference";
        };
        bar?: boolean;
        foo: boolean;
      }
    > = {
      foo: true,
      _type: "image",
      asset: {
        _type: "reference",
        _ref: "image-S2od0Kd5mpOa4Y0Wlku8RvXE",
      },
    };
    const parsedValue: ValidateShape<
      InferOutput<typeof type>,
      {
        _type: "image";
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
      image({
        fields: field({
          name: "foo",
          type: boolean(),
        }).field({
          name: "bar",
          type: string(),
        }),
      }).mock()
    ).toEqual({
      _type: "image",
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
        _type: "image",
        asset: {
          _type: "reference",
          _ref: "image-S2od0Kd5mpOa4Y0Wlku8RvXE",
        },
        foo: true,
        bar: "foo",
      },
      {
        _type: "image",
        asset: {
          _type: "reference",
          _ref: "image-S2od0Kd5mpOa4Y0Wlku8RvXE",
        },
        foo: false,
        bar: "bar",
      },
    ] as const).toContainEqual(
      image({
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
              _type: "image",
              asset: {
                _type: "reference",
                _ref: "image-S2od0Kd5mpOa4Y0Wlku8RvXE",
              },
              foo: true,
              bar: "foo",
            },
            {
              _type: "image",
              asset: {
                _type: "reference",
                _ref: "image-S2od0Kd5mpOa4Y0Wlku8RvXE",
              },
              foo: false,
              bar: "bar",
            },
          ] as const),
      }).mock()
    ));

  it("types custom validation", () => {
    const type = image({
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
              _type: "image";
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
