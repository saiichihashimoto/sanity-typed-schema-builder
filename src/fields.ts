import { fromPairs, identity } from "lodash/fp";
import { z } from "zod";

import type {
  InferInput,
  InferOutput,
  SanityType,
  UndefinedAsOptional,
} from "./types";
import type { ZodObject, ZodTypeAny } from "zod";

export interface FieldOptions<
  Name extends string,
  Input,
  Output,
  Optional extends boolean
> {
  description?: string;
  name: Name;
  optional?: Optional;
  type: SanityType<FieldTypeFields<never, never, Name>, Input, Output>;
}

type InferName<T> = T extends FieldOptions<infer Name, any, any, any>
  ? Name
  : never;

type InferZod<T> = T extends FieldOptions<
  infer Name,
  infer Input,
  infer Output,
  any
>
  ? SanityType<FieldTypeFields<never, never, Name>, Input, Output>["zod"]
  : never;

export type InferOptional<T> = T extends FieldOptions<
  any,
  any,
  any,
  infer Optional
>
  ? Optional
  : never;

export const fieldsSchema = <
  FieldNames extends string,
  Fields extends {
    [field in FieldNames]: FieldOptions<field, any, any, any>;
  }
>(
  fields: Array<Fields[FieldNames]>
): ObjectLikeDef<never, never, FieldNames, never, never, never>["fields"] =>
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
    [field in FieldNames]: FieldOptions<field, any, any, any>;
  }
>(
  fields: Array<Fields[FieldNames]>
) => {
  type Tuple = {
    [field in FieldNames]: [
      InferName<Fields[field]>,
      InferOptional<Fields[field]> extends true
        ? z.ZodOptional<InferZod<Fields[field]>>
        : InferZod<Fields[field]>
    ];
  }[FieldNames];

  const tuples = fields.map(
    ({ name, optional, type }) =>
      [name, !optional ? type.zod : type.zod.optional()] as const
  ) as Tuple[];

  type ZodRawObject = {
    [field in FieldNames as InferName<Fields[field]>]: InferOptional<
      Fields[field]
    > extends true
      ? z.ZodOptional<InferZod<Fields[field]>>
      : InferZod<Fields[field]>;
  };

  return z.object(fromPairs(tuples) as ZodRawObject) as unknown as ZodObject<
    ZodRawObject,
    "strip",
    ZodTypeAny,
    UndefinedAsOptional<{
      [field in keyof Fields]: InferOptional<Fields[field]> extends true
        ? InferOutput<Fields[field]["type"]> | undefined
        : InferOutput<Fields[field]["type"]>;
    }>,
    UndefinedAsOptional<{
      [field in keyof Fields]: InferOptional<Fields[field]> extends true
        ? InferInput<Fields[field]["type"]> | undefined
        : InferInput<Fields[field]["type"]>;
    }>
  >;
};
