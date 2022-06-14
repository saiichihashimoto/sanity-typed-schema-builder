import { z } from "zod";

import { createType } from "../types";

import type { DocumentType } from "../document";
import type { FieldOptionKeys } from "../field";
import type { SanityType, TypeValidation } from "../types";
import type { Faker } from "@faker-js/faker";
import type { Schema } from "@sanity/types";

interface SanityReference {
  _ref: string;
  _type: "reference";
  _weak?: boolean;
}

export const reference = <
  DocumentName extends string,
  ReferencesArray extends [
    DocumentType<DocumentName, any>,
    ...Array<DocumentType<DocumentName, any>>
  ],
  Output = SanityReference
>({
  to: documents,
  mock = (faker) => ({
    _ref: faker.datatype.uuid(),
    _type: "reference",
  }),
  zod: zodFn = (zod) =>
    zod as unknown as z.ZodType<Output, any, SanityReference>,
  ...def
}: Omit<
  TypeValidation<Schema.ReferenceDefinition, SanityReference>,
  FieldOptionKeys | "to" | "type"
> & {
  mock?: (faker: Faker, path: string) => SanityReference;
  to: ReferencesArray;
  zod?: (
    zod: z.ZodType<SanityReference, any, SanityReference>
  ) => z.ZodType<Output, any, SanityReference>;
}): SanityType<
  Omit<
    TypeValidation<Schema.ReferenceDefinition, SanityReference>,
    FieldOptionKeys
  >,
  z.ZodType<Output, any, SanityReference>
> =>
  createType({
    mock,
    zod: zodFn(
      z.object({
        _ref: z.string(),
        _type: z.literal("reference"),
        _weak: z.boolean().optional(),
      })
    ),
    schema: () => ({
      ...def,
      type: "reference",
      to: documents.map(({ name }) => ({ type: name })),
    }),
  });
