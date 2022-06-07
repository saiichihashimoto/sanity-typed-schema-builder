import { faker } from "@faker-js/faker";
import { z } from "zod";

import type { FieldOptionKeys } from "../fields";
import type { SanityType, TypeValidation } from "../types";
import type { Faker } from "@faker-js/faker";
import type { Schema } from "@sanity/types";

interface DateType
  extends SanityType<
    Omit<TypeValidation<Schema.DateDefinition, string>, FieldOptionKeys>,
    z.ZodString
  > {}

export const date = (
  def: Omit<
    TypeValidation<Schema.DateDefinition, string>,
    FieldOptionKeys | "type"
  > & {
    mock?: (faker: Faker) => string;
  } = {}
): DateType => {
  const {
    mock = () =>
      `${`${faker.datatype.number({
        min: 1990,
        max: 2020,
      })}`.padStart(4, "0")}-${`${faker.datatype.number({
        min: 1,
        max: 12,
      })}`.padStart(2, "0")}-${`${faker.datatype.number({
        min: 1,
        max: 28,
      })}`.padStart(2, "0")}`,
  } = def;

  // TODO Check date validity against dateFormat with something like moment (moment is too big)
  const zod = z.string();

  return {
    zod,
    parse: zod.parse.bind(zod),
    mock: () => mock(faker),
    schema: () => ({
      ...def,
      type: "date",
    }),
  };
};
