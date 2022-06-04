import { z } from "zod";

import { fieldsSchema, fieldsZod } from "../fields";

import type { FieldOptions, InferOptional, InferType } from "../fields";
import type { InferZod, SanityType } from "../types";
import type { DocumentDef } from "@sanity/base";

export interface DocumentType<
  DocumentName extends string,
  FieldNames extends string,
  Fields extends {
    [field in FieldNames]: FieldOptions<field, any, any>;
  }
> extends SanityType<
    DocumentDef<DocumentName, never, FieldNames, never, never, never>,
    z.ZodIntersection<
      z.ZodObject<
        {
          [field in FieldNames]: InferOptional<Fields[field]> extends true
            ? z.ZodOptional<InferZod<InferType<Fields[field]>>>
            : InferZod<InferType<Fields[field]>>;
        },
        "strip"
      >,
      z.ZodObject<
        {
          _createdAt: z.ZodType<Date, any, string>;
          _id: z.ZodString;
          _rev: z.ZodString;
          _type: z.ZodLiteral<DocumentName>;
          _updatedAt: z.ZodType<Date, any, string>;
        },
        "strip"
      >
    >
  > {
  field: <
    Name extends string,
    Zod extends z.ZodType<any, any, any>,
    NewFieldNames extends FieldNames | Name,
    Optional extends boolean = false
  >(
    options: FieldOptions<Name, Zod, Optional>
  ) => DocumentType<
    DocumentName,
    NewFieldNames,
    // @ts-expect-error -- Not sure how to solve this
    Fields & {
      [field in Name]: FieldOptions<Name, Zod, Optional>;
    }
  >;
  name: DocumentName;
}

const documentInternal = <
  DocumentName extends string,
  FieldNames extends string,
  Fields extends {
    [field in FieldNames]: FieldOptions<field, any, any>;
  }
>(
  {
    name,
    ...def
  }: Omit<
    DocumentDef<DocumentName, never, FieldNames, never, never, never>,
    "description" | "fields" | "preview" | "type"
  >,
  fields: Array<Fields[FieldNames]>
): DocumentType<DocumentName, FieldNames, Fields> => {
  const zod = z.intersection(
    fieldsZod(fields),
    z.object({
      _createdAt: z.string().transform((v) => new Date(v)),
      _id: z.string(),
      _rev: z.string(),
      _type: z.literal(name),
      _updatedAt: z.string().transform((v) => new Date(v)),
    })
  );

  return {
    name,
    zod,
    parse: zod.parse.bind(zod),
    schema: () => ({
      ...def,
      name,
      type: "document",
      fields: fieldsSchema(fields),
    }),
    field: <
      Name extends string,
      Zod extends z.ZodType<any, any, any>,
      NewFieldNames extends FieldNames | Name,
      Optional extends boolean = false
    >(
      options: FieldOptions<Name, Zod, Optional>
    ) =>
      documentInternal<
        DocumentName,
        NewFieldNames,
        // @ts-expect-error -- Not sure how to solve this
        Fields & {
          [field in Name]: FieldOptions<Name, Zod, Optional>;
        }
      >({ name, ...def }, [...fields, options]),
  };
};

export const document = <DocumentName extends string>(
  def: Omit<
    DocumentDef<DocumentName, never, never, never, never, never>,
    "description" | "fields" | "preview" | "type"
  >
) => documentInternal<DocumentName, never, Record<never, never>>(def, []);
