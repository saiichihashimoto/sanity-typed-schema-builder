import { z } from "zod";

import { createType } from "../types";

import type { FieldOptionKeys } from "../field";
import type { SanityType, TypeValidation } from "../types";
import type { Faker } from "@faker-js/faker";
import type { Schema } from "@sanity/types";

export const url = ({
  mock = (faker) => faker.internet.url(),
  ...def
}: Omit<
  TypeValidation<Schema.UrlDefinition, string>,
  FieldOptionKeys | "type"
> & {
  mock?: (faker: Faker, path: string) => string;
} = {}): SanityType<
  Omit<TypeValidation<Schema.UrlDefinition, string>, FieldOptionKeys>,
  z.ZodString
> =>
  createType({
    mock,
    zod: z.string().url(),
    schema: () => ({
      ...def,
      type: "url",
    }),
  });
