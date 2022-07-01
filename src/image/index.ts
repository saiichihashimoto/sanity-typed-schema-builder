import { z } from "zod";

import { fieldsMock, fieldsSchema, fieldsZodObject } from "../field";
import { createType } from "../types";

import type { FieldOptions, FieldsZodObject } from "../field";
import type { SanityNamedTypeDef } from "../types";
import type { Faker } from "@faker-js/faker";
import type { Schema } from "@sanity/types";
import type { Merge } from "type-fest";

const zeroToOne = (faker: Faker) =>
  faker.datatype.number({
    min: 0,
    max: 1,
    precision: 1 / 10 ** 15,
  });

export const image = <
  Names extends string,
  Zods extends z.ZodType<any, any, any>,
  Optionals extends boolean,
  Zod extends z.ZodObject<
    // eslint-disable-next-line no-use-before-define -- Zod can't be optional, but FieldsArray has to be
    FieldsZodObject<FieldsArray> &
      // eslint-disable-next-line no-use-before-define -- Zod can't be optional, but Hotspot has to be
      (Hotspot extends false
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
          })
  >,
  FieldsArray extends Array<FieldOptions<Names, Zods, Optionals>> = never[],
  Hotspot extends boolean = false,
  Output = z.output<Zod>
>({
  hotspot,
  fields = [] as unknown as FieldsArray,
  mock = (faker, path) =>
    ({
      ...fieldsMock(fields)(faker, path),
      _type: "image",
      asset: {
        _type: "reference",
        _ref: `image-${faker.random.alphaNumeric(24)}-${faker.datatype.number({
          min: 900,
          max: 3000,
        })}x${faker.datatype.number({
          min: 900,
          max: 3000,
        })}-${faker.helpers.arrayElement([
          "bmp",
          "gif",
          "jpeg",
          "jpg",
          "png",
          "svg",
          "tif",
          "tiff",
        ])}`,
      },
      ...(!hotspot
        ? {}
        : {
            crop: {
              top: zeroToOne(faker),
              bottom: zeroToOne(faker),
              left: zeroToOne(faker),
              right: zeroToOne(faker),
            },
            hotspot: {
              x: zeroToOne(faker),
              y: zeroToOne(faker),
              height: zeroToOne(faker),
              width: zeroToOne(faker),
            },
          }),
    } as unknown as z.input<Zod>),
  zod: zodFn = (zod) => zod as unknown as z.ZodType<Output, any, z.input<Zod>>,
  ...def
}: Merge<
  Omit<
    SanityNamedTypeDef<Schema.ImageDefinition, Zod, Output>,
    // "title" and "description" actually show up in the UI
    "name" | "preview"
  >,
  {
    fields?: FieldsArray;
    hotspot?: Hotspot;
  }
> = {}) =>
  createType({
    mock,
    zod: zodFn(
      z.object({
        ...fieldsZodObject(fields),
        _type: z.literal("image"),
        asset: z.object({
          _ref: z.string(),
          _type: z.literal("reference"),
        }),
        ...(!hotspot
          ? {}
          : {
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
            }),
      }) as unknown as Zod
    ),
    schema: () => ({
      ...def,
      ...(fields.length && fieldsSchema(fields)),
      type: "image",
    }),
  });
