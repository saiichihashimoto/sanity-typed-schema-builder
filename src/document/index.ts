import { identity } from "lodash/fp";

import type { InferDefinition, InferValue, SanityType } from "../base";
import type { DocumentDef } from "@sanity/base";

interface FieldOptions<Optional extends boolean> {
  optional?: Optional;
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
    name: Name,
    type: SanityType<Value, Definition>,
    options?: FieldOptions<Optional>
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
): DocumentType<FieldNames, Fields> => ({
  _value: undefined as unknown as InferValue<DocumentType<FieldNames, Fields>>,
  schema: () => ({
    ...def,
    type: "document",
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
    documentInternal(def, [...fields, { name, options, type }]),
});

export const document = (
  def: Omit<
    InferDefinition<DocumentType<never, Record<never, never>>>,
    "fields" | "type"
  >
): DocumentType<never, Record<never, never>> => documentInternal(def, []);
