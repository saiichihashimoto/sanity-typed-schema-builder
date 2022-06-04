import { faker } from "@faker-js/faker";

import type { FieldsType, InferFieldNames, InferFieldsZod } from "../fields";
import type { SanityType } from "../types";
import type { Faker } from "@faker-js/faker";
import type { z } from "zod";

interface ObjectType<Fields extends FieldsType<any, any>>
  extends SanityType<
    ObjectFieldDef<never, never, InferFieldNames<Fields>, never, never>,
    InferFieldsZod<Fields>
  > {}

export const object = <Fields extends FieldsType<any, any>>(
  def: Omit<
    ObjectFieldDef<never, never, InferFieldNames<Fields>, never, never>,
    "description" | "fields" | "type"
  > & {
    fields: Fields;
    mock?: (faker: Faker) => z.input<InferFieldsZod<Fields>>;
  }
): ObjectType<Fields> => {
  const {
    fields: { schema: fieldsSchema, mock: fieldsMock, zod: fieldsZod },
    mock = fieldsMock,
  } = def;
  const zod = fieldsZod as InferFieldsZod<Fields>;

  return {
    zod,
    parse: zod.parse.bind(zod),
    mock: () => mock(faker),
    schema: () => ({
      ...def,
      type: "object",
      fields: fieldsSchema(),
    }),
  };
};
