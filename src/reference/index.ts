import { z } from "zod";

import { createType } from "../types";

import type { DocumentType } from "../document";
import type { FieldOptionKeys } from "../field";
import type { TypeValidation } from "../types";
import type { Faker } from "@faker-js/faker";
import type { Schema } from "@sanity/types";

interface SanityReference {
  _ref: string;
  _type: "reference";
  _weak?: boolean;
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
) => ({
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

export const reference = (def: ReferenceDef = {}) =>
  referenceInternal<never>(def, []);
