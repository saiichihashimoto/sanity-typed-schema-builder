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

type ReferenceDef<Output> = Omit<
  TypeValidation<Schema.ReferenceDefinition, SanityReference>,
  FieldOptionKeys | "to" | "type"
> & {
  mock?: (faker: Faker, path: string) => SanityReference;
  zod?: (
    zod: z.ZodType<SanityReference, any, SanityReference>
  ) => z.ZodType<Output, any, SanityReference>;
};

interface ReferenceType<DocumentName extends string, Output>
  extends SanityType<
    Omit<
      TypeValidation<Schema.ReferenceDefinition, SanityReference>,
      FieldOptionKeys
    >,
    z.ZodType<Output, any, SanityReference>
  > {
  to: <Name extends string>(
    document: DocumentType<Name, any>
  ) => ReferenceType<DocumentName | Name, Output>;
}

const referenceInternal = <DocumentName extends string, Output>(
  {
    mock = (faker) => ({
      _ref: faker.datatype.uuid(),
      _type: "reference",
    }),
    zod: zodFn = (zod) =>
      zod as unknown as z.ZodType<Output, any, SanityReference>,
    ...def
  }: ReferenceDef<Output>,
  documents: Array<DocumentType<DocumentName, any>>
): ReferenceType<DocumentName, Output> => ({
  ...createType({
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
  }),
  to: <Name extends string>(document: DocumentType<Name, any>) =>
    referenceInternal<DocumentName | Name, Output>({ mock, ...def }, [
      ...documents,
      document,
    ]),
});

export const reference = <Output = SanityReference>(
  def: ReferenceDef<Output> = {}
) => referenceInternal<never, Output>(def, []);
