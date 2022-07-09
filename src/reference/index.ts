import { z } from "zod";

import { createType } from "../types";

import type { DocumentType } from "../document";
import type { InferResolvedValue, InferValue, SanityTypeDef } from "../types";
import type { Reference, Schema } from "@sanity/types";
import type { Merge } from "type-fest";

export type SanityReference = Merge<
  Reference,
  {
    _type: "reference";
  }
>;

export const referenceZod: z.ZodType<SanityReference, any, SanityReference> =
  z.object({
    _key: z.string().optional(),
    _ref: z.string(),
    _strengthenOnPublish: z
      .object({
        template: z
          .object({
            id: z.string(),
            params: z
              .object({})
              .catchall(z.union([z.string(), z.number(), z.boolean()])),
          })
          .optional(),
        type: z.string(),
        weak: z.boolean().optional(),
      })
      .optional(),
    _type: z.literal("reference"),
    _weak: z.boolean().optional(),
  });

export const reference = <
  DocumentName extends string,
  DocumentTypes extends [
    DocumentType<DocumentName, any, any, any>,
    ...Array<DocumentType<DocumentName, any, any, any>>
  ],
  ParsedValue = SanityReference,
  ResolvedValue = InferResolvedValue<DocumentTypes[number]>
>({
  to: documents,
  zod: zodFn = (zod) =>
    zod as unknown as z.ZodType<ParsedValue, any, SanityReference>,
  zodResolved = (zod) =>
    zod.transform(
      ({ _ref }) =>
        documents
          .map(({ getMockById, resolve }) => {
            const mock = getMockById(_ref) as InferValue<DocumentTypes[number]>;

            return !mock ? undefined : (resolve(mock) as ResolvedValue);
          })
          .find((mock) => mock)!
    ),
  ...defRaw
}: Merge<
  SanityTypeDef<
    Schema.ReferenceDefinition,
    SanityReference,
    ParsedValue,
    ResolvedValue
  >,
  {
    to: DocumentTypes;
  }
>) => {
  // eslint-disable-next-line fp/no-let -- Need side effects
  let counter = -1;

  const {
    mock = (faker): SanityReference => {
      // eslint-disable-next-line fp/no-mutation, no-plusplus -- Need side effects
      counter++;

      return {
        _ref: faker.helpers.arrayElement(
          documents.map(
            ({ getNthMock }) => getNthMock(faker, counter) as { _id: string }
          )
        )._id,
        _type: "reference",
      };
    },
    ...def
  } = defRaw;

  return createType({
    mock,
    schema: () => ({
      ...def,
      type: "reference",
      to: documents.map(({ name: type }) => ({ type })),
    }),
    zod: zodFn(referenceZod),
    zodResolved: zodResolved(referenceZod),
  });
};
