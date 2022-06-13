import { preview } from "../field";
import { createType } from "../types";

import type {
  FieldOptionKeys,
  FieldsType,
  InferFieldsZod,
  Preview,
} from "../field";
import type { TypeValidation } from "../types";
import type { Faker } from "@faker-js/faker";
import type { Schema } from "@sanity/types";
import type { z } from "zod";

export const object = <
  Fields extends FieldsType<any, any>,
  // eslint-disable-next-line @typescript-eslint/ban-types -- All other values assume keys
  Select extends Record<string, string> = {},
  Output = z.output<InferFieldsZod<Fields>>
>({
  preview: previewDef,
  fields: { mock: fieldsMock, schema: fieldsSchema, zod: fieldsZod },
  mock = (faker, path) => fieldsMock(path),
  zod: zodFn = (zod) =>
    zod as unknown as z.ZodType<Output, any, z.input<InferFieldsZod<Fields>>>,
  ...def
}: Omit<
  TypeValidation<Schema.ObjectDefinition, z.input<InferFieldsZod<Fields>>>,
  FieldOptionKeys | "fields" | "preview" | "type"
> & {
  fields: Fields;
  mock?: (faker: Faker, path: string) => z.input<InferFieldsZod<Fields>>;
  preview?: Preview<z.input<InferFieldsZod<Fields>>, Select>;
  zod?: (
    zod: z.ZodType<
      z.input<InferFieldsZod<Fields>>,
      any,
      z.input<InferFieldsZod<Fields>>
    >
  ) => z.ZodType<Output, any, z.input<InferFieldsZod<Fields>>>;
}) =>
  createType({
    mock,
    zod: zodFn(fieldsZod as InferFieldsZod<Fields>),
    schema: () => {
      const schemaForFields = fieldsSchema();

      return {
        ...def,
        type: "object",
        fields: schemaForFields,
        preview: preview(previewDef, schemaForFields),
      };
    },
  });
