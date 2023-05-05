import { faker } from "@faker-js/faker";
import { describe, expect, it } from "@jest/globals";
import type { PortableTextBlock } from "@portabletext/types";
import { s } from "@sanity-typed/schema-builder";
import type { SanityBlock } from "@sanity-typed/schema-builder";

import { mockRule } from "../test-utils";
import type { Equal, Expect } from "../test-utils";

describe("block", () => {
  it("builds a sanity config", () =>
    expect(s.block().schema()).toStrictEqual({ type: "block" }));

  it("passes through schema values", () =>
    expect(s.block({ hidden: false }).schema()).toHaveProperty(
      "hidden",
      false
    ));

  it("parses into a block", () => {
    const type = s.block();

    const value = {
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
    } as s.infer<typeof type>;
    const parsedValue = type.parse(value);

    type Assertions = [
      Expect<Equal<typeof value, PortableTextBlock>>,
      Expect<Equal<typeof parsedValue, PortableTextBlock>>
    ];

    expect(parsedValue).toStrictEqual(value);
  });

  it("resolves into a block", () => {
    const type = s.block();

    const value = {
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
    } as s.infer<typeof type>;
    const resolvedValue = type.resolve(value);

    type Assertions = [
      Expect<Equal<typeof value, PortableTextBlock>>,
      Expect<Equal<typeof resolvedValue, PortableTextBlock>>
    ];

    expect(resolvedValue).toStrictEqual(value);
  });

  it("mocks block content", () =>
    expect(s.block().mock(faker)).toStrictEqual({
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
    expect(s.block().mock(faker)).toStrictEqual(s.block().mock(faker));
    expect(s.block().mock(faker, ".foo")).toStrictEqual(
      s.block().mock(faker, ".foo")
    );

    expect(s.block().mock(faker, ".foo")).not.toStrictEqual(
      s.block().mock(faker)
    );
    expect(s.block().mock(faker)).not.toStrictEqual(
      s.block().mock(faker, ".foo")
    );
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
      s
        .block({
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
        })
        .mock(faker)
    ));

  it("allows defining the zod", () => {
    const type = s.block({
      zod: (zod) => zod.transform(({ _type }) => _type),
    });

    const parsedValue = type.parse({
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

    type Assertions = [Expect<Equal<typeof parsedValue, string>>];

    expect(parsedValue).toBe("block");
  });

  it("types custom validation", () => {
    const type = s.block({
      validation: (Rule) =>
        Rule.custom((value) => {
          type Assertions = [
            Expect<Equal<typeof value, SanityBlock | undefined>>
          ];

          return (value?.children.length ?? 0) > 0 || "Needs to have children";
        }),
    });

    const rule = mockRule();

    type.schema().validation?.(rule);

    expect(rule.custom).toHaveBeenCalledWith(expect.any(Function));
  });
});
