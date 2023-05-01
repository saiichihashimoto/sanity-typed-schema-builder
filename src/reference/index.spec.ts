import { faker } from "@faker-js/faker";
import { describe, expect, it } from "@jest/globals";

import { reference } from ".";
import type { SanityReference } from ".";
import { boolean } from "../boolean";
import { document } from "../document";
import { mockRule } from "../test-utils";
import type { ValidateShape } from "../test-utils";
import type {
  InferParsedValue,
  InferResolvedValue,
  InferValue,
} from "../types";

describe("reference", () => {
  it("builds a sanity config", () =>
    expect(
      reference({
        to: [
          document({
            name: "foo",
            fields: [
              {
                name: "foo",
                type: boolean(),
              },
            ],
          }),
        ],
      }).schema()
    ).toStrictEqual({
      type: "reference",
      to: [{ type: "foo" }],
      weak: undefined,
    }));

  it("passes through schema values", () =>
    expect(
      reference({
        to: [
          document({
            name: "foo",
            fields: [
              {
                name: "foo",
                type: boolean(),
              },
            ],
          }),
        ],
        hidden: false,
      }).schema()
    ).toHaveProperty("hidden", false));

  it("parses into a reference", () => {
    const type = reference({
      to: [
        document({
          name: "foo",
          fields: [
            {
              name: "foo",
              type: boolean(),
            },
          ],
        }),
      ],
    });

    const value: ValidateShape<InferValue<typeof type>, SanityReference> = {
      _type: "reference",
      _ref: "somereference",
    };
    const parsedValue: ValidateShape<
      InferParsedValue<typeof type>,
      SanityReference
    > = type.parse(value);

    expect(parsedValue).toStrictEqual(value);
  });

  it("resolves into a document mock", () => {
    const docType = document({
      name: "foo",
      fields: [
        {
          name: "foo",
          type: boolean({}),
        },
      ],
    });

    const type = reference({
      to: [docType],
    });

    const mock = docType.mock(faker);

    const docMock = docType.resolve(mock);
    const { _id: mockId } = docMock;

    const value: ValidateShape<InferValue<typeof type>, SanityReference> = {
      _type: "reference",
      _ref: mockId,
    };
    const resolvedValue: ValidateShape<
      InferResolvedValue<typeof type>,
      InferResolvedValue<typeof docType>
    > = type.resolve(value);

    expect(resolvedValue).toStrictEqual(docMock);
  });

  it("mocks a reference to a document mock", () => {
    const docType = document({
      name: "foo",
      fields: [
        {
          name: "foo",
          type: boolean(),
        },
      ],
    });

    const type = reference({
      to: [docType],
    });

    const { _id: mockId } = docType.mock(faker);

    expect(type.mock(faker)).toStrictEqual({
      _ref: mockId,
      _type: "reference",
    });

    // eslint-disable-next-line no-underscore-dangle -- references have a _ref property
    expect(docType.mock(faker)._id).toStrictEqual(type.mock(faker)._ref);
  });

  it("adds weak", () => {
    const docType = document({
      name: "foo",
      fields: [
        {
          name: "foo",
          type: boolean({}),
        },
      ],
    });

    const type = reference({
      weak: true,
      to: [docType],
    });

    const value: ValidateShape<
      InferValue<typeof type>,
      SanityReference<true>
    > = type.mock(faker);
    const parsedValue: ValidateShape<
      InferParsedValue<typeof type>,
      SanityReference<true>
    > = type.parse(value);

    expect(parsedValue).toStrictEqual(value);

    const resolvedValue: ValidateShape<
      InferResolvedValue<typeof type>,
      InferResolvedValue<typeof docType> | null
    > = type.resolve(value);

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
      reference({
        to: [
          document({
            name: "foo",
            fields: [
              {
                name: "foo",
                type: boolean(),
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
      }).mock(faker)
    ));

  it("allows defining the zod", () => {
    const type = reference({
      to: [
        document({
          name: "foo",
          fields: [
            {
              name: "foo",
              type: boolean(),
            },
          ],
        }),
      ],
      zod: (zod) => zod.transform(({ _ref }) => _ref),
    });

    const parsedValue: ValidateShape<
      InferParsedValue<typeof type>,
      string
    > = type.parse({
      _ref: "ffda9bed-b959-4100-abeb-9f1e241e9445",
      _type: "reference",
    });

    expect(parsedValue).toBe("ffda9bed-b959-4100-abeb-9f1e241e9445");
  });

  it("types custom validation", () => {
    const type = reference({
      to: [
        document({
          name: "foo",
          fields: [
            {
              name: "foo",
              type: boolean(),
            },
          ],
        }),
      ],
      validation: (Rule) =>
        Rule.custom((value) => {
          const reference: ValidateShape<
            typeof value,
            SanityReference | undefined
          > = value;

          return (
            // eslint-disable-next-line no-underscore-dangle -- Need _ref
            (reference?._ref.length ?? 0) > 50 || "Needs to be 50 characters"
          );
        }),
    });

    const rule = mockRule();

    type.schema().validation?.(rule);

    expect(rule.custom).toHaveBeenCalledWith(expect.any(Function));
  });
});
