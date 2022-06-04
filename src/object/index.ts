import { fieldsSchema, fieldsZod } from "../fields";

import type { FieldOptions, InferOptional, InferType } from "../fields";
import type { InferZod, SanityType } from "../types";
import type { z } from "zod";

interface ObjectType<
  FieldNames extends string,
  Fields extends {
    [field in FieldNames]: FieldOptions<field, any, any>;
  }
> extends SanityType<
    ObjectFieldDef<never, never, FieldNames, never, never>,
    z.ZodObject<
      {
        [field in FieldNames]: InferOptional<Fields[field]> extends true
          ? z.ZodOptional<InferZod<InferType<Fields[field]>>>
          : InferZod<InferType<Fields[field]>>;
      },
      "strip"
    >
  > {
  field: <
    Name extends string,
    Zod extends z.ZodType<any, any, any>,
    NewFieldNames extends FieldNames | Name,
    Optional extends boolean = false
  >(
    options: FieldOptions<Name, Zod, Optional>
  ) => ObjectType<
    NewFieldNames,
    // @ts-expect-error -- Not sure how to solve this
    Fields & {
      [field in Name]: FieldOptions<Name, Zod, Optional>;
    }
  >;
}

const objectInternal = <
  FieldNames extends string,
  Fields extends {
    [field in FieldNames]: FieldOptions<field, any, any>;
  }
>(
  def: Omit<
    ObjectFieldDef<never, never, string, never, never>,
    "description" | "fields" | "preview" | "type"
  >,
  fields: Array<Fields[FieldNames]>
): ObjectType<FieldNames, Fields> => {
  const zod = fieldsZod(fields);

  return {
    zod,
    parse: zod.parse.bind(zod),
    schema: () => ({
      ...def,
      type: "object",
      fields: fieldsSchema(fields),
    }),
    field: <
      Name extends string,
      Zod extends z.ZodType<any, any, any>,
      NewFieldNames extends FieldNames | Name,
      Optional extends boolean = false
    >(
      options: FieldOptions<Name, Zod, Optional>
    ) =>
      objectInternal<
        NewFieldNames,
        // @ts-expect-error -- Not sure how to solve this
        Fields & {
          [field in Name]: FieldOptions<Name, Zod, Optional>;
        }
      >(def, [...fields, options]),
  };
};

export const object = (
  def: Omit<
    ObjectFieldDef<never, never, never, never, never>,
    "description" | "fields" | "preview" | "type"
  > = {}
) => objectInternal<never, Record<never, never>>(def, []);
