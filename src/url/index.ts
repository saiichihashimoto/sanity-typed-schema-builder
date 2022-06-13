import { z } from "zod";

import { createType } from "../types";

import type { FieldOptionKeys } from "../field";
import type { TypeValidation } from "../types";
import type { Faker } from "@faker-js/faker";
import type { Schema } from "@sanity/types";

export const url = <Output = string>({
  mock = (faker) => faker.internet.url(),
  zod: zodFn = (zod) => zod as unknown as z.ZodType<Output, any, string>,
  ...def
}: Omit<
  TypeValidation<Schema.UrlDefinition, string>,
  FieldOptionKeys | "type"
> & {
  mock?: (faker: Faker, path: string) => string;
  zod?: (zod: z.ZodType<string, any, string>) => z.ZodType<Output, any, string>;
} = {}) =>
  createType({
    mock,
    zod: zodFn(z.string().url()),
    schema: () => ({
      ...def,
      type: "url",
    }),
  });
