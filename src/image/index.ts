import { z } from "zod";

import { fieldsSchema, fieldsZod } from "../fields";

import type { FieldOptions, InferOptional, InferType } from "../fields";
import type { InferZod, SanityType } from "../types";

interface ImageType<
  FieldNames extends string,
  Fields extends {
    [field in FieldNames]: FieldOptions<field, any, any>;
  }
> extends SanityType<
    ImageFieldDef<never, never, FieldNames>,
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
          _type: z.ZodLiteral<"image">;
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
  ) => ImageType<
    NewFieldNames,
    // @ts-expect-error -- Not sure how to solve this
    Fields & {
      [field in Name]: FieldOptions<Name, Zod, Optional>;
    }
  >;
}

const imageInternal = <
  FieldNames extends string,
  Fields extends {
    [field in FieldNames]: FieldOptions<field, any, any>;
  }
>(
  def: Omit<
    ImageFieldDef<never, never, FieldNames>,
    "description" | "fields" | "preview" | "type"
  >,
  fields: Array<Fields[FieldNames]>
): ImageType<FieldNames, Fields> => {
  const zod = z.intersection(
    fieldsZod(fields),
    z.object({
      _type: z.literal("image"),
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
      type: "image",
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
      imageInternal<
        NewFieldNames,
        // @ts-expect-error -- Not sure how to solve this
        Fields & {
          [field in Name]: FieldOptions<Name, Zod, Optional>;
        }
      >(def, [...fields, options]),
  };
};

export const image = (
  def: Omit<
    ImageFieldDef<never, never, never>,
    "description" | "fields" | "preview" | "type"
  > = {}
) => imageInternal<never, Record<never, never>>(def, []);
