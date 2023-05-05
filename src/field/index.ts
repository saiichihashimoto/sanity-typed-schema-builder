import type { s } from "@sanity-typed/schema-builder";
import type { FieldDefinition } from "sanity";
import type { z } from "zod";

import type { NamedSchemaFields, TupleOfLength } from "../types";

export type FieldOptions<
  Name extends string,
  Zod extends z.ZodTypeAny,
  ResolvedValue,
  Optional extends boolean
> = Pick<FieldDefinition, "description" | "fieldset" | "group" | "title"> & {
  name: Name;
  optional?: Optional;
  type: s.SanityType<
    Omit<FieldDefinition<any>, NamedSchemaFields>,
    z.input<Zod>,
    z.output<Zod>,
    ResolvedValue
  >;
};

export const sharedFields = <
  Names extends string,
  Zods extends z.ZodTypeAny,
  ResolvedValues,
  Optionals extends boolean,
  FieldsArray extends TupleOfLength<
    FieldOptions<Names, Zods, ResolvedValues, Optionals>,
    1
  >
>(
  fields: FieldsArray
) => fields;
