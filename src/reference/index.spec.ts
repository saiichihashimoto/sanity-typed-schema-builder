import { faker } from "@faker-js/faker";
import { describe, expect, it } from "@jest/globals";
import { s } from "@sanity-typed/schema-builder";
import type { SanityReference } from "@sanity-typed/schema-builder";

import { mockRule } from "../test-utils";
import type { Equal, Expect } from "../test-utils";

describe("reference", () => {
  it("builds a sanity config", () =>
    expect(
      s
        .reference({
          to: [
            s.document({
              name: "foo",
              fields: [
                {
                  name: "foo",
                  type: s.boolean(),
                },
              ],
            }),
          ],
        })
        .schema()
    ).toStrictEqual({
      type: "reference",
      to: [{ type: "foo" }],
      weak: undefined,
    }));

  it("passes through schema values", () =>
    expect(
      s
        .reference({
          to: [
            s.document({
              name: "foo",
              fields: [
                {
                  name: "foo",
                  type: s.boolean(),
                },
              ],
            }),
          ],
          hidden: false,
        })
        .schema()
    ).toHaveProperty("hidden", false));

  it("parses into a reference", () => {
    const type = s.reference({
      to: [
        s.document({
          name: "foo",
          fields: [
            {
              name: "foo",
              type: s.boolean(),
            },
          ],
        }),
      ],
    });

    const value = { _type: "reference", _ref: "somereference" } as s.infer<
      typeof type
    >;
    const parsedValue = type.parse(value);

    type Assertions = [
      Expect<Equal<typeof value, SanityReference>>,
      Expect<Equal<typeof parsedValue, SanityReference>>
    ];

    expect(parsedValue).toStrictEqual(value);
  });

  it("resolves into a document mock", () => {
    const docType = s.document({
      name: "foo",
      fields: [
        {
          name: "foo",
          type: s.boolean({}),
        },
      ],
    });

    const type = s.reference({
      to: [docType],
    });

    const mock = docType.mock(faker);

    const docMock = docType.resolve(mock);
    const { _id: mockId } = docMock;

    const value = { _type: "reference", _ref: mockId } as s.infer<typeof type>;
    const resolvedValue = type.resolve(value);

    type Assertions = [
      Expect<Equal<typeof value, SanityReference>>,
      Expect<Equal<typeof resolvedValue, s.resolved<typeof docType>>>
    ];

    expect(resolvedValue).toStrictEqual(docMock);
  });

  it("mocks a reference to a document mock", () => {
    const docType = s.document({
      name: "foo",
      fields: [
        {
          name: "foo",
          type: s.boolean(),
        },
      ],
    });

    const type = s.reference({
      to: [docType],
    });

    const { _id: mockId } = docType.mock(faker);

    expect(type.mock(faker)).toStrictEqual({
      _ref: mockId,
      _type: "reference",
    });
  });

  it("adds weak", () => {
    const docType = s.document({
      name: "foo",
      fields: [
        {
          name: "foo",
          type: s.boolean({}),
        },
      ],
    });

    const type = s.reference({
      weak: true,
      to: [docType],
    });

    const value = type.mock(faker) as s.infer<typeof type>;
    const parsedValue = type.parse(value);

    expect(parsedValue).toStrictEqual(value);

    const resolvedValue = type.resolve(value);

    type Assertions = [
      Expect<Equal<typeof value, SanityReference<true>>>,
      Expect<Equal<typeof parsedValue, SanityReference<true>>>,
      Expect<Equal<typeof resolvedValue, s.resolved<typeof docType> | null>>
    ];

    const docMock = docType.resolve(docType.mock(faker));

    expect([docMock, null]).toContainEqual(resolvedValue);
  });

  it("allows defining the mocks", () =>
    expect([
      {
        _ref: "ffda9bed-b959-4100-abeb-9f1e241e9445",
        _type: "reference",
      },
      {
        _ref: "93f3af18-337a-4df7-a8de-fbaa6609fd0a",
        _type: "reference",
      },
    ]).toContainEqual(
      s
        .reference({
          to: [
            s.document({
              name: "foo",
              fields: [
                {
                  name: "foo",
                  type: s.boolean(),
                },
              ],
            }),
          ],
          mock: (faker) =>
            faker.helpers.arrayElement([
              {
                _ref: "ffda9bed-b959-4100-abeb-9f1e241e9445",
                _type: "reference",
              },
              {
                _ref: "93f3af18-337a-4df7-a8de-fbaa6609fd0a",
                _type: "reference",
              },
            ]),
        })
        .mock(faker)
    ));

  it("allows defining the zod", () => {
    const type = s.reference({
      to: [
        s.document({
          name: "foo",
          fields: [
            {
              name: "foo",
              type: s.boolean(),
            },
          ],
        }),
      ],
      zod: (zod) => zod.transform(({ _ref }) => _ref),
    });

    const value = {
      _ref: "ffda9bed-b959-4100-abeb-9f1e241e9445",
      _type: "reference",
    };
    const parsedValue = type.parse(value);

    type Assertions = [Expect<Equal<typeof parsedValue, string>>];

    expect(parsedValue).toBe("ffda9bed-b959-4100-abeb-9f1e241e9445");
  });

  it("types custom validation", () => {
    const type = s.reference({
      to: [
        s.document({
          name: "foo",
          fields: [
            {
              name: "foo",
              type: s.boolean(),
            },
          ],
        }),
      ],
      validation: (Rule) =>
        Rule.custom((value) => {
          type Assertions = [
            Expect<Equal<typeof value, SanityReference | undefined>>
          ];

          return (
            // eslint-disable-next-line no-underscore-dangle -- Need _ref
            (value?._ref.length ?? 0) > 50 || "Needs to be 50 characters"
          );
        }),
    });

    const rule = mockRule();

    type.schema().validation?.(rule);

    expect(rule.custom).toHaveBeenCalledWith(expect.any(Function));
  });
});
