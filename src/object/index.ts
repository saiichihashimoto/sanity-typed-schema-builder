import { identity } from "lodash/fp";

import type { InferDefinition, InferValue, SanityType } from "../base";

interface FieldOptions<
  FieldNames extends string,
  Name extends string,
  Value,
  Definition extends FieldTypeFields<never, never, FieldNames | Name>,
  Optional extends boolean
> {
  name: Name;
  optional?: Optional;
  type: SanityType<Value, Definition>;
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
    {
      [field in keyof Fields as undefined extends InferValue<Fields[field]>
        ? never
        : field]: InferValue<Fields[field]>;
    } & {
      [field in keyof Fields as undefined extends InferValue<Fields[field]>
        ? field
        : never]?: InferValue<Fields[field]>;
    },
    ObjectFieldDef<never, never, FieldNames, never, never>
  > {
  field: <
    Name extends string,
    Value,
    Definition extends FieldTypeFields<never, never, FieldNames | Name>,
    Optional extends boolean = false
  >(
    options: FieldOptions<FieldNames, Name, Value, Definition, Optional>
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
      [Name in FieldNames]: FieldOptions<
        FieldNames,
        Name,
        InferValue<Fields[Name]>,
        InferDefinition<Fields[Name]>,
        InferValue<Fields[Name]> extends undefined ? true : false
      >;
    }[FieldNames]
  >
): ObjectType<FieldNames, Fields> => ({
  _value: undefined as unknown as InferValue<ObjectType<FieldNames, Fields>>,
  schema: () => ({
    ...def,
    type: "object",
    // @ts-expect-error -- FIXME Fix this now
    fields: fields.map(({ name, type, optional = false }) => {
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
  field: (options) =>
    // @ts-expect-error -- FIXME Technically, FieldNames and Name can overlap, which upsets this type system.
    objectInternal(def, [...fields, options]),
});

export const object = (
  def: Omit<
    InferDefinition<ObjectType<never, Record<never, never>>>,
    "fields" | "type"
  > = {}
): ObjectType<never, Record<never, never>> => objectInternal(def, []);
