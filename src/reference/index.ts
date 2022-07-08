import { z } from "zod";

import { createType } from "../types";

import type { DocumentType } from "../document";
import type { SanityTypeDef } from "../types";
import type { Reference, Schema } from "@sanity/types";
import type { Merge } from "type-fest";

export type SanityReference = Merge<
  Reference,
  {
    _type: "reference";
  }
>;

export const reference = <
  DocumentName extends string,
  DocumentTypes extends [
    DocumentType<DocumentName, any, any>,
    ...Array<DocumentType<DocumentName, any, any>>
  ],
  ParsedValue = SanityReference
>({
  to: documents,
  mock = (faker) => ({
    _ref: faker.datatype.uuid(),
    _type: "reference",
  }),
  zod: zodFn = (zod) =>
    zod as unknown as z.ZodType<ParsedValue, any, SanityReference>,
  ...def
}: Merge<
  SanityTypeDef<Schema.ReferenceDefinition, SanityReference, ParsedValue>,
  {
    to: DocumentTypes;
  }
>) =>
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
