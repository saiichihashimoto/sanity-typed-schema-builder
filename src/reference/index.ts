import { z } from "zod";

import type { DocumentType } from "../document";
import type { SanityType } from "../types";
import type { Reference } from "@sanity/types";

interface ReferenceType<DocumentName extends string>
  extends SanityType<ReferenceFieldDef<DocumentName>, Reference> {
  to: <Name extends string>(
    document: DocumentType<Name, any, any>
  ) => ReferenceType<DocumentName | Name>;
}

const referenceInternal = <DocumentName extends string>(
  def: Omit<ReferenceFieldDef<string>, "description" | "to" | "type">,
  documents: Array<DocumentType<DocumentName, any, any>>
): ReferenceType<DocumentName> => {
  const zod = z.object({
    _ref: z.string(),
    _type: z.literal("reference"),
    weak: z.boolean().optional(),
  });

  return {
    zod,
    parse: zod.parse.bind(zod),
    schema: () => ({
      ...def,
      type: "reference",
      to: documents.map(({ name }) => ({ type: name })),
    }),
    to: <Name extends string>(document: DocumentType<Name, any, any>) =>
      referenceInternal<DocumentName | Name>(def, [...documents, document]),
  };
};

export const reference = (
  def: Omit<ReferenceFieldDef<string>, "description" | "to" | "type"> = {}
): ReferenceType<never> => referenceInternal(def, []);
