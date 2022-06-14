import { z } from "zod";

import { createType } from "../types";

import type { DocumentType } from "../document";
import type { SanityTypeDef } from "../types";
import type { Schema } from "@sanity/types";
import type { Merge } from "type-fest";

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
}: Merge<
  SanityTypeDef<
    Schema.ReferenceDefinition,
    z.ZodType<SanityReference, any, SanityReference>,
    Output
  >,
  {
    to: ReferencesArray;
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
