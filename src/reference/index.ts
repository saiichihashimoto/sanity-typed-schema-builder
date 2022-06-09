import { z } from "zod";

import type { DocumentType } from "../document";
import type { FieldOptionKeys } from "../fields";
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
  mock?: (faker: Faker) => SanityReference;
};

const referenceInternal = <DocumentName extends string>(
  def: ReferenceDef,
  documents: Array<DocumentType<DocumentName, any>>
): ReferenceType<DocumentName> => {
  const {
    mock = (faker) => ({
      _ref: faker.datatype.uuid(),
      _type: "reference",
    }),
  } = def;

  const zod = z.object({
    _ref: z.string(),
    _type: z.literal("reference"),
    _weak: z.boolean().optional(),
  });

  return {
    mock,
    zod,
    parse: zod.parse.bind(zod),
    schema: () => ({
      ...def,
      type: "reference",
      to: documents.map(({ name }) => ({ type: name })),
    }),
    to: <Name extends string>(document: DocumentType<Name, any>) =>
      // @ts-expect-error -- Not sure how to solve this
      referenceInternal<DocumentName | Name>(def, [...documents, document]),
  };
};

export const reference = (def: ReferenceDef = {}): ReferenceType<never> =>
  referenceInternal(def, []);
