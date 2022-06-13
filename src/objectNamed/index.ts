import { z } from "zod";

import { preview } from "../field";
import { createType } from "../types";

import type { FieldsType, InferFieldsZod, Preview } from "../field";
import type { TypeValidation } from "../types";
import type { Faker } from "@faker-js/faker";
import type { Schema } from "@sanity/types";

type ZodObjectNamed<
  ObjectNames extends string,
  Fields extends FieldsType<any, any>
> = InferFieldsZod<Fields> extends z.ZodObject<infer T, any, any, any, any>
  ? z.ZodObject<z.extendShape<T, { _type: z.ZodLiteral<ObjectNames> }>>
  : never;

export const objectNamed = <
  ObjectNames extends string,
  Fields extends FieldsType<any, any>,
  // eslint-disable-next-line @typescript-eslint/ban-types -- All other values assume keys
  Select extends Record<string, string> = {},
  Output = z.output<ZodObjectNamed<ObjectNames, Fields>>
>({
  name,
  preview: previewDef,
  fields: { schema: fieldsSchema, mock: fieldsMock, zod: fieldsZod },
  mock = (faker, path) => ({
    ...(fieldsMock(path) as z.input<InferFieldsZod<Fields>>),
    _type: name,
  }),
  zod: zodFn = (zod) =>
    zod as unknown as z.ZodType<
      Output,
      any,
      z.input<ZodObjectNamed<ObjectNames, Fields>>
    >,
  ...def
}: Omit<
  TypeValidation<
    Schema.ObjectDefinition,
    z.input<ZodObjectNamed<ObjectNames, Fields>>
  >,
  "fields" | "name" | "preview" | "type"
> & {
  fields: Fields;
  mock?: (
    faker: Faker,
    path: string
  ) => z.input<ZodObjectNamed<ObjectNames, Fields>>;
  name: ObjectNames;
  preview?: Preview<z.input<ZodObjectNamed<ObjectNames, Fields>>, Select>;
  zod?: (
    zod: z.ZodType<
      z.input<ZodObjectNamed<ObjectNames, Fields>>,
      any,
      z.input<ZodObjectNamed<ObjectNames, Fields>>
    >
  ) => z.ZodType<Output, any, z.input<ZodObjectNamed<ObjectNames, Fields>>>;
}) => {
  const zod = zodFn(
    (fieldsZod as InferFieldsZod<Fields>).extend({
      _type: z.literal(name),
    }) as unknown as ZodObjectNamed<ObjectNames, Fields>
  );

  return {
    ...createType({
      mock,
      zod,
      schema: () => {
        const schemaForFields = fieldsSchema();

        return {
          ...def,
          name,
          type: "object",
          fields: schemaForFields,
          preview: preview(previewDef, schemaForFields),
        };
      },
    }),
    ref: () =>
      createType({
        mock,
        zod,
        schema: () => ({ type: name }),
      }),
  };
};
