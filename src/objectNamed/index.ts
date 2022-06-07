import { faker } from "@faker-js/faker";
import { z } from "zod";

import { preview } from "../fields";

import type {
  FieldsType,
  InferFieldNames,
  InferFieldsZod,
  Preview,
} from "../fields";
import type { SanityType } from "../types";
import type { Faker } from "@faker-js/faker";
import type { ObjectDef } from "@sanity/base";

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
    ObjectDef<ObjectNames, any, InferFieldNames<Fields>, any>,
    ZodObjectNamed<ObjectNames, Fields>
  > {
  ref: () => SanityType<
    FieldDef<any, any> & { type: ObjectNames },
    z.ZodObject<{ _type: z.ZodLiteral<ObjectNames> }>
  >;
}

export const objectNamed = <
  ObjectNames extends string,
  Fields extends FieldsType<any, any>
>(
  def: Omit<
    ObjectDef<ObjectNames, any, InferFieldNames<Fields>, any>,
    "description" | "fields" | "preview" | "type"
  > & {
    fields: Fields;
    mock?: (faker: Faker) => z.input<ZodObjectNamed<ObjectNames, Fields>>;
    preview?: Preview<z.input<ZodObjectNamed<ObjectNames, Fields>>>;
  }
): ObjectNamedType<ObjectNames, Fields> => {
  const {
    name,
    preview: previewDef,
    fields: { schema: fieldsSchema, mock: fieldsMock, zod: fieldsZod },
    mock = () => ({
      ...(fieldsMock() as z.input<InferFieldsZod<Fields>>),
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
    zod,
    parse: zod.parse.bind(zod),
    mock: () => mock(faker),
    schema: () => {
      const schemaForFields = fieldsSchema();

      return {
        ...def,
        type: "object",
        fields: schemaForFields,
        preview: preview(previewDef, schemaForFields),
      };
    },
    ref: () => {
      const zod = z.object({ _type: z.literal(name) });

      return {
        zod,
        parse: zod.parse.bind(zod),
        mock: () => ({ _type: name }),
        schema: () => ({ type: name }),
      };
    },
  };
};
