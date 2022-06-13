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
  Select extends Record<string, string> = {}
>({
  preview: previewDef,
  fields: { mock: fieldsMock, schema: fieldsSchema, zod: fieldsZod },
  mock = (faker, path) => fieldsMock(path),
  ...def
}: Omit<
  TypeValidation<Schema.ObjectDefinition, z.input<InferFieldsZod<Fields>>>,
  FieldOptionKeys | "fields" | "preview" | "type"
> & {
  fields: Fields;
  mock?: (faker: Faker, path: string) => z.input<InferFieldsZod<Fields>>;
  preview?: Preview<z.input<InferFieldsZod<Fields>>, Select>;
}) => {
  const zod = fieldsZod as InferFieldsZod<Fields>;

  return createType({
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
  });
};
