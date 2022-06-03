import { fromPairs } from "lodash/fp";
import { z } from "zod";

import { fieldsSchema } from "../fields";

import type {
  FieldOptions,
  InferName,
  InferOptional,
  InferZod,
} from "../fields";
import type {
  InferInput,
  InferOutput,
  SanityType,
  UndefinedAsOptional,
} from "../types";
import type { DocumentDef } from "@sanity/base";
import type { SanityDocument } from "@sanity/types";
import type { ZodType } from "zod";

interface DocumentType<
  DocumentName extends string,
  FieldNames extends string,
  Fields extends {
    [field in FieldNames]: FieldOptions<field, any, any, any>;
  }
> extends SanityType<
    DocumentDef<DocumentName, never, FieldNames, never, never, never>,
    UndefinedAsOptional<
      {
        [field in keyof Fields]: InferOptional<Fields[field]> extends true
          ? InferInput<Fields[field]["type"]> | undefined
          : InferInput<Fields[field]["type"]>;
      } & Pick<SanityDocument, "_createdAt" | "_id" | "_rev" | "_updatedAt"> & {
          _type: DocumentName;
        }
    >,
    UndefinedAsOptional<
      {
        [field in keyof Fields]: InferOptional<Fields[field]> extends true
          ? InferOutput<Fields[field]["type"]> | undefined
          : InferOutput<Fields[field]["type"]>;
      } & Pick<SanityDocument, "_id" | "_rev"> & {
          _createdAt: Date;
          _type: DocumentName;
          _updatedAt: Date;
        }
    >
  > {
  field: <
    Name extends string,
    Input,
    Output,
    NewFieldNames extends FieldNames | Name,
    Optional extends boolean = false
  >(
    options: FieldOptions<Name, Input, Output, Optional>
  ) => DocumentType<
    DocumentName,
    NewFieldNames,
    // @ts-expect-error -- Not sure how to solve this
    Fields & {
      [field in Name]: FieldOptions<field, Input, Output, Optional>;
    }
  >;
}

const documentInternal = <
  DocumentName extends string,
  FieldNames extends string,
  Fields extends {
    [field in FieldNames]: FieldOptions<field, any, any, any>;
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
  type Tuple = {
    [field in FieldNames]: [
      InferName<Fields[field]>,
      InferOptional<Fields[field]> extends true
        ? z.ZodOptional<InferZod<Fields[field]>>
        : InferZod<Fields[field]>
    ];
  }[FieldNames];

  const tuples = fields.map(
    ({ name, optional, type }) =>
      [name, !optional ? type.zod : type.zod.optional()] as const
  ) as Tuple[];

  type ZodObject = {
    [field in FieldNames as InferName<Fields[field]>]: InferOptional<
      Fields[field]
    > extends true
      ? z.ZodOptional<InferZod<Fields[field]>>
      : InferZod<Fields[field]>;
  };

  const zod = z.object(fromPairs(tuples) as ZodObject).extend({
    _createdAt: z.string().transform((v) => new Date(v)),
    _id: z.string(),
    _rev: z.string(),
    _type: z.literal(name),
    _updatedAt: z.string().transform((v) => new Date(v)),
  }) as unknown as ZodType<
    InferOutput<DocumentType<DocumentName, FieldNames, Fields>>,
    any,
    InferInput<DocumentType<DocumentName, FieldNames, Fields>>
  >;

  return {
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
      Input,
      Output,
      NewFieldNames extends FieldNames | Name,
      Optional extends boolean = false
    >(
      options: FieldOptions<Name, Input, Output, Optional>
    ) =>
      documentInternal<
        DocumentName,
        NewFieldNames,
        // @ts-expect-error -- Not sure how to solve this
        Fields & {
          [field in Name]: FieldOptions<field, Input, Output, Optional>;
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
