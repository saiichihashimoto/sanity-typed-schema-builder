import { z } from "zod";

import { createType } from "../types";

import type { FieldsType, InferFieldsZod } from "../field";
import type { EmptyObject, TypeValidation } from "../types";
import type { Faker } from "@faker-js/faker";
import type { Schema } from "@sanity/types";

type ZodImage<
  Hotspot extends boolean,
  Fields extends FieldsType<any, any>
> = InferFieldsZod<Fields> extends z.ZodObject<infer T, any, any, any, any>
  ? z.ZodObject<
      z.extendShape<
        T,
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
            }
      >
    >
  : never;

export const image = <
  Hotspot extends boolean = false,
  Fields extends FieldsType<any, any> = FieldsType<never, EmptyObject>
>(
  def: Omit<
    TypeValidation<Schema.ImageDefinition, z.input<ZodImage<Hotspot, Fields>>>,
    // "title" and "description" actually show up in the UI
    "fields" | "name" | "preview" | "type"
  > & {
    fields?: Fields;
    hotspot?: Hotspot;
    mock?: (faker: Faker, path: string) => z.input<ZodImage<Hotspot, Fields>>;
  } = {}
) => {
  const {
    hotspot,
    fields: {
      schema: fieldsSchema = () => undefined,
      mock: fieldsMock = () =>
        undefined as unknown as z.input<InferFieldsZod<Fields>>,
      zod: fieldsZod = z.object({}),
    } = {},
    mock = (faker, path) =>
      ({
        ...fieldsMock(path),
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
      } as unknown as z.input<ZodImage<Hotspot, Fields>>),
  } = def;

  return createType({
    mock,
    zod: (fieldsZod as InferFieldsZod<Fields>).extend(
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
    ) as unknown as ZodImage<Hotspot, Fields>,
    schema: () => ({
      ...def,
      type: "image",
      fields: fieldsSchema(),
    }),
  });
};
