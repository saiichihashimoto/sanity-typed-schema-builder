import { faker } from "@faker-js/faker";
import { describe, expect, it } from "@jest/globals";

import { mockRule } from "../test-utils";

import { block } from ".";

import type { ValidateShape } from "../test-utils";
import type {
  InferParsedValue,
  InferResolvedValue,
  InferValue,
} from "../types";
import type { PortableTextBlock } from "@portabletext/types";

describe("block", () => {
  it("builds a sanity config", () =>
    expect(block().schema()).toEqual({ type: "block" }));

  it("passes through schema values", () =>
    expect(block({ hidden: false }).schema()).toHaveProperty("hidden", false));

  it("parses into a block", () => {
    const type = block();

    const value: ValidateShape<InferValue<typeof type>, PortableTextBlock> = {
      style: "normal",
      _type: "block",
      markDefs: [],
      children: [
        {
          _type: "span",
          text: "Amazing, actually.",
          marks: [],
        },
      ],
    };
    const parsedValue: ValidateShape<
      InferParsedValue<typeof type>,
      PortableTextBlock
    > = type.parse(value);

    expect(parsedValue).toEqual(value);
  });

  it("resolves into a block", () => {
    const type = block();

    const value: ValidateShape<InferValue<typeof type>, PortableTextBlock> = {
      style: "normal",
      _type: "block",
      markDefs: [],
      children: [
        {
          _type: "span",
          text: "Amazing, actually.",
          marks: [],
        },
      ],
    };
    const resolvedValue: ValidateShape<
      InferResolvedValue<typeof type>,
      PortableTextBlock
    > = type.resolve(value);

    expect(resolvedValue).toEqual(value);
  });

  it("mocks block content", () =>
    expect(block().mock(faker)).toEqual({
      style: "normal",
      _type: "block",
      markDefs: [],
      children: [
        {
          _type: "span",
          text: expect.any(String),
          marks: [],
        },
      ],
    }));

  it("mocks the same value with the same path", () => {
    expect(block().mock(faker)).toEqual(block().mock(faker));
    expect(block().mock(faker, ".foo")).toEqual(block().mock(faker, ".foo"));

    expect(block().mock(faker, ".foo")).not.toEqual(block().mock(faker));
    expect(block().mock(faker)).not.toEqual(block().mock(faker, ".foo"));
  });

  it("allows defining the mocks", () =>
    expect([
      {
        style: "normal",
        _type: "block",
        markDefs: [],
        children: [
          {
            _type: "span",
            text: "That was ",
            marks: [],
          },
          {
            _type: "span",
            text: "bold",
            marks: ["strong"],
          },
          {
            _type: "span",
            text: " of you.",
            marks: [],
          },
        ],
      },
      {
        style: "normal",
        _type: "block",
        markDefs: [],
        children: [
          {
            _type: "span",
            text: "Amazing, actually.",
            marks: [],
          },
        ],
      },
    ]).toContainEqual(
      block({
        mock: (faker) =>
          faker.helpers.arrayElement([
            {
              style: "normal",
              _type: "block",
              markDefs: [],
              children: [
                {
                  _type: "span",
                  text: "That was ",
                  marks: [],
                },
                {
                  _type: "span",
                  text: "bold",
                  marks: ["strong"],
                },
                {
                  _type: "span",
                  text: " of you.",
                  marks: [],
                },
              ],
            },
            {
              style: "normal",
              _type: "block",
              markDefs: [],
              children: [
                {
                  _type: "span",
                  text: "Amazing, actually.",
                  marks: [],
                },
              ],
            },
          ]),
      }).mock(faker)
    ));

  it("allows defining the zod", () => {
    const type = block({
      zod: (zod) => zod.transform(({ _type }) => _type),
    });

    const parsedValue: ValidateShape<
      InferParsedValue<typeof type>,
      string
    > = type.parse({
      style: "normal",
      _type: "block",
      markDefs: [],
      children: [
        {
          _type: "span",
          text: "Amazing, actually.",
          marks: [],
        },
      ],
    });

    expect(parsedValue).toEqual("block");
  });

  it("types custom validation", () => {
    const type = block({
      validation: (Rule) =>
        Rule.custom(
          (block) =>
            (block?.children.length ?? 0) > 0 || "Needs to have children"
        ),
    });

    const rule = mockRule();

    type.schema().validation?.(rule);

    expect(rule.custom).toHaveBeenCalledWith(expect.any(Function));
  });
});
