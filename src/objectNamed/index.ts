import { z } from "zod";

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

type ZodObjectNamed<
  ObjectNames extends string,
  Fields extends FieldsType<any, any>
> = z.ZodIntersection<
  InferFieldsZod<Fields>,
  z.ZodObject<{
    _type: z.ZodLiteral<ObjectNames>;
  }>
>;

interface ObjectNamedType<
  ObjectNames extends string,
  Fields extends FieldsType<any, any>
> extends SanityType<
    TypeValidation<
      Schema.ObjectDefinition,
      z.input<ZodObjectNamed<ObjectNames, Fields>>
    > & { name: ObjectNames },
    ZodObjectNamed<ObjectNames, Fields>
  > {
  ref: () => SanityType<
    Omit<Schema.TypeReference<any>, FieldOptionKeys> & { type: ObjectNames },
    ZodObjectNamed<ObjectNames, Fields>
  >;
}

export const objectNamed = <
  ObjectNames extends string,
  Fields extends FieldsType<any, any>,
  // eslint-disable-next-line @typescript-eslint/ban-types -- All other values assume keys
  Select extends Record<string, string> = {}
>(
  def: Omit<
    TypeValidation<
      Schema.ObjectDefinition,
      z.input<ZodObjectNamed<ObjectNames, Fields>>
    >,
    "fields" | "name" | "preview" | "type"
  > & {
    fields: Fields;
    mock?: (faker: Faker) => z.input<ZodObjectNamed<ObjectNames, Fields>>;
    name: ObjectNames;
    preview?: Preview<z.input<ZodObjectNamed<ObjectNames, Fields>>, Select>;
  }
): ObjectNamedType<ObjectNames, Fields> => {
  const {
    name,
    preview: previewDef,
    fields: { schema: fieldsSchema, mock: fieldsMock, zod: fieldsZod },
    mock = (faker) => ({
      ...(fieldsMock(faker) as z.input<InferFieldsZod<Fields>>),
      _type: name,
    }),
  } = def;

  const zod = z.intersection(
    fieldsZod as InferFieldsZod<Fields>,
    z.object({
      _type: z.literal(name),
    })
  ) as unknown as ZodObjectNamed<ObjectNames, Fields>;

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
        preview: preview<z.input<ZodObjectNamed<ObjectNames, Fields>>, Select>(
          previewDef,
          schemaForFields
        ),
      };
    },
    ref: () => ({
      mock,
      zod,
      parse: zod.parse.bind(zod),
      schema: () => ({ type: name }),
    }),
  };
};
