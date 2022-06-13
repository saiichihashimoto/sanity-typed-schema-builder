import { z } from "zod";

import { createType } from "../types";

import type { DocumentType } from "../document";
import type { FieldOptionKeys } from "../field";
import type { SanityType, TypeValidation } from "../types";
import type { Faker } from "@faker-js/faker";
import type { Schema } from "@sanity/types";

type ZodReference = z.ZodObject<
  {
    _ref: z.ZodString;
    _type: z.ZodLiteral<"reference">;
    _weak: z.ZodOptional<z.ZodBoolean>;
  },
  "strip"
>;

type SanityReference = z.input<ZodReference>;

interface ReferenceType<DocumentName extends string>
  extends SanityType<
    Omit<
      TypeValidation<Schema.ReferenceDefinition, SanityReference>,
      FieldOptionKeys
    >,
    ZodReference
  > {
  to: <Name extends string>(
    document: DocumentType<Name, any>
  ) => ReferenceType<DocumentName | Name>;
}

type ReferenceDef = Omit<
  TypeValidation<Schema.ReferenceDefinition, SanityReference>,
  FieldOptionKeys | "to" | "type"
> & {
  mock?: (faker: Faker, path: string) => SanityReference;
};

const referenceInternal = <DocumentName extends string>(
  {
    mock = (faker) => ({
      _ref: faker.datatype.uuid(),
      _type: "reference",
    }),
    ...def
  }: ReferenceDef,
  documents: Array<DocumentType<DocumentName, any>>
): ReferenceType<DocumentName> => ({
  ...createType({
    mock,
    zod: z.object({
      _ref: z.string(),
      _type: z.literal("reference"),
      _weak: z.boolean().optional(),
    }),
    schema: () => ({
      ...def,
      type: "reference",
      to: documents.map(({ name }) => ({ type: name })),
    }),
  }),
  to: <Name extends string>(document: DocumentType<Name, any>) =>
    referenceInternal<DocumentName | Name>({ mock, ...def }, [
      ...documents,
      document,
    ]),
});

export const reference = (def: ReferenceDef = {}): ReferenceType<never> =>
  referenceInternal(def, []);
