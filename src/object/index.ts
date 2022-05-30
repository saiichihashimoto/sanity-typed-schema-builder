import { identity } from "lodash/fp";

import type { InferDefinition, InferValue, SanityType } from "../base";

type OnlyOptionalFromUndefined<T> = {
  [K in keyof T as undefined extends T[K] ? K : never]?: T[K];
};

type OptionalFromUndefined<T> = Omit<T, keyof OnlyOptionalFromUndefined<T>> &
  OnlyOptionalFromUndefined<T>;

interface FieldOptions<Optional extends boolean> {
  optional?: Optional;
}

interface ObjectType<
  FieldNames extends string,
  Fields extends {
    [field in FieldNames]: SanityType<
      any,
      FieldTypeFields<never, never, FieldNames>
    >;
  }
> extends SanityType<
    OptionalFromUndefined<{
      [field in keyof Fields]: InferValue<Fields[field]>;
    }>,
    ObjectFieldDef<never, never, FieldNames, never, never>
  > {
  field: <
    Name extends string,
    Value,
    Definition extends FieldTypeFields<never, never, FieldNames | Name>,
    Optional extends boolean = false
  >(
    name: Name,
    type: SanityType<Value, Definition>,
    options?: FieldOptions<Optional>
  ) => ObjectType<
    FieldNames | Name,
    Fields & {
      [name in Name]: SanityType<
        Optional extends false ? Value : Value | undefined,
        Definition
      >;
    }
  >;
}

const objectInternal = <
  FieldNames extends string,
  Fields extends {
    [field in FieldNames]: SanityType<
      any,
      FieldTypeFields<never, never, FieldNames>
    >;
  }
>(
  def: Omit<
    InferDefinition<ObjectType<never, Record<never, never>>>,
    "fields" | "type"
  >,
  fields: Array<
    {
      [field in FieldNames]: {
        name: field;
        options?: FieldOptions<
          InferValue<Fields[field]> extends undefined ? true : false
        >;
        type: Fields[field];
      };
    }[FieldNames]
  >
): ObjectType<FieldNames, Fields> => ({
  _value: undefined as unknown as OptionalFromUndefined<{
    [field in keyof Fields]: InferValue<Fields[field]>;
  }>,
  schema: () => ({
    ...def,
    type: "object",
    // @ts-expect-error -- FIXME Fix this now
    fields: fields.map(({ name, type, options: { optional = false } = {} }) => {
      const schema = type.schema();

      return {
        ...schema,
        name,
        validation: optional
          ? schema.validation
          : (rule: Parameters<NonNullable<typeof schema.validation>>[0]) =>
              // @ts-expect-error -- FIXME Fix this now
              (schema.validation ?? identity)(rule.required()),
      };
    }),
  }),
  field: (name, type, options) =>
    // @ts-expect-error -- FIXME Technically, FieldNames and Name can overlap, which upsets this type system.
    objectInternal(def, [...fields, { name, options, type }]),
});

export const object = (
  def: Omit<
    InferDefinition<ObjectType<never, Record<never, never>>>,
    "fields" | "type"
  > = {}
): ObjectType<never, Record<never, never>> => objectInternal(def, []);
