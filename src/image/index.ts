import { z } from "zod";

import { fieldsMock, fieldsSchema, fieldsZodObject } from "../field";
import { createType } from "../types";

import type { FieldOptions, FieldsZodObject } from "../field";
import type { TypeValidation } from "../types";
import type { Faker } from "@faker-js/faker";
import type { Schema } from "@sanity/types";

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
        _ref: faker.datatype.uuid(),
      },
      ...(!hotspot
        ? {}
        : {
            crop: {
              top: faker.datatype.number({
                min: 0,
                max: 1,
                precision: 1 / 10 ** 15,
              }),
              bottom: faker.datatype.number({
                min: 0,
                max: 1,
                precision: 1 / 10 ** 15,
              }),
              left: faker.datatype.number({
                min: 0,
                max: 1,
                precision: 1 / 10 ** 15,
              }),
              right: faker.datatype.number({
                min: 0,
                max: 1,
                precision: 1 / 10 ** 15,
              }),
            },
            hotspot: {
              x: faker.datatype.number({
                min: 0,
                max: 1,
                precision: 1 / 10 ** 15,
              }),
              y: faker.datatype.number({
                min: 0,
                max: 1,
                precision: 1 / 10 ** 15,
              }),
              height: faker.datatype.number({
                min: 0,
                max: 1,
                precision: 1 / 10 ** 15,
              }),
              width: faker.datatype.number({
                min: 0,
                max: 1,
                precision: 1 / 10 ** 15,
              }),
            },
          }),
    } as unknown as z.input<Zod>),
  zod: zodFn = (zod) => zod as unknown as z.ZodType<Output, any, z.input<Zod>>,
  ...def
}: Omit<
  TypeValidation<Schema.ImageDefinition, z.input<Zod>>,
  // "title" and "description" actually show up in the UI
  "fields" | "name" | "preview" | "type"
> & {
  fields?: FieldsArray;
  hotspot?: Hotspot;
  mock?: (faker: Faker, path: string) => z.input<Zod>;
  zod?: (zod: Zod) => z.ZodType<Output, any, z.input<Zod>>;
} = {}) =>
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
