import { preview } from "../fields";

import type {
  FieldOptionKeys,
  FieldsType,
  InferFieldsZod,
  Preview,
} from "../fields";
import type { SanityType, TypeValidation } from "../types";
import type { Faker } from "@faker-js/faker";
import type { Schema } from "@sanity/types";
import type { z } from "zod";

export const object = <
  Fields extends FieldsType<any, any>,
  // eslint-disable-next-line @typescript-eslint/ban-types -- All other values assume keys
  Select extends Record<string, string> = {}
>({
  preview: previewDef,
  fields: { mock: fieldsMock, schema: fieldsSchema, zod: fieldsZod },
  mock = fieldsMock,
  ...def
}: Omit<
  TypeValidation<Schema.ObjectDefinition, z.input<InferFieldsZod<Fields>>>,
  FieldOptionKeys | "fields" | "preview" | "type"
> & {
  fields: Fields;
  mock?: (faker: Faker) => z.input<InferFieldsZod<Fields>>;
  preview?: Preview<z.input<InferFieldsZod<Fields>>, Select>;
}): SanityType<
  Omit<
    TypeValidation<Schema.ObjectDefinition, z.input<InferFieldsZod<Fields>>>,
    FieldOptionKeys
  >,
  InferFieldsZod<Fields>
> => {
  const zod = fieldsZod as InferFieldsZod<Fields>;

  return {
    mock,
    zod,
    parse: zod.parse.bind(zod),
    schema: () => {
      const schemaForFields = fieldsSchema();

      return {
        ...def,
        type: "object",
        fields: schemaForFields,
        preview: preview(previewDef, schemaForFields),
      };
    },
  };
};
