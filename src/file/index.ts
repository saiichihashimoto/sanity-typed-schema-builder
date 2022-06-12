import { z } from "zod";

import { createType } from "../types";

import type { FieldOptionKeys, FieldsType, InferFieldsZod } from "../field";
import type { EmptyObject, SanityType, TypeValidation } from "../types";
import type { Faker } from "@faker-js/faker";
import type { Schema } from "@sanity/types";

type ZodFile<Fields extends FieldsType<any, any>> = z.ZodIntersection<
  InferFieldsZod<Fields>,
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
>;

export const file = <
  Fields extends FieldsType<any, any> = FieldsType<never, EmptyObject>
>(
  def: Omit<
    TypeValidation<Schema.FileDefinition, z.input<ZodFile<Fields>>>,
    FieldOptionKeys | "fields" | "preview" | "type"
  > & {
    fields?: Fields;
    mock?: (faker: Faker, path: string) => z.input<ZodFile<Fields>>;
  } = {}
): SanityType<
  Omit<
    TypeValidation<Schema.FileDefinition, z.input<ZodFile<Fields>>>,
    FieldOptionKeys
  >,
  ZodFile<Fields>
> => {
  const {
    fields: {
      schema: fieldsSchema = () => undefined,
      mock: fieldsMock = () =>
        undefined as unknown as z.input<InferFieldsZod<Fields>>,
      zod: fieldsZod = z.object({}),
    } = {},
    mock = (faker, path) => ({
      ...fieldsMock(path),
      _type: "file",
      asset: {
        _type: "reference",
        _ref: faker.datatype.uuid(),
      },
    }),
  } = def;

  return createType({
    mock,
    zod: z.intersection(
      fieldsZod as InferFieldsZod<Fields>,
      z.object({
        _type: z.literal("file"),
        asset: z.object({
          _ref: z.string(),
          _type: z.literal("reference"),
        }),
      })
    ) as unknown as ZodFile<Fields>,
    schema: () => ({
      ...def,
      type: "file",
      fields: fieldsSchema(),
    }),
  });
};
