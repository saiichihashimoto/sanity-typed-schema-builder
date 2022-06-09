import { z } from "zod";

import { createType } from "../types";

import type { FieldOptionKeys } from "../field";
import type { SanityType, TypeValidation } from "../types";
import type { Faker } from "@faker-js/faker";
import type { Schema } from "@sanity/types";

export const boolean = ({
  mock = (faker) => faker.datatype.boolean(),
  ...def
}: Omit<
  TypeValidation<Schema.BooleanDefinition, boolean>,
  FieldOptionKeys | "type"
> & {
  mock?: (faker: Faker) => boolean;
} = {}): SanityType<
  Omit<TypeValidation<Schema.BooleanDefinition, boolean>, FieldOptionKeys>,
  z.ZodBoolean
> =>
  createType({
    mock,
    zod: z.boolean(),
    schema: () => ({
      ...def,
      type: "boolean",
    }),
  });
