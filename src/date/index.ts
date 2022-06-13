import { z } from "zod";

import { createType } from "../types";

import type { FieldOptionKeys } from "../field";
import type { TypeValidation } from "../types";
import type { Faker } from "@faker-js/faker";
import type { Schema } from "@sanity/types";

export const date = <Output = string>({
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
  zod: zodFn = (zod) => zod as unknown as z.ZodType<Output, any, string>,
  ...def
}: Omit<
  TypeValidation<Schema.DateDefinition, string>,
  FieldOptionKeys | "type"
> & {
  mock?: (faker: Faker, path: string) => string;
  zod?: (zod: z.ZodType<string, any, string>) => z.ZodType<Output, any, string>;
} = {}) =>
  createType({
    mock,
    // TODO Check date validity against dateFormat with something like moment (moment is too big)
    zod: zodFn(z.string()),
    schema: () => ({
      ...def,
      type: "date",
    }),
  });
