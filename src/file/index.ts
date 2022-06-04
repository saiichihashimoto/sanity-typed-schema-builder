import { z } from "zod";

import { fieldsSchema, fieldsZod } from "../fields";

import type { FieldOptions, InferOptional, InferType } from "../fields";
import type { InferZod, SanityType } from "../types";

interface FileType<
  FieldNames extends string,
  Fields extends {
    [field in FieldNames]: FieldOptions<field, any, any>;
  }
> extends SanityType<
    FileFieldDef<never, never, FieldNames>,
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
          _type: z.ZodLiteral<"file">;
          asset: z.ZodObject<{
            _ref: z.ZodString;
            _type: z.ZodLiteral<"reference">;
          }>;
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
  ) => FileType<
    NewFieldNames,
    // @ts-expect-error -- Not sure how to solve this
    Fields & {
      [field in Name]: FieldOptions<Name, Zod, Optional>;
    }
  >;
}

const fileInternal = <
  FieldNames extends string,
  Fields extends {
    [field in FieldNames]: FieldOptions<field, any, any>;
  }
>(
  def: Omit<
    FileFieldDef<never, never, FieldNames>,
    "description" | "fields" | "preview" | "type"
  >,
  fields: Array<Fields[FieldNames]>
): FileType<FieldNames, Fields> => {
  const zod = z.intersection(
    fieldsZod(fields),
    z.object({
      _type: z.literal("file"),
      asset: z.object({
        _ref: z.string(),
        _type: z.literal("reference"),
      }),
    })
  );

  return {
    zod,
    parse: zod.parse.bind(zod),
    schema: () => ({
      ...def,
      type: "file",
      fields: !fields.length ? undefined : fieldsSchema(fields),
    }),
    field: <
      Name extends string,
      Zod extends z.ZodType<any, any, any>,
      NewFieldNames extends FieldNames | Name,
      Optional extends boolean = false
    >(
      options: FieldOptions<Name, Zod, Optional>
    ) =>
      fileInternal<
        NewFieldNames,
        // @ts-expect-error -- Not sure how to solve this
        Fields & {
          [field in Name]: FieldOptions<Name, Zod, Optional>;
        }
      >(def, [...fields, options]),
  };
};

export const file = (
  def: Omit<
    FileFieldDef<never, never, never>,
    "description" | "fields" | "preview" | "type"
  > = {}
) => fileInternal<never, Record<never, never>>(def, []);
