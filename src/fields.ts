import { identity } from "lodash/fp";

import type { SanityType } from "./types";

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

export type InferName<T> = T extends FieldOptions<infer Name, any, any, any>
  ? Name
  : never;

export type InferZod<T> = T extends FieldOptions<
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
