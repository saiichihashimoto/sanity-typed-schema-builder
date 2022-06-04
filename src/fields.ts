import { fromPairs, identity } from "lodash/fp";
import { z } from "zod";

import type { InferZod, SanityType } from "./types";

export interface FieldOptions<
  Name extends string,
  Zod extends z.ZodType<any, any, any>,
  Optional extends boolean
> {
  description?: string;
  name: Name;
  optional?: Optional;
  type: SanityType<FieldTypeFields<never, never, Name>, Zod>;
}

type InferName<T extends FieldOptions<any, any, any>> = T extends FieldOptions<
  infer Name,
  any,
  any
>
  ? Name
  : never;

export type InferType<T extends FieldOptions<any, any, any>> =
  T extends FieldOptions<any, any, any> ? T["type"] : never;

export type InferOptional<T extends FieldOptions<any, any, any>> =
  T extends FieldOptions<any, any, infer Optional> ? Optional : never;

export const fieldsSchema = <
  FieldNames extends string,
  Fields extends {
    [field in FieldNames]: FieldOptions<field, any, any>;
  }
>(
  fields: Array<Fields[FieldNames]>
) =>
  fields.map(({ name, type, optional, ...props }) => {
    const schema = type.schema();

    return {
      ...schema,
      ...props,
      name: name as FieldNames,
      validation: optional
        ? schema.validation
        : (rule: Parameters<NonNullable<typeof schema.validation>>[0]) =>
            // @ts-expect-error -- FIXME Fix this now
            (schema.validation ?? identity)(rule.required()),
    };
  });

export const fieldsZod = <
  FieldNames extends string,
  Fields extends {
    [field in FieldNames]: FieldOptions<field, any, any>;
  }
>(
  fields: Array<Fields[FieldNames]>
): z.ZodObject<
  {
    [field in FieldNames]: InferOptional<Fields[field]> extends true
      ? z.ZodOptional<InferZod<InferType<Fields[field]>>>
      : InferZod<InferType<Fields[field]>>;
  },
  "strip"
> => {
  type Tuple = {
    [field in FieldNames]: [
      InferName<Fields[field]>,
      InferOptional<Fields[field]> extends true
        ? z.ZodOptional<InferZod<InferType<Fields[field]>>>
        : InferZod<InferType<Fields[field]>>
    ];
  }[FieldNames];

  const tuples = fields.map(
    <
      Name extends string,
      Zod extends z.ZodType<any, any, any>,
      Optional extends boolean
    >({
      name,
      optional,
      type,
    }: FieldOptions<Name, Zod, Optional>) => [
      name,
      !optional ? type.zod : type.zod.optional(),
    ]
  ) as Tuple[];

  type ZodRawObject = {
    [field in FieldNames]: InferOptional<Fields[field]> extends true
      ? z.ZodOptional<InferZod<InferType<Fields[field]>>>
      : InferZod<InferType<Fields[field]>>;
  };

  return z.object(fromPairs(tuples) as ZodRawObject);
};
