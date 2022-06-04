import { z } from "zod";

import { fieldsSchema, fieldsZod } from "../fields";

import type { FieldOptions, InferOptional, InferType } from "../fields";
import type { InferZod, SanityType } from "../types";

interface ImageType<
  FieldNames extends string,
  Fields extends {
    [field in FieldNames]: FieldOptions<field, any, any>;
  },
  Hotspot extends boolean
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
        Hotspot extends false
          ? {
              _type: z.ZodLiteral<"image">;
              asset: z.ZodObject<{
                _ref: z.ZodString;
                _type: z.ZodLiteral<"reference">;
              }>;
            }
          : {
              _type: z.ZodLiteral<"image">;
              asset: z.ZodObject<{
                _ref: z.ZodString;
                _type: z.ZodLiteral<"reference">;
              }>;
              crop: z.ZodObject<{
                bottom: z.ZodNumber;
                left: z.ZodNumber;
                right: z.ZodNumber;
                top: z.ZodNumber;
              }>;
              hotspot: z.ZodObject<{
                height: z.ZodNumber;
                width: z.ZodNumber;
                x: z.ZodNumber;
                y: z.ZodNumber;
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
    },
    Hotspot
  >;
}

type ImageDef<FieldNames extends string, Hotspot extends boolean> = Omit<
  ImageFieldDef<never, never, FieldNames>,
  "description" | "fields" | "preview" | "type"
> & {
  hotspot?: Hotspot;
};

const imageInternal = <
  FieldNames extends string,
  Fields extends {
    [field in FieldNames]: FieldOptions<field, any, any>;
  },
  Hotspot extends boolean
>(
  def: ImageDef<FieldNames, Hotspot>,
  fields: Array<Fields[FieldNames]>
): ImageType<FieldNames, Fields, Hotspot> => {
  const { hotspot } = def;

  const zod = z.intersection(
    fieldsZod(fields),
    z.object(
      !hotspot
        ? {
            _type: z.literal("image"),
            asset: z.object({
              _ref: z.string(),
              _type: z.literal("reference"),
            }),
          }
        : {
            _type: z.literal("image"),
            asset: z.object({
              _ref: z.string(),
              _type: z.literal("reference"),
            }),
            crop: z.object({
              bottom: z.number(),
              left: z.number(),
              right: z.number(),
              top: z.number(),
            }),
            hotspot: z.object({
              height: z.number(),
              width: z.number(),
              x: z.number(),
              y: z.number(),
            }),
          }
    ) as z.ZodObject<
      Hotspot extends false
        ? {
            _type: z.ZodLiteral<"image">;
            asset: z.ZodObject<{
              _ref: z.ZodString;
              _type: z.ZodLiteral<"reference">;
            }>;
          }
        : {
            _type: z.ZodLiteral<"image">;
            asset: z.ZodObject<{
              _ref: z.ZodString;
              _type: z.ZodLiteral<"reference">;
            }>;
            crop: z.ZodObject<{
              bottom: z.ZodNumber;
              left: z.ZodNumber;
              right: z.ZodNumber;
              top: z.ZodNumber;
            }>;
            hotspot: z.ZodObject<{
              height: z.ZodNumber;
              width: z.ZodNumber;
              x: z.ZodNumber;
              y: z.ZodNumber;
            }>;
          },
      "strip"
    >
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
        },
        Hotspot
      >(def, [...fields, options]),
  };
};

export const image = <Hotspot extends boolean = false>(
  def: ImageDef<never, Hotspot> = {}
) => imageInternal<never, Record<never, never>, Hotspot>(def, []);
