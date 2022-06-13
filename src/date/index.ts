import { z } from "zod";

import { createType } from "../types";

import type { FieldOptionKeys } from "../field";
import type { TypeValidation } from "../types";
import type { Faker } from "@faker-js/faker";
import type { Schema } from "@sanity/types";

export const date = ({
  mock = (faker) =>
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
  ...def
}: Omit<
  TypeValidation<Schema.DateDefinition, string>,
  FieldOptionKeys | "type"
> & {
  mock?: (faker: Faker, path: string) => string;
} = {}) =>
  createType({
    mock,
    // TODO Check date validity against dateFormat with something like moment (moment is too big)
    zod: z.string(),
    schema: () => ({
      ...def,
      type: "date",
    }),
  });
