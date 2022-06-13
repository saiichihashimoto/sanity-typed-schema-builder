import { z } from "zod";

import { createType } from "../types";

import type { FieldOptionKeys } from "../field";
import type { TypeValidation } from "../types";
import type { Faker } from "@faker-js/faker";
import type { Schema } from "@sanity/types";

export const boolean = <Output = boolean>({
  mock = (faker) => faker.datatype.boolean(),
  zod: zodFn = (zod) => zod as unknown as z.ZodType<Output, any, boolean>,
  ...def
}: Omit<
  TypeValidation<Schema.BooleanDefinition, boolean>,
  FieldOptionKeys | "type"
> & {
  mock?: (faker: Faker, path: string) => boolean;
  zod?: (
    zod: z.ZodType<boolean, any, boolean>
  ) => z.ZodType<Output, any, boolean>;
} = {}) =>
  createType({
    mock,
    zod: zodFn(z.boolean()),
    schema: () => ({
      ...def,
      type: "boolean",
    }),
  });
