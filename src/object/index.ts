import { fromPairs } from "lodash/fp";
import { z } from "zod";

import { fieldsSchema } from "../fields";

import type {
  FieldOptions,
  InferName,
  InferOptional,
  InferZod,
} from "../fields";
import type {
  InferInput,
  InferOutput,
  SanityType,
  UndefinedAsOptional,
} from "../types";
import type { ZodType } from "zod";

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

  type ZodObject = {
    [field in FieldNames as InferName<Fields[field]>]: InferOptional<
      Fields[field]
    > extends true
      ? z.ZodOptional<InferZod<Fields[field]>>
      : InferZod<Fields[field]>;
  };

  const zod = z.object(fromPairs(tuples) as ZodObject) as unknown as ZodType<
    InferOutput<ObjectType<FieldNames, Fields>>,
    any,
    InferInput<ObjectType<FieldNames, Fields>>
  >;

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
