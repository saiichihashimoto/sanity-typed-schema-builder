import { faker } from "@faker-js/faker";
import { z } from "zod";

import type { FieldsType, InferFieldNames, InferFieldsZod } from "../fields";
import type { SanityType } from "../types";
import type { Faker } from "@faker-js/faker";

type ZodImage<
  Hotspot extends boolean,
  Fields extends FieldsType<any, any>
> = z.ZodIntersection<
  InferFieldsZod<Fields>,
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
>;

interface ImageType<
  Hotspot extends boolean,
  Fields extends FieldsType<any, any>
> extends SanityType<
    ImageFieldDef<never, never, InferFieldNames<Fields>>,
    ZodImage<Hotspot, Fields>
  > {}

export const image = <
  Hotspot extends boolean = false,
  Fields extends FieldsType<any, any> = FieldsType<never, Record<never, never>>
>(
  def: Omit<
    ImageFieldDef<never, never, InferFieldNames<Fields>>,
    "description" | "fields" | "preview" | "type"
  > & {
    fields?: Fields;
    hotspot?: Hotspot;
    mock?: (faker: Faker) => z.input<ZodImage<Hotspot, Fields>>;
  } = {}
): ImageType<Hotspot, Fields> => {
  const {
    hotspot,
    fields: {
      schema: fieldsSchema = () => undefined,
      mock: fieldsMock = () =>
        ({} as unknown as z.input<InferFieldsZod<Fields>>),
      zod: fieldsZod = z.object({}),
    } = {},
    mock = () =>
      ({
        ...fieldsMock(),
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

  const zod = z.intersection(
    fieldsZod as InferFieldsZod<Fields>,
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
    )
  ) as unknown as ZodImage<Hotspot, Fields>;

  return {
    zod,
    parse: zod.parse.bind(zod),
    mock: () => mock(faker),
    schema: () => ({
      ...def,
      type: "image",
      fields: fieldsSchema(),
    }),
  };
};
