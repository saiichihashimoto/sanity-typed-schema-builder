import { fieldsSchema, fieldsZod } from "../fields";

import type { FieldOptions, InferOptional } from "../fields";
import type {
  InferInput,
  InferOutput,
  SanityType,
  UndefinedAsOptional,
} from "../types";

interface ObjectType<
  FieldNames extends string,
  Fields extends {
    [field in FieldNames]: FieldOptions<field, any, any, any>;
  }
> extends SanityType<
    ObjectFieldDef<never, never, FieldNames, never, never>,
    UndefinedAsOptional<{
      [field in keyof Fields]: InferOptional<Fields[field]> extends true
        ? InferInput<Fields[field]["type"]> | undefined
        : InferInput<Fields[field]["type"]>;
    }>,
    UndefinedAsOptional<{
      [field in keyof Fields]: InferOptional<Fields[field]> extends true
        ? InferOutput<Fields[field]["type"]> | undefined
        : InferOutput<Fields[field]["type"]>;
    }>
  > {
  field: <
    Name extends string,
    Input,
    Output,
    NewFieldNames extends FieldNames | Name,
    Optional extends boolean = false
  >(
    options: FieldOptions<Name, Input, Output, Optional>
  ) => ObjectType<
    NewFieldNames,
    // @ts-expect-error -- Not sure how to solve this
    Fields & {
      [field in Name]: FieldOptions<field, Input, Output, Optional>;
    }
  >;
}

const objectInternal = <
  FieldNames extends string,
  Fields extends {
    [field in FieldNames]: FieldOptions<field, any, any, any>;
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
      Input,
      Output,
      NewFieldNames extends FieldNames | Name,
      Optional extends boolean = false
    >(
      options: FieldOptions<Name, Input, Output, Optional>
    ) =>
      objectInternal<
        NewFieldNames,
        // @ts-expect-error -- Not sure how to solve this
        Fields & {
          [field in Name]: FieldOptions<field, Input, Output, Optional>;
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
