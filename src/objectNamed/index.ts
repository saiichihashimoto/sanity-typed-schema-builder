import { z } from "zod";

import { fieldsMock, fieldsSchema, fieldsZodObject } from "../field";
import { createType } from "../types";

import type { FieldOptions, FieldsZodObject, Preview } from "../field";
import type { TypeValidation } from "../types";
import type { Faker } from "@faker-js/faker";
import type { Schema } from "@sanity/types";

export const objectNamed = <
  ObjectNames extends string,
  Names extends string,
  Zods extends z.ZodType<any, any, any>,
  Optionals extends boolean,
  FieldsArray extends Array<FieldOptions<Names, Zods, Optionals>>,
  Zod extends z.ZodObject<
    FieldsZodObject<FieldsArray> & {
      _type: z.ZodLiteral<ObjectNames>;
    }
  >,
  Output = z.output<Zod>,
  // eslint-disable-next-line @typescript-eslint/ban-types -- All other values assume keys
  Select extends Record<string, string> = {}
>({
  name,
  fields,
  preview: previewDef,
  mock = (faker, path) =>
    ({
      ...fieldsMock(fields)(faker, `${path}.${name}`),
      _type: name,
    } as unknown as z.input<Zod>),
  zod: zodFn = (zod) => zod as unknown as z.ZodType<Output, any, z.input<Zod>>,
  ...def
}: Omit<
  TypeValidation<Schema.ObjectDefinition, z.input<Zod>>,
  "fields" | "name" | "preview" | "type"
> & {
  fields: FieldsArray;
  mock?: (faker: Faker, path: string) => z.input<Zod>;
  name: ObjectNames;
  preview?: Preview<z.input<Zod>, Select>;
  zod?: (zod: Zod) => z.ZodType<Output, any, z.input<Zod>>;
}) => {
  const zod = zodFn(
    z.object({
      ...fieldsZodObject(fields),
      _type: z.literal(name),
    }) as unknown as Zod
  );

  return {
    ...createType({
      mock,
      zod,
      schema: () => ({
        ...def,
        ...fieldsSchema(fields, previewDef),
        name,
        type: "object",
      }),
    }),
    ref: () =>
      createType({
        mock,
        zod,
        schema: () => ({ type: name }),
      }),
  };
};
