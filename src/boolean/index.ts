import { z } from "zod";

import type { FieldOptionKeys } from "../fields";
import type { SanityType, TypeValidation } from "../types";
import type { Faker } from "@faker-js/faker";
import type { Schema } from "@sanity/types";

interface BooleanType
  extends SanityType<
    Omit<TypeValidation<Schema.BooleanDefinition, boolean>, FieldOptionKeys>,
    z.ZodBoolean
  > {}

export const boolean = (
  def: Omit<
    TypeValidation<Schema.BooleanDefinition, boolean>,
    FieldOptionKeys | "type"
  > & {
    mock?: (faker: Faker) => boolean;
  } = {}
): BooleanType => {
  const { mock = (faker) => faker.datatype.boolean() } = def;

  const zod = z.boolean();

  return {
    zod,
    parse: zod.parse.bind(zod),
    mock,
    schema: () => ({
      ...def,
      type: "boolean",
    }),
  };
};
