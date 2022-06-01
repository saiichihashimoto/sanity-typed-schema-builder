import { identity } from "lodash/fp";

import type { InferDefinition, InferValue, SanityType } from "../types";
import type { DocumentDef } from "@sanity/base";

interface FieldOptions<
  FieldNames extends string,
  Name extends string,
  Value,
  Definition extends FieldTypeFields<never, never, FieldNames | Name>,
  Optional extends boolean
> {
  description?: string;
  name: Name;
  optional?: Optional;
  type: SanityType<Value, Definition>;
}

interface DocumentType<
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
    } & {
      _createdAt: string;
      _rev: string;
      _type: string;
      _updatedAt: string;
    },
    DocumentDef<string, never, FieldNames, never, never, never>
  > {
  field: <
    Name extends string,
    Value,
    Definition extends FieldTypeFields<never, never, FieldNames | Name>,
    Optional extends boolean = false
  >(
    options: FieldOptions<FieldNames, Name, Value, Definition, Optional>
  ) => DocumentType<
    FieldNames | Name,
    Fields & {
      [name in Name]: SanityType<
        Optional extends false ? Value : Value | undefined,
        Definition
      >;
    }
  >;
}

const documentInternal = <
  FieldNames extends string,
  Fields extends {
    [field in FieldNames]: SanityType<
      any,
      FieldTypeFields<never, never, FieldNames>
    >;
  }
>(
  def: Omit<
    InferDefinition<DocumentType<never, Record<never, never>>>,
    "description" | "fields" | "type"
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
): DocumentType<FieldNames, Fields> => ({
  _value: undefined as unknown as InferValue<DocumentType<FieldNames, Fields>>,
  schema: () => ({
    ...def,
    type: "document",
    // @ts-expect-error -- FIXME Fix this now
    fields: fields.map(({ type, optional = false, ...props }) => {
      const schema = type.schema();

      return {
        ...schema,
        ...props,
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
    documentInternal(def, [...fields, options]),
});

export const document = (
  def: Omit<
    InferDefinition<DocumentType<never, Record<never, never>>>,
    "fields" | "type"
  >
): DocumentType<never, Record<never, never>> => documentInternal(def, []);
